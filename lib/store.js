// JSON data store. Local: files in ./data. Cloud (Vercel): Upstash Redis over REST (free tier, no card).
// Reads are synchronous from an in-memory cache; writes are flushed to Redis before the response is sent.
const fs = require('fs');
const path = require('path');

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const REMOTE = !!(URL_ && TOKEN);
const DIR = path.join(process.env.DATA_DIR || path.join(__dirname, '..'), 'data');
const FIXED = ['editions', 'settings', 'messages', 'admin', 'articles:index'];

const cache = new Map();
const dirty = new Set();
const removed = new Set();
let loadedAt = 0, loading = null;

if (!REMOTE) { try { fs.mkdirSync(DIR, { recursive: true }); } catch {} }
const file = k => path.join(DIR, k + '.json');
const readLocal = (k, d) => { try { return JSON.parse(fs.readFileSync(file(k), 'utf8')); } catch { return d; } };
const writeLocal = (k, o) => { fs.writeFileSync(file(k) + '.tmp', JSON.stringify(o, null, 2)); fs.renameSync(file(k) + '.tmp', file(k)); };

async function call(pathSuffix, body) {
  const r = await fetch(URL_ + pathSuffix, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok || (j && j.error)) throw new Error('Redis: ' + (j.error || r.status));
  return j;
}
const parse = s => { try { return s == null ? undefined : JSON.parse(s); } catch { return undefined; } };

async function loadRemote() {
  const fixed = (await call('', ['MGET', ...FIXED])).result;
  FIXED.forEach((k, i) => { const v = parse(fixed[i]); if (v === undefined) cache.delete(k); else cache.set(k, v); });
  const idx = cache.get('articles:index') || [];
  for (const k of [...cache.keys()]) if (k.startsWith('articles:') && k !== 'articles:index' && !idx.includes(k)) cache.delete(k);
  if (idx.length) {
    const vals = (await call('', ['MGET', ...idx])).result;
    idx.forEach((k, i) => { const v = parse(vals[i]); if (v !== undefined) cache.set(k, v); });
  }
  loadedAt = Date.now();
}

const store = {
  remote: REMOTE,
  async ready() {
    if (!REMOTE) { if (process.env.VERCEL) throw new Error('Redis is not connected (add Upstash Redis in Vercel Storage)'); return; }
    if (loadedAt && (Date.now() - loadedAt < 4000 || dirty.size)) return;
    if (!loading) loading = loadRemote().finally(() => { loading = null; });
    await loading;
  },
  get(k, d) { if (!REMOTE) return readLocal(k, d); return cache.has(k) ? cache.get(k) : d; },
  set(k, v) { if (!REMOTE) return writeLocal(k, v); cache.set(k, v); dirty.add(k); },
  async flush() {
    if (!REMOTE || (!dirty.size && !removed.size)) return;
    const cmds = [...dirty].map(k => ['SET', k, JSON.stringify(cache.get(k))]).concat([...removed].map(k => ['DEL', k]));
    dirty.clear(); removed.clear();
    const res = await call('/pipeline', cmds);
    const bad = res.find(r => r.error); if (bad) throw new Error('Redis: ' + bad.error);
    loadedAt = Date.now();
  },
  // Articles are split into half-month shards in Redis so no single value gets too large.
  getArticles() {
    if (!REMOTE) return readLocal('articles', []);
    return (cache.get('articles:index') || []).flatMap(k => cache.get(k) || []);
  },
  setArticles(all) {
    if (!REMOTE) return writeLocal('articles', all);
    const groups = {};
    for (const a of all) { const k = `articles:${a.at.slice(0, 7)}-${Number(a.at.slice(8, 10)) <= 15 ? 'a' : 'b'}`; (groups[k] ||= []).push(a); }
    const oldIdx = cache.get('articles:index') || [];
    for (const k of Object.keys(groups)) if (JSON.stringify(cache.get(k)) !== JSON.stringify(groups[k])) { cache.set(k, groups[k]); dirty.add(k); }
    oldIdx.filter(k => !groups[k]).forEach(k => { cache.delete(k); dirty.delete(k); removed.add(k); });
    const idx = Object.keys(groups).sort();
    if (JSON.stringify(idx) !== JSON.stringify(oldIdx)) { cache.set('articles:index', idx); dirty.add('articles:index'); }
  },
};
module.exports = store;
