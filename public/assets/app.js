/* Daily Alamdaar - shared: i18n, header, footer, helpers */
const I18N = {
  en: {
    paper: "Today's Paper", archive: 'Archive', about: 'About Us', contactNav: 'Contact',
    tagline: 'Islamabad, Pakistan · ABC Certified · Bilingual',
    online: 'E-Paper Edition', vol: 'Vol', issue: 'Issue', price: 'Price', pages: 'Pages', rs: 'Rs',
    page: 'Page', of: 'of', prev: 'Previous', next: 'Next', zoom: 'Zoom', close: 'Close', fullscreen: 'Full view',
    download: 'Download page', share: 'Share', copied: 'Link copied', pickDate: 'Pick date', latest: 'Latest',
    noEdition: 'No edition published yet', noEditionSub: 'Please check back soon for the latest issue.',
    notFound: 'Edition not found', notFoundSub: 'There is no edition for this date.',
    archiveTitle: 'Newspaper Archive', archiveSub: 'Browse every published edition of Daily Alamdaar, day by day.',
    jump: 'Go to date', allEditions: 'All editions', none: 'No editions found.', open: 'Read',
    aboutTitle: 'About Daily Alamdaar',
    aboutP1: 'Daily Alamdaar is a bilingual (Urdu and English) daily newspaper published from Islamabad, Pakistan. It is ABC certified and brings readers local, regional and national reporting every day.',
    aboutP2: 'This e-paper site carries the complete print edition, page by page, so readers anywhere can read the day\'s paper exactly as it appears in print.',
    team: 'Editorial', chiefEditor: 'Chief Editor', chiefExec: 'Chief Executive', publisher: 'Publisher',
    contact: 'Contact Office', address: 'Address', phone: 'Phone', email: 'Email',
    addr: 'O 924-A, Ferozpura, Opp. Gul Noor Market, Murree Road, Rawalpindi',
    rights: 'All rights reserved.', quick: 'Quick links', reach: 'Reach us',
    back: 'Back to home', lost: 'Page not found',
    pdf: 'Full PDF', whatsapp: 'WhatsApp', print: 'Print', call: 'Call', writeUs: 'Write to us', callUs: 'Call us',
    contactTitle: 'Contact Daily Alamdaar', contactSub: 'Send a news tip, advertisement enquiry, feedback or complaint. Our team will get back to you.',
    fName: 'Your name', fEmail: 'Email', fPhone: 'Phone / WhatsApp', fSubject: 'Subject', fMsg: 'Your message', send: 'Send message', sending: 'Sending…',
    sentOk: 'Thank you! Your message has been sent. We will contact you soon.', sentErr: 'Could not send. Please try again.',
    officeHrs: 'Newsroom & advertising', mail: 'Email us', visit: 'Visit our office', editorDesk: 'Chief Editor desk',
  },
  ur: {
    paper: 'آج کا اخبار', archive: 'آرکائیو', about: 'ہمارے بارے میں', contactNav: 'رابطہ',
    tagline: 'اسلام آباد، پاکستان · اے بی سی سرٹیفائیڈ · دو لسانی',
    online: 'ای پیپر ایڈیشن', vol: 'جلد', issue: 'شمارہ', price: 'قیمت', pages: 'صفحات', rs: 'روپے',
    page: 'صفحہ', of: 'از', prev: 'پچھلا', next: 'اگلا', zoom: 'بڑا کریں', close: 'بند کریں', fullscreen: 'پوری اسکرین',
    download: 'صفحہ ڈاؤن لوڈ', share: 'شیئر', copied: 'لنک کاپی ہو گیا', pickDate: 'تاریخ منتخب کریں', latest: 'تازہ ترین',
    noEdition: 'ابھی کوئی ایڈیشن شائع نہیں ہوا', noEditionSub: 'تازہ شمارے کے لیے کچھ دیر بعد تشریف لائیں۔',
    notFound: 'ایڈیشن نہیں ملا', notFoundSub: 'اس تاریخ کا کوئی ایڈیشن موجود نہیں۔',
    archiveTitle: 'اخبار کا آرکائیو', archiveSub: 'روزنامہ علمدار کے تمام شائع شدہ ایڈیشن دن بہ دن دیکھیں۔',
    jump: 'تاریخ پر جائیں', allEditions: 'تمام ایڈیشن', none: 'کوئی ایڈیشن نہیں ملا۔', open: 'پڑھیں',
    aboutTitle: 'روزنامہ علمدار کا تعارف',
    aboutP1: 'روزنامہ علمدار اسلام آباد، پاکستان سے شائع ہونے والا دو لسانی (اردو اور انگریزی) روزنامہ ہے۔ یہ اے بی سی سرٹیفائیڈ ہے اور قارئین کو روزانہ مقامی، علاقائی اور قومی خبریں فراہم کرتا ہے۔',
    aboutP2: 'اس ای پیپر ویب سائٹ پر مکمل اخبار صفحہ بہ صفحہ موجود ہے تاکہ دنیا بھر کے قارئین آج کا اخبار بالکل اسی طرح پڑھ سکیں جیسے وہ چھپ کر آتا ہے۔',
    team: 'ادارتی ٹیم', chiefEditor: 'چیف ایڈیٹر', chiefExec: 'چیف ایگزیکٹو', publisher: 'پبلشر',
    contact: 'رابطہ دفتر', address: 'پتہ', phone: 'فون', email: 'ای میل',
    addr: 'او 924-اے، فیروز پورہ، گل نور مارکیٹ کے سامنے، مری روڈ، راولپنڈی',
    rights: 'جملہ حقوق محفوظ ہیں۔', quick: 'فوری لنکس', reach: 'ہم سے رابطہ',
    back: 'مرکزی صفحے پر جائیں', lost: 'صفحہ نہیں ملا',
    pdf: 'مکمل پی ڈی ایف', whatsapp: 'واٹس ایپ', print: 'پرنٹ', call: 'کال کریں', writeUs: 'ہمیں لکھیں', callUs: 'ہمیں کال کریں',
    contactTitle: 'روزنامہ علمدار سے رابطہ', contactSub: 'خبر کی اطلاع، اشتہار کی معلومات، رائے یا شکایت بھیجیں۔ ہماری ٹیم آپ سے رابطہ کرے گی۔',
    fName: 'آپ کا نام', fEmail: 'ای میل', fPhone: 'فون / واٹس ایپ', fSubject: 'موضوع', fMsg: 'آپ کا پیغام', send: 'پیغام بھیجیں', sending: 'بھیجا جا رہا ہے…',
    sentOk: 'شکریہ! آپ کا پیغام موصول ہو گیا ہے۔ ہم جلد رابطہ کریں گے۔', sentErr: 'پیغام نہیں بھیجا جا سکا۔ دوبارہ کوشش کریں۔',
    officeHrs: 'نیوز روم اور اشتہارات', mail: 'ای میل کریں', visit: 'ہمارا دفتر', editorDesk: 'چیف ایڈیٹر ڈیسک',
  },
};
const NAMES = {
  en: { chiefEditor: 'Khalid Hussain Zuberi', chiefExec: 'Humair Alam Zuberi', publisher: 'Sana Aamir' },
  ur: { chiefEditor: 'خالد حسین زبیری', chiefExec: 'حمیر عالم زبیری', publisher: 'ثناء عامر' },
};
const MONTHS_UR = ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'];
const DAYS_UR = ['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ'];
Object.assign(I18N.en, {
  home: 'Home', epaper: 'E-Paper', sections: 'Sections', searchPh: 'Search news…', breaking: 'Breaking', justNow: 'Just now',
  c_pakistan: 'Pakistan', c_islamabad: 'Islamabad & Rawalpindi', c_world: 'World', c_business: 'Business', c_sports: 'Sports', c_entertainment: 'Entertainment', c_opinion: 'Opinion',
  latestNews: 'Latest News', mostRead: 'Most Read', topStories: 'Top Stories', moreIn: 'More in', viewAll: 'View all', readMore: 'Read more',
  todaysPaper: "Today's Paper", readEpaper: 'Read the e-paper', epaperPromo: 'Read the complete newspaper page by page.',
  noNews: 'No stories here yet', noNewsSub: 'Fresh stories will appear here as soon as they are published.',
  by: 'By', published: 'Published', related: 'Related stories', shareStory: 'Share this story', textSize: 'Text size', copyLink: 'Copy link',
  searchTitle: 'Search', searchResults: 'results for', noResults: 'No stories matched your search.', loadMore: 'Load more', enterQuery: 'Type a word to search the news.',
  articleGone: 'Story not found', articleGoneSub: 'This story may have been removed or the link is incorrect.', views: 'views',
  inOtherLang: 'Urdu', langOnly: 'Showing stories in English first',
});
Object.assign(I18N.ur, {
  home: 'صفحۂ اول', epaper: 'ای پیپر', sections: 'سیکشنز', searchPh: 'خبریں تلاش کریں…', breaking: 'بریکنگ', justNow: 'ابھی ابھی',
  c_pakistan: 'پاکستان', c_islamabad: 'اسلام آباد و راولپنڈی', c_world: 'دنیا', c_business: 'کاروبار', c_sports: 'کھیل', c_entertainment: 'تفریح', c_opinion: 'رائے',
  latestNews: 'تازہ ترین', mostRead: 'سب سے زیادہ پڑھی گئی', topStories: 'اہم خبریں', moreIn: 'مزید', viewAll: 'سب دیکھیں', readMore: 'مزید پڑھیں',
  todaysPaper: 'آج کا اخبار', readEpaper: 'ای پیپر پڑھیں', epaperPromo: 'مکمل اخبار صفحہ بہ صفحہ پڑھیں۔',
  noNews: 'ابھی یہاں کوئی خبر نہیں', noNewsSub: 'نئی خبریں شائع ہوتے ہی یہاں نظر آئیں گی۔',
  by: 'از', published: 'شائع شدہ', related: 'متعلقہ خبریں', shareStory: 'یہ خبر شیئر کریں', textSize: 'حروف کا سائز', copyLink: 'لنک کاپی کریں',
  searchTitle: 'تلاش', searchResults: 'نتائج برائے', noResults: 'آپ کی تلاش سے کوئی خبر نہیں ملی۔', loadMore: 'مزید دکھائیں', enterQuery: 'خبریں تلاش کرنے کے لیے کوئی لفظ لکھیں۔',
  articleGone: 'خبر نہیں ملی', articleGoneSub: 'ہو سکتا ہے یہ خبر ہٹا دی گئی ہو یا لنک غلط ہو۔', views: 'مرتبہ پڑھا گیا',
});
const ROMAN_OK = /^[IVXLCDM]+$/i;

