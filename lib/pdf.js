// PDF helpers: render PDF pages to images, build a PDF from page images
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

let pdfjsP;
const pdfjs = () => (pdfjsP ||= import('pdfjs-dist/legacy/build/pdf.mjs'));

// Returns an array of PNG buffers, one per page (max 24 pages).
async function renderPdf(buffer, targetWidth = 2000) {
  const { createCanvas } = require('@napi-rs/canvas');
  const lib = await pdfjs();
  const task = lib.getDocument({
    data: new Uint8Array(buffer), useSystemFonts: true, isEvalSupported: false,
    standardFontDataUrl: require('url').pathToFileURL(path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts')).href + '/',
  });
  const doc = await task.promise;
  const out = [];
  const n = Math.min(doc.numPages, 24);
  for (let i = 1; i <= n; i++) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(targetWidth / base.width, 5);
    const vp = page.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    out.push(canvas.toBuffer('image/png'));
    page.cleanup();
  }
  try { await task.destroy(); } catch {}
  return out;
}

// Build a PDF from the edition's full-size webp pages (converted to jpeg by sharp).
async function buildPdf(dir, pageIds, sharp) {
  const pdf = await PDFDocument.create();
  for (const id of pageIds) {
    const jpg = await sharp(path.join(dir, id + '.webp')).flatten({ background: '#fff' }).jpeg({ quality: 85 }).toBuffer();
    const img = await pdf.embedJpg(jpg);
    const page = pdf.addPage([img.width * 0.5, img.height * 0.5]);
    page.drawImage(img, { x: 0, y: 0, width: img.width * 0.5, height: img.height * 0.5 });
  }
  return Buffer.from(await pdf.save());
}

module.exports = { renderPdf, buildPdf };
