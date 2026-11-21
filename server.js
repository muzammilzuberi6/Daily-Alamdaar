// Daily Alamdaar - news portal + e-paper server (runs locally and on Vercel)
require('fs').existsSync('.env') && require('fs').readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
});
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { buildPdf } = require('./lib/pdf');
const store = require('./lib/store');
const files = require('./lib/files');

const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
if (!ADMIN_PASSWORD) { console.error('ADMIN_PASSWORD missing (set it in .env or the host environment)'); if (!process.env.VERCEL) process.exit(1); }
// stable across serverless instances when SESSION_SECRET is not set
const SECRET = process.env.SESSION_SECRET || crypto.createHash('sha256').update('alamdaar-session:' + ADMIN_PASSWORD).digest('hex');
const ROOT = __dirname;

// ---------- data helpers (editions / settings / messages / admin) ----------
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const validDate = d => DATE_RE.test(d) && !isNaN(Date.parse(d + 'T00:00:00Z'));
const load = () => store.get('editions', { editions: [] });
const save = db => store.set('editions', db);
const readJson = (k, d) => store.get(k, d);
const writeJson = (k, o) => store.set(k, o);
const SETTINGS_FILE = 'settings', MESSAGES_FILE = 'messages', ADMIN_FILE = 'admin';
const DEFAULT_SETTINGS = {
  chiefEditor: { en: 'Khalid Hussain Zuberi', ur: 'خالد حسین زبیری', phone: '03235419676', email: 'dailyalamdaar@gmail.com' },
  chiefExec: { en: 'Humair Alam Zuberi', ur: 'حمیر عالم زبیری' },
  publisher: { en: 'Sana Aamir', ur: 'ثناء عامر' },
  email: 'dailyalamdaar@gmail.com',
  phones: ['03235419676', '051-5532888'],
  whatsapp: '923235419676',
  address: { en: 'O 924-A, Ferozpura, Opp. Gul Noor Market, Murree Road, Rawalpindi', ur: 'او 924-اے، فیروز پورہ، گل نور مارکیٹ کے سامنے، مری روڈ، راولپنڈی' },
};
const settings = () => ({ ...DEFAULT_SETTINGS, ...readJson(SETTINGS_FILE, {}) });

