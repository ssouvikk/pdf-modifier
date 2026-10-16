const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

const baseInputName = 'mahabharat'

// Files will be merged in exactly this order
const inputFiles = [
  `${baseInputName}-Part-1.pdf`,
  `${baseInputName}-Part-2.pdf`,
  `${baseInputName}-Part-3.pdf`,
  `${baseInputName}-Part-4.pdf`,
];

const outputFile = "all-merged.pdf";


(async () => {
  const mergedPdf = await PDFDocument.create();

  for (const file of inputFiles) {
    console.log(`Adding ${file}...`);

    const pdfBytes = fs.readFileSync(file);
    const pdf = await PDFDocument.load(pdfBytes);

    const pageIndices = pdf.getPageIndices();

    const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);

    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });

    console.log(`Added ${pdf.getPageCount()} pages from ${file}`);
  }

  const mergedBytes = await mergedPdf.save();

  fs.writeFileSync(outputFile, mergedBytes);

  console.log(`\nDone!`);
  console.log(`Created: ${outputFile}`);
  console.log(`Total pages: ${mergedPdf.getPageCount()}`);
})();