const App = {
  lang: (() => { try { return localStorage.getItem('lang') || 'en'; } catch { return 'en'; } })(),
  t(k) { return I18N[this.lang][k] ?? I18N.en[k] ?? k; },
  settings: null,
  name(k) { const s = this.settings && this.settings[k]; return s ? (s[this.lang] || s.en) : NAMES[this.lang][k]; },
  addr() { const a = this.settings && this.settings.address; return a ? (a[this.lang] || a.en) : this.t('addr'); },
  phoneHref(p) { return 'tel:' + p.replace(/[^\d+]/g, ''); },
  async loadSettings() { try { this.settings = await this.api('/api/settings'); } catch {} this.fillFooter(); window.dispatchEvent(new Event('settings')); },
  fillFooter() {
    const s = this.settings; if (!s) return;
    const el = document.getElementById('ftContact'); if (!el) return;
    el.innerHTML = '<p>' + this.addr() + '</p>' + s.phones.map(p => '<a href="' + this.phoneHref(p) + '" dir="ltr">' + p + '</a>').join('') + '<a href="mailto:' + s.email + '">' + s.email + '</a>';
  },
  num(n) { return this.lang === 'ur' ? String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]) : String(n); },
  d(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); },
  fmtDate(iso, opts = {}) {
    const dt = this.d(iso);
    if (this.lang === 'ur') {
      return `${DAYS_UR[dt.getUTCDay()]}، ${this.num(dt.getUTCDate())} ${MONTHS_UR[dt.getUTCMonth()]} ${this.num(dt.getUTCFullYear())}`;
    }
    return dt.toLocaleDateString('en-GB', { weekday: opts.short ? undefined : 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  },
  monthLabel(ym) {
    const [y, m] = ym.split('-').map(Number);
    return this.lang === 'ur' ? `${MONTHS_UR[m - 1]} ${this.num(y)}` : new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  },
  toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2200);
  },
  setLang(l) {
    this.lang = l; try { localStorage.setItem('lang', l); } catch {}
    this.apply(); window.dispatchEvent(new Event('langchange'));
  },
  apply() {
    document.documentElement.lang = this.lang;
    document.documentElement.dir = this.lang === 'ur' ? 'rtl' : 'ltr';
    document.body.classList.toggle('ur', this.lang === 'ur');
    document.querySelectorAll('[data-i]').forEach(el => el.textContent = this.t(el.dataset.i));
    document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('on', b.dataset.l === this.lang));
    document.querySelectorAll('[data-ph]').forEach(el => el.placeholder = this.t(el.dataset.ph));
    this.fillFooter(); this.drawTicker && this.drawTicker();
    const hd = document.getElementById('todayStrip'); if (hd) hd.textContent = this.fmtDate(new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10));
  },
  cats: ['pakistan', 'islamabad', 'world', 'business', 'sports', 'entertainment', 'opinion'],
  catName(c) { return this.t('c_' + c); },
  esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
  ago(iso) {
    const s = (Date.now() - new Date(iso)) / 1000, u = this.lang === 'ur';
    const f = (n, en, ur) => u ? `${this.num(n)} ${ur} پہلے` : `${n} ${en}${n > 1 ? 's' : ''} ago`;
    if (s < 90) return this.t('justNow');
    if (s < 3600) return f(Math.round(s / 60), 'minute', 'منٹ');
    if (s < 86400) return f(Math.round(s / 3600), 'hour', 'گھنٹے');
    if (s < 7 * 86400) return f(Math.round(s / 86400), 'day', 'دن');
    return this.fmtDate(new Date(iso).toISOString().slice(0, 10), { short: true });
  },
  // pictureless articles get a branded placeholder
  img(a, cls = '', full = false) {
    const src = a.image ? (full ? a.image : a.thumb) : null;
    return src ? `<img class="${cls}" src="${src}" alt="" loading="lazy">` : `<div class="ph ${cls}"><img src="/assets/logo-calligraphy.png" alt=""></div>`;
  },
  dirOf(a) { return a.lang === 'ur' ? 'rtl' : 'ltr'; },
  cardHtml(a, { size = 'm', showCat = true, summary = true } = {}) {
    return `<a class="nc ${size} ${a.lang === 'ur' ? 'ulang' : ''}" href="/article/${a.id}" dir="${this.dirOf(a)}">
      <div class="nc-img">${this.img(a, '', size === 'xl')}${a.breaking ? `<span class="tagb">${this.t('breaking')}</span>` : ''}</div>
      <div class="nc-b">${showCat ? `<span class="kicker">${this.catName(a.category)}</span>` : ''}<h3>${this.esc(a.title)}</h3>
      ${summary && a.summary && size !== 's' ? `<p>${this.esc(a.summary)}</p>` : ''}<small dir="${this.lang === 'ur' ? 'rtl' : 'ltr'}">${this.ago(a.at)}</small></div></a>`;
  },
  rowHtml(a, i) {
    return `<a class="pop" href="/article/${a.id}" dir="${this.dirOf(a)}"><b>${i != null ? this.num(i + 1) : ''}</b><div><span>${this.esc(a.title)}</span><small dir="${this.lang === 'ur' ? 'rtl' : 'ltr'}">${this.catName(a.category)} · ${this.ago(a.at)}</small></div></a>`;
  },
  mount(active) {
    const sec = this.cats.map(c => `<a href="/category/${c}" class="${active === c ? 'on' : ''}" data-i="c_${c}"></a>`).join('');
    const hdr = document.getElementById('hdr');
    hdr.outerHTML = `
    <div class="strip"><div class="wrap"><span id="todayStrip"></span>
      <span class="strip-links"><a href="/archive" data-i="archive"></a><a href="/about" data-i="about"></a><a href="/contact" data-i="contactNav"></a><a href="/rss.xml" title="RSS">RSS</a></span></div></div>
    <header class="site"><div class="wrap mast">
      <button class="menu-btn" aria-label="Menu" onclick="document.body.classList.toggle('navopen')">☰</button>
      <a class="brand" href="/" aria-label="Daily Alamdaar">
        <img class="word" src="/assets/logo-wordmark.png" alt="Daily Alamdaar Islamabad Pakistan">
        <span class="sep"></span>
        <img class="cal" src="/assets/logo-calligraphy.png" alt="">
      </a>
      <div class="mast-r">
        <form class="search" action="/search" role="search"><input name="q" type="search" data-ph="searchPh" autocomplete="off"><button aria-label="Search">🔍</button></form>
        <div class="lang"><button data-l="en" onclick="App.setLang('en')">EN</button><button data-l="ur" onclick="App.setLang('ur')">اردو</button></div>
      </div>
    </div>
    <div class="secbar"><div class="wrap"><nav class="secnav" id="nav">
      <a href="/" class="${active === 'home' ? 'on' : ''}" data-i="home"></a>${sec}
      <a href="/epaper" class="ep ${active === 'epaper' ? 'on' : ''}" data-i="epaper"></a>
    </nav></div></div><div id="ticker"></div></header>`;
    const ft = document.getElementById('ftr');
    if (ft) ft.outerHTML = `
    <footer class="site"><div class="wrap">
      <div><img src="/assets/logo-wordmark.png" alt="Daily Alamdaar"><p data-i="tagline"></p></div>
      <div><h4 data-i="sections"></h4>${this.cats.map(c => `<a href="/category/${c}" data-i="c_${c}"></a>`).join('')}</div>
      <div><h4 data-i="quick"></h4><a href="/epaper" data-i="epaper"></a><a href="/archive" data-i="archive"></a><a href="/about" data-i="about"></a><a href="/contact" data-i="contactNav"></a><a href="/rss.xml">RSS</a></div>
      <div><h4 data-i="reach"></h4><div id="ftContact"><p data-i="addr"></p></div></div>
    </div><div class="copy">© <span id="yr"></span> Daily Alamdaar · <span data-i="rights"></span></div></footer>`;
    const y = document.getElementById('yr'); if (y) y.textContent = new Date().getFullYear();
    document.addEventListener('click', e => { if (e.target.closest('#nav a')) document.body.classList.remove('navopen'); });
    this.apply(); this.loadSettings(); this.loadTicker();
  },
  async loadTicker() {
    try {
      const r = await this.api('/api/articles?limit=60&fallback=1');
      this._br = r.items.filter(a => a.breaking).slice(0, 20);
    } catch { this._br = []; }
    this.drawTicker();
  },
  drawTicker() {
    const el = document.getElementById('ticker'); if (!el) return;
    // ticker shows only the reader's language, so English mode never shows Urdu headlines and vice versa
    const b = (this._br || []).filter(a => a.lang === this.lang).slice(0, 8);
    el.innerHTML = b.length ? `<div class="ticker"><div class="wrap"><span class="tk-l">${this.t('breaking')}</span><div class="tk-r"><div class="tk-m">${b.concat(b).map(a => `<a href="/article/${a.id}" dir="${this.dirOf(a)}">${this.esc(a.title)}</a>`).join('<i>●</i>')}</div></div></div></div>` : '';
  },
  async api(url) { const r = await fetch(url); if (!r.ok) throw new Error(r.status); return r.json(); },
};