// ---------- auth (HMAC signed cookie) ----------
const sign = v => crypto.createHmac('sha256', SECRET).update(v).digest('hex');
const makeToken = () => { const exp = Date.now() + 12 * 3600e3; const p = `${ADMIN_USER}.${exp}`; return `${p}.${sign(p)}`; };
const checkToken = t => {
  if (!t) return false; const [u, exp, sig] = t.split('.');
  if (!sig || u !== ADMIN_USER || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(`${u}.${exp}`));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const safeEq = (a, b) => { const x = crypto.createHash('sha256').update(a).digest(), y = crypto.createHash('sha256').update(b).digest(); return crypto.timingSafeEqual(x, y); };
const requireAdmin = (req, res, next) => checkToken(req.cookies.admin) ? next() : res.status(401).json({ error: 'Login required' });
const fails = new Map();
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex');
function passwordOk(pw) {
  const a = readJson(ADMIN_FILE, null);
  if (a && a.hash) return safeEq(hashPw(pw, a.salt), a.hash);
  return safeEq(pw, ADMIN_PASSWORD);
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

// cloud mode: load data before each request and save it before the response leaves
app.use(async (req, res, next) => {
  if (!store.remote) return next();
  try { await store.ready(); } catch (e) { console.error(e); return res.status(503).json({ error: 'Storage unavailable. Try again.' }); }
  const end = res.end;
  res.end = function (...args) { store.flush().catch(e => console.error('flush failed', e)).finally(() => end.apply(res, args)); return res; };
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
  next();
});

app.post('/api/auth/login', (req, res) => {
  const ip = req.ip, f = fails.get(ip) || { n: 0, t: Date.now() };
  if (f.n >= 8 && Date.now() - f.t < 15 * 60e3) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
  const { username = '', password = '' } = req.body || {};
  if (safeEq(String(username), ADMIN_USER) && passwordOk(String(password))) {
    fails.delete(ip);
    res.cookie('admin', makeToken(), { httpOnly: true, sameSite: 'strict', secure: req.secure, maxAge: 12 * 3600e3 });
    return res.json({ ok: true });
  }
  fails.set(ip, { n: f.n + 1, t: Date.now() });
  res.status(401).json({ error: 'Invalid username or password' });
});
app.post('/api/auth/logout', (req, res) => { res.clearCookie('admin'); res.json({ ok: true }); });
app.get('/api/auth/me', (req, res) => res.json({ admin: checkToken(req.cookies.admin) }));

// ---------- e-paper editions ----------
const pub = e => ({
  date: e.date, vol: e.vol, issue: e.issue, published: e.published, pageCount: e.pages.length, views: e.views || 0,
  pages: e.pages.map((p, i) => ({
    n: i + 1,
    full: `${files.url(`${e.date}/${p}.webp`)}?v=${e.updated}`,
    thumb: `${files.url(`${e.date}/${p}-t.webp`)}?v=${e.updated}`,
  })),
});
const sorted = db => db.editions.slice().sort((a, b) => b.date.localeCompare(a.date));
const visible = db => sorted(db).filter(e => e.published && e.pages.length);

app.get('/api/editions', (req, res) => {
  let list = visible(load());
  if (req.query.month && /^\d{4}-\d{2}$/.test(req.query.month)) list = list.filter(e => e.date.startsWith(req.query.month));
  res.json(list.map(pub));
});
app.get('/api/editions/latest', (req, res) => { const e = visible(load())[0]; e ? res.json(pub(e)) : res.status(404).json({ error: 'No edition yet' }); });
app.get('/api/editions/:date', (req, res) => {
  const e = visible(load()).find(x => x.date === req.params.date);
  e ? res.json(pub(e)) : res.status(404).json({ error: 'Edition not found' });
});

// local uploads folder, or redirect to Vercel Blob
if (files.remote) app.use('/uploads', (req, res) => res.redirect(302, files.base + '/uploads' + req.url));
else app.use('/uploads', express.static(files.dir, { maxAge: '7d', index: false, dotfiles: 'deny' }));

app.get('/api/admin/editions', requireAdmin, (req, res) => res.json(sorted(load()).map(pub)));
app.get('/api/admin/suggest', requireAdmin, (req, res) => {
  const last = sorted(load())[0];
  res.json({ vol: last ? last.vol : 'XVII', issue: last ? Number(last.issue) + 1 : 1 });
});

const imgFilter = (req, file, cb) => cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
const pageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024, files: 1 }, fileFilter: imgFilter });

async function processImage(buf, relBase, fullW, thumbW) {
  const img = sharp(buf, { failOn: 'error', limitInputPixels: 200e6 }).rotate();
  const [full, thumb] = await Promise.all([
    img.clone().resize({ width: fullW, withoutEnlargement: true }).webp({ quality: 86 }).toBuffer(),
    img.clone().resize({ width: thumbW, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer(),
  ]);
  await Promise.all([files.put(relBase + '.webp', full, 'image/webp'), files.put(relBase + '-t.webp', thumb, 'image/webp')]);
}
const PAGE_ID = /^p\d+-[a-z0-9]+$/;

// Step 1 of an upload: one page image at a time (keeps each request small enough for the host)
app.post('/api/admin/pages', requireAdmin, pageUpload.single('image'), async (req, res) => {
  try {
    const date = String(req.body.date || '');
    if (!validDate(date)) return res.status(400).json({ error: 'Invalid date' });
    if (!req.file) return res.status(400).json({ error: 'No image received (use JPG, PNG or WebP).' });
    const id = `p${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    await processImage(req.file.buffer, `${date}/${id}`, 2200, 360);
    res.json({ ok: true, id });
  } catch (err) { console.error(err); res.status(400).json({ error: 'Could not process that image.' }); }
});

// Step 2: save the edition (date, numbers, and the final list of page ids in order)
app.post('/api/admin/editions', requireAdmin, async (req, res) => {
  try {
    const { date, vol = '', issue = '', order = [], published } = req.body || {};
    if (!validDate(date)) return res.status(400).json({ error: 'Invalid date' });
    if (!Array.isArray(order) || !order.length || order.length > 24 || !order.every(id => PAGE_ID.test(String(id)))) return res.status(400).json({ error: 'No pages received.' });
    const db = load();
    let ed = db.editions.find(e => e.date === date);
    const isNew = !ed;
    if (!ed) { ed = { date, pages: [], views: 0 }; db.editions.push(ed); }
    const pages = order.map(String);
    const gone = ed.pages.filter(p => !pages.includes(p));
    await files.del(gone.flatMap(p => [`${date}/${p}.webp`, `${date}/${p}-t.webp`]).concat(`${date}/edition.pdf`));
    Object.assign(ed, { vol: String(vol).slice(0, 12), issue: String(issue).slice(0, 8), published: published === true || published === 'true', pages, updated: Date.now() });
    save(db);
    res.json({ ok: true, created: isNew, edition: pub(ed) });
  } catch (err) { console.error(err); res.status(400).json({ error: 'Could not save the edition.' }); }
});

app.patch('/api/admin/editions/:date/publish', requireAdmin, (req, res) => {
  const db = load(); const e = db.editions.find(x => x.date === req.params.date);
  if (!e) return res.status(404).json({ error: 'Not found' });
  e.published = !!req.body.published; save(db); res.json({ ok: true });
});
app.delete('/api/admin/editions/:date', requireAdmin, async (req, res) => {
  const d = req.params.date; if (!validDate(d)) return res.status(400).json({ error: 'Invalid date' });
  const db = load(); db.editions = db.editions.filter(e => e.date !== d); save(db);
  await files.delPrefix(d + '/');
  res.json({ ok: true });
});

// ---------- full edition PDF (built once, then cached) ----------
const building = new Map();
app.get('/api/editions/:date/pdf', async (req, res) => {
  const e = visible(load()).find(x => x.date === req.params.date);
  if (!e) return res.status(404).json({ error: 'Edition not found' });
  const rel = `${e.date}/edition.pdf`;
  try {
    if (!(await files.exists(rel))) {
      if (!building.has(e.date)) building.set(e.date, buildPdf(e.pages, id => files.read(`${e.date}/${id}.webp`), sharp).then(b => files.put(rel, b, 'application/pdf')).finally(() => building.delete(e.date)));
      await building.get(e.date);
    }
    if (files.remote) return res.redirect(302, files.url(rel) + `?download=1`);
    res.download(path.join(files.dir, rel), `Daily-Alamdaar-${e.date}.pdf`);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Could not build PDF' }); }
});

// ---------- edition views counter ----------
const seen = new Map();
app.post('/api/view/:date', (req, res) => {
  const k = req.ip + req.params.date;
  if (!seen.has(k) || Date.now() - seen.get(k) > 30 * 60e3) {
    seen.set(k, Date.now());
    if (seen.size > 5000) seen.clear();
    const db = load(), e = visible(db).find(x => x.date === req.params.date);
    if (e) { e.views = (e.views || 0) + 1; save(db); }
  }
  res.json({ ok: true });
});

// ---------- settings (public read, admin write) ----------
app.get('/api/settings', (req, res) => res.json(settings()));
app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const b = req.body || {}, s = settings(), str = (v, n = 200) => String(v ?? '').trim().slice(0, n);
  const next = {
    ...s,
    chiefEditor: { ...s.chiefEditor, en: str(b.chiefEditorEn) || s.chiefEditor.en, ur: str(b.chiefEditorUr) || s.chiefEditor.ur, phone: str(b.chiefEditorPhone, 30), email: str(b.chiefEditorEmail, 120) },
    chiefExec: { en: str(b.chiefExecEn) || s.chiefExec.en, ur: str(b.chiefExecUr) || s.chiefExec.ur },
    publisher: { en: str(b.publisherEn) || s.publisher.en, ur: str(b.publisherUr) || s.publisher.ur },
    email: str(b.email, 120),
    phones: str(b.phones, 200).split(/[,\n]/).map(x => x.trim()).filter(Boolean).slice(0, 5),
    whatsapp: str(b.whatsapp, 20).replace(/\D/g, ''),
    address: { en: str(b.addressEn, 300), ur: str(b.addressUr, 300) },
  };
  writeJson(SETTINGS_FILE, next); res.json({ ok: true, settings: next });
});

// ---------- change admin password ----------
app.post('/api/admin/password', requireAdmin, (req, res) => {
  const { current = '', next = '' } = req.body || {};
  if (!passwordOk(String(current))) return res.status(400).json({ error: 'Current password is wrong' });
  if (String(next).length < 10) return res.status(400).json({ error: 'New password must be at least 10 characters' });
  const salt = crypto.randomBytes(16).toString('hex');
  writeJson(ADMIN_FILE, { salt, hash: hashPw(String(next), salt) });
  res.json({ ok: true });
});

// ---------- contact form + inbox ----------
let mailer = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE || 'true') !== 'false',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  console.log('Email notifications: ON (' + process.env.SMTP_HOST + ')');
} else console.log('Email notifications: OFF (messages are saved in the admin inbox). Set SMTP_* to enable.');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactHits = new Map();
app.post('/api/contact', async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot
  const h = (contactHits.get(req.ip) || []).filter(t => Date.now() - t < 3600e3);
  if (h.length >= 5) return res.status(429).json({ error: 'Too many messages. Please try later.' });
  const name = String(b.name || '').trim().slice(0, 100), email = String(b.email || '').trim().slice(0, 150),
    phone = String(b.phone || '').trim().slice(0, 30), subject = String(b.subject || '').trim().slice(0, 150),
    message = String(b.message || '').trim().slice(0, 4000);
  if (!name || message.length < 5) return res.status(400).json({ error: 'Please enter your name and message.' });
  if (!EMAIL_RE.test(email) && !phone) return res.status(400).json({ error: 'Please give a valid email or phone number.' });
  contactHits.set(req.ip, [...h, Date.now()]);
  const msgs = readJson(MESSAGES_FILE, []);
  const rec = { id: crypto.randomBytes(6).toString('hex'), at: new Date().toISOString(), name, email, phone, subject, message, read: false };
  msgs.unshift(rec); writeJson(MESSAGES_FILE, msgs.slice(0, 200));
  if (mailer) {
    try {
      await mailer.sendMail({
        from: `"Daily Alamdaar Website" <${process.env.SMTP_USER}>`, to: process.env.MAIL_TO || settings().email,
        replyTo: EMAIL_RE.test(email) ? email : undefined,
        subject: `[Website] ${subject || 'New message'} - ${name}`.replace(/[\r\n]+/g, ' '),
        text: `From: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`,
      });
    } catch (e) { console.error('Mail failed:', e.message); }
  }
  res.json({ ok: true });
});
app.get('/api/admin/messages', requireAdmin, (req, res) => res.json(readJson(MESSAGES_FILE, [])));
app.patch('/api/admin/messages/:id', requireAdmin, (req, res) => {
  const m = readJson(MESSAGES_FILE, []), x = m.find(i => i.id === req.params.id);
  if (x) { x.read = !!req.body.read; writeJson(MESSAGES_FILE, m); }
  res.json({ ok: true });
});
app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
  writeJson(MESSAGES_FILE, readJson(MESSAGES_FILE, []).filter(i => i.id !== req.params.id)); res.json({ ok: true });
});

// ---------- NEWS ARTICLES ----------
const CATS = ['pakistan', 'islamabad', 'world', 'business', 'sports', 'entertainment', 'opinion'];
const loadA = () => store.getArticles();
const saveA = a => store.setArticles(a);

const isLive = a => a.published && new Date(a.at).getTime() <= Date.now() + 60e3;
const artPub = a => ({
  id: a.id, category: a.category, lang: a.lang, title: a.title, summary: a.summary, author: a.author, at: a.at,
  breaking: !!a.breaking, featured: !!a.featured, views: a.views || 0, caption: a.caption || '',
  image: a.image ? `${files.url(`articles/${a.id}.webp`)}?v=${a.updated}` : null,
  thumb: a.image ? `${files.url(`articles/${a.id}-t.webp`)}?v=${a.updated}` : null,
});
const newest = (x, y) => y.at.localeCompare(x.at);

// Filter + language preference (fallback fills with the other language so sections never look empty)
function pick(list, { lang, limit = 10, fallback = true }) {
  const same = list.filter(a => !lang || a.lang === lang);
  if (!fallback || same.length >= limit) return same.slice(0, limit);
  const other = list.filter(a => lang && a.lang !== lang);
  return [...same, ...other].slice(0, limit);
}

app.get('/api/articles', (req, res) => {
  const { category, lang, q, sort } = req.query;
  const limit = Math.min(Number(req.query.limit) || 12, 60), offset = Math.max(Number(req.query.offset) || 0, 0);
  let list = loadA().filter(isLive);
  if (CATS.includes(category)) list = list.filter(a => a.category === category);
  if (req.query.exclude) list = list.filter(a => a.id !== req.query.exclude);
  if (q) { const s = String(q).toLowerCase().slice(0, 80); list = list.filter(a => (a.title + ' ' + a.summary + ' ' + a.body).toLowerCase().includes(s)); }
  list.sort(sort === 'popular' ? (x, y) => (y.views || 0) - (x.views || 0) || newest(x, y) : newest);
  const lg = ['en', 'ur'].includes(lang) ? lang : null;
  if (q || offset) {
    const f = lg && req.query.only ? list.filter(a => a.lang === lg) : list;
    return res.json({ total: f.length, items: f.slice(offset, offset + limit).map(artPub) });
  }
  const items = pick(list, { lang: lg, limit, fallback: req.query.fallback !== '0' });
  res.json({ total: list.length, items: items.map(artPub) });
});

// One call for the whole home page
app.get('/api/home', (req, res) => {
  const lg = ['en', 'ur'].includes(req.query.lang) ? req.query.lang : 'en';
  const all = loadA().filter(isLive).sort(newest);
  const prefer = list => pick(list, { lang: lg, limit: 1000 });
  const mine = prefer(all);
  const used = new Set();
  const take = (list, n) => { const out = []; for (const a of list) { if (out.length >= n) break; if (!used.has(a.id)) { used.add(a.id); out.push(a); } } return out; };
  let lead = take(mine.filter(a => a.featured), 1); if (!lead.length) lead = take(mine, 1);
  let topFill = take(mine.filter(a => a.featured), 4); if (topFill.length < 4) topFill = topFill.concat(take(mine, 4 - topFill.length));
  const sections = {};
  CATS.forEach(c => { const l = take(prefer(all.filter(a => a.category === c)), 5); if (l.length) sections[c] = l.map(artPub); });
  const latest = pick(all, { lang: lg, limit: 10 }).map(artPub);
  const breaking = all.filter(a => a.breaking && Date.now() - new Date(a.at) < 3 * 864e5).slice(0, 8).map(artPub);
  const popular = pick(all.filter(a => Date.now() - new Date(a.at) < 14 * 864e5).sort((x, y) => (y.views || 0) - (x.views || 0)), { lang: lg, limit: 6 }).map(artPub);
  res.json({ lead: lead.map(artPub)[0] || null, top: topFill.map(artPub), sections, latest, breaking, popular, total: all.length });
});

app.get('/api/articles/:id', (req, res) => {
  const a = loadA().find(x => x.id === req.params.id);
  if (!a || (!isLive(a) && !checkToken(req.cookies.admin))) return res.status(404).json({ error: 'Article not found' });
  res.json({ ...artPub(a), body: a.body, published: a.published });
});
const aSeen = new Map();
app.post('/api/articles/:id/view', (req, res) => {
  const k = req.ip + req.params.id;
  if (!aSeen.has(k) || Date.now() - aSeen.get(k) > 30 * 60e3) {
    aSeen.set(k, Date.now()); if (aSeen.size > 8000) aSeen.clear();
    const all = loadA(), a = all.find(x => x.id === req.params.id);
    if (a && isLive(a)) { a.views = (a.views || 0) + 1; saveA(all); }
  }
  res.json({ ok: true });
});

// admin
app.get('/api/admin/articles', requireAdmin, (req, res) => res.json(loadA().sort(newest).map(a => ({ ...artPub(a), published: a.published }))));
const artUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024, files: 1 }, fileFilter: imgFilter });
const clip = (v, n) => String(v ?? '').trim().slice(0, n);

async function saveArticle(req, res, existingId) {
  try {
    const b = req.body || {};
    const title = clip(b.title, 220), body = String(b.body || '').trim().slice(0, 60000);
    if (title.length < 3) return res.status(400).json({ error: 'Please enter a headline.' });
    if (body.length < 20) return res.status(400).json({ error: 'The story text is too short.' });
    if (!CATS.includes(b.category)) return res.status(400).json({ error: 'Choose a section.' });
    const lang = b.lang === 'ur' ? 'ur' : 'en';
    let at = new Date(b.at); if (isNaN(at)) at = new Date();
    const all = loadA();
    let a = existingId ? all.find(x => x.id === existingId) : null;
    if (existingId && !a) return res.status(404).json({ error: 'Not found' });
    if (!a) { a = { id: crypto.randomBytes(5).toString('hex'), views: 0 }; all.push(a); }
    Object.assign(a, {
      title, body, category: b.category, lang, summary: clip(b.summary, 400), author: clip(b.author, 100) || (lang === 'ur' ? 'اسٹاف رپورٹر' : 'Staff Reporter'),
      caption: clip(b.caption, 200), at: at.toISOString(), featured: b.featured === 'true', breaking: b.breaking === 'true',
      published: b.published === 'true', updated: Date.now(),
    });
    if (b.removeImage === 'true' && a.image) { a.image = false; await files.del([`articles/${a.id}.webp`, `articles/${a.id}-t.webp`]); }
    if (req.file) { await processImage(req.file.buffer, `articles/${a.id}`, 1600, 640); a.image = true; }
    saveA(all);
    res.json({ ok: true, id: a.id });
  } catch (err) { console.error(err); res.status(400).json({ error: 'Could not save. Check the image (JPG, PNG or WebP).' }); }
}
app.post('/api/admin/articles', requireAdmin, artUpload.single('image'), (req, res) => saveArticle(req, res, null));
app.put('/api/admin/articles/:id', requireAdmin, artUpload.single('image'), (req, res) => saveArticle(req, res, req.params.id));
app.delete('/api/admin/articles/:id', requireAdmin, async (req, res) => {
  const all = loadA(), a = all.find(x => x.id === req.params.id); if (!a) return res.json({ ok: true });
  await files.del([`articles/${a.id}.webp`, `articles/${a.id}-t.webp`]);
  saveA(all.filter(x => x.id !== a.id)); res.json({ ok: true });
});

// ---------- SEO: robots, sitemap, rss, share previews ----------
const base = req => process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
const escH = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const escX = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
app.get('/robots.txt', (req, res) => res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ${base(req)}/sitemap.xml\n`));
app.get('/sitemap.xml', (req, res) => {
  const b = base(req), urls = ['/', '/epaper', '/archive', '/about', '/contact', ...CATS.map(c => `/category/${c}`),
    ...visible(load()).map(e => `/epaper?date=${e.date}`), ...loadA().filter(isLive).map(a => `/article/${a.id}`)];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${escX(b + u)}</loc></url>`).join('')}</urlset>`);
});
app.get('/rss.xml', (req, res) => {
  const b = base(req), items = loadA().filter(isLive).sort(newest).slice(0, 40);
  res.type('application/rss+xml').send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Daily Alamdaar</title><link>${b}</link><description>Daily Alamdaar, Islamabad, Pakistan</description>${items.map(a => `<item><title>${escX(a.title)}</title><link>${b}/article/${a.id}</link><guid>${b}/article/${a.id}</guid><pubDate>${new Date(a.at).toUTCString()}</pubDate><description>${escX(a.summary || a.body.slice(0, 200))}</description></item>`).join('')}</channel></rss>`);
});

const shell = name => fs.readFileSync(path.join(ROOT, 'public', name), 'utf8');
const withMeta = (html, { title, desc, img, url, type = 'website', extra = '' }) => {
  const meta = `<meta property="og:type" content="${type}"><meta property="og:site_name" content="Daily Alamdaar"><meta property="og:title" content="${escH(title)}"><meta property="og:description" content="${escH(desc)}"><meta property="og:image" content="${escH(img)}"><meta property="og:url" content="${escH(url)}"><meta name="twitter:card" content="summary_large_image"><meta name="description" content="${escH(desc)}">${extra}`;
  return html.replace(/<title>.*?<\/title>/, () => `<title>${escH(title)}</title>`).replace('</head>', () => meta + '</head>');
};
const absUrl = (b, u) => /^https?:/.test(u) ? u : b + u;
// Article page: server fills title and share tags so links look right on WhatsApp / Facebook / Google
app.get('/article/:id', (req, res, next) => {
  try {
    const a = loadA().find(x => x.id === req.params.id);
    const html = shell('article.html');
    if (!a || !isLive(a)) return res.status(404).set('Cache-Control', 'no-cache').type('html').send(html);
    const b = base(req), url = `${b}/article/${a.id}`, desc = a.summary || a.body.replace(/\s+/g, ' ').slice(0, 180);
    const img = a.image ? absUrl(b, files.url(`articles/${a.id}.webp`)) : `${b}/assets/logo-wordmark.png`;
    const ld = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'NewsArticle', headline: a.title, datePublished: a.at, author: { '@type': 'Person', name: a.author }, image: a.image ? [img] : undefined, publisher: { '@type': 'Organization', name: 'Daily Alamdaar', logo: { '@type': 'ImageObject', url: `${b}/assets/logo-wordmark.png` } }, mainEntityOfPage: url }).replace(/</g, '\\u003c')}</script>`;
    res.set('Cache-Control', 'no-cache').type('html').send(withMeta(html, { title: `${a.title} | Daily Alamdaar`, desc, img, url, type: 'article', extra: ld }));
  } catch (err) { next(err); }
});
// E-paper page with share preview of the front page
app.get(['/epaper', '/epaper.html'], (req, res, next) => {
  try {
    const db = load(), want = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '') ? req.query.date : null;
    const e = want ? visible(db).find(x => x.date === want) : visible(db)[0], b = base(req);
    res.set('Cache-Control', 'no-cache').type('html').send(withMeta(shell('epaper.html'), {
      title: e ? `Daily Alamdaar | E-Paper ${e.date}` : 'Daily Alamdaar | E-Paper',
      desc: 'Read the complete newspaper online - Daily Alamdaar, Islamabad, Pakistan.',
      img: e ? absUrl(b, files.url(`${e.date}/${e.pages[0]}.webp`)) : `${b}/assets/logo-wordmark.png`, url: `${b}/epaper`,
    }));
  } catch (err) { next(err); }
});
app.get('/category/:slug', (req, res, next) => CATS.includes(req.params.slug) ? res.sendFile(path.join(ROOT, 'public', 'category.html')) : next());

// ---------- static site ----------
app.use('/admin', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use(express.static(path.join(ROOT, 'public'), { extensions: ['html'], maxAge: 0 }));
app.use((req, res) => res.status(404).sendFile(path.join(ROOT, 'public', '404.html')));
app.use((err, req, res, next) => { console.error(err); res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 500).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : 'Server error' }); });

if (!process.env.VERCEL) app.listen(PORT, () => console.log(`Daily Alamdaar running on http://localhost:${PORT}`));
module.exports = app;
