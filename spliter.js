const fs = require("fs");
const { PDFDocument } = require("pdf-lib");


const inputFile = "Ecosystem.pdf";

// Page ranges (1-based index)
const ranges = [
  { name: `${inputFile}-Part-1.pdf`, start: 1, end: 52 },
  { name: `${inputFile}-Part-2.pdf`, start: 53, end: 96 },
];

/*
const inputFile = "mahabharat-full.pdf";

// Page ranges (1-based index, first 78 pages excluded)
const ranges = [
  { name: "Part-1.pdf", start: 79, end: 820 },
  { name: "Part-2.pdf", start: 821, end: 1564 },
  { name: "Part-3.pdf", start: 1565, end: 2173 },
  { name: "Part-4.pdf", start: 2174, end: 3103 },
  { name: "Part-5.pdf", start: 3104, end: 3637 },
  { name: "Part-6.pdf", start: 3638, end: 4842 },
  { name: "Part-7.pdf", start: 4843, end: 5818 },
];
*/

(async () => {
  const srcBytes = fs.readFileSync(inputFile);
  const srcPdf = await PDFDocument.load(srcBytes);

  console.log(`Total pages: ${srcPdf.getPageCount()}`);

  for (const range of ranges) {
    const newPdf = await PDFDocument.create();

    const pageIndices = [];
    for (let i = range.start - 1; i <= range.end - 1; i++) {
      pageIndices.push(i);
    }

    const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);

    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    fs.writeFileSync(range.name, pdfBytes);

    console.log(
      `${range.name} created (Pages ${range.start}-${range.end})`
    );
  }

  console.log("All PDFs created successfully!");
})();