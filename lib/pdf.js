// Build one PDF from an edition's page images.
const { PDFDocument } = require('pdf-lib');

// getBuf(id) must return the full-size webp buffer of a page.
async function buildPdf(pageIds, getBuf, sharp) {
  const pdf = await PDFDocument.create();
  for (const id of pageIds) {
    const jpg = await sharp(await getBuf(id)).flatten({ background: '#fff' }).resize({ width: 1700, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
    const img = await pdf.embedJpg(jpg);
    const page = pdf.addPage([img.width * 0.5, img.height * 0.5]);
    page.drawImage(img, { x: 0, y: 0, width: img.width * 0.5, height: img.height * 0.5 });
  }
  return Buffer.from(await pdf.save());
}

module.exports = { buildPdf };
