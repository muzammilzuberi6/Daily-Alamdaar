// Uploaded images / PDFs. Local: ./uploads folder. Cloud (Vercel): Vercel Blob (free, no card).
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const REMOTE = !!TOKEN;
const DIR = path.join(process.env.DATA_DIR || path.join(__dirname, '..'), 'uploads');
// Blob public URLs look like https://<storeId>.public.blob.vercel-storage.com/<pathname>
const BASE = REMOTE ? `https://${(TOKEN.split('_')[3] || '').toLowerCase()}.public.blob.vercel-storage.com` : '';
const blob = REMOTE ? require('@vercel/blob') : null;
if (!REMOTE) { try { fs.mkdirSync(DIR, { recursive: true }); } catch {} }

const files = {
  remote: REMOTE, dir: DIR, base: BASE,
  url: rel => REMOTE ? `${BASE}/uploads/${rel}` : `/uploads/${rel}`,
  async put(rel, buf, contentType) {
    if (!REMOTE) { const f = path.join(DIR, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, buf); return; }
    await blob.put('uploads/' + rel, buf, { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType, cacheControlMaxAge: 31536000 });
  },
  async read(rel) {
    if (!REMOTE) return fs.readFileSync(path.join(DIR, rel));
    const r = await fetch(files.url(rel)); if (!r.ok) throw new Error('missing ' + rel);
    return Buffer.from(await r.arrayBuffer());
  },
  async exists(rel) {
    if (!REMOTE) return fs.existsSync(path.join(DIR, rel));
    try { const r = await fetch(files.url(rel) + '?x=' + Date.now(), { method: 'HEAD' }); return r.ok; } catch { return false; }
  },
  async del(rels) {
    if (!rels.length) return;
    if (!REMOTE) { rels.forEach(r => fs.rmSync(path.join(DIR, r), { force: true })); return; }
    await blob.del(rels.map(files.url)).catch(() => {});
  },
  async delPrefix(prefix) {
    if (!REMOTE) { fs.rmSync(path.join(DIR, prefix), { recursive: true, force: true }); return; }
    let cursor, guard = 0;
    do {
      const r = await blob.list({ prefix: 'uploads/' + prefix, cursor });
      if (r.blobs.length) await blob.del(r.blobs.map(b => b.url));
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor && ++guard < 20);
  },
};
module.exports = files;
