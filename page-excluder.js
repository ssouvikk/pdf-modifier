const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

// ============================================================
// CONFIGURATION — EDIT ONLY THIS SECTION
// ============================================================

// Input PDF file
const inputFile = "33.pdf";

// Page ranges to EXCLUDE
// Format: [startPage, endPage]
// Page numbers are 1-based and inclusive.
//
// Example:
// [1, 10]   = remove pages 1 through 10
// [30, 35]  = remove pages 30 through 35
//
// If you want to remove a single page:
// [25, 25]
//
const excludeRanges = [
  [1, 2],
  [6, 7],
  [65, 66],
  [102, 107],
  
  
  
  
  [32, 32],
  [63, 63],

];


// ============================================================
// NO NEED TO EDIT BELOW THIS LINE
// ============================================================

(async () => {
  try {
    // --------------------------------------------------------
    // Check input file
    // --------------------------------------------------------

    if (!fs.existsSync(inputFile)) {
      throw new Error(`Input file not found: ${inputFile}`);
    }

    // --------------------------------------------------------
    // Load source PDF
    // --------------------------------------------------------

    console.log(`\nLoading: ${inputFile}`);

    const sourceBytes = fs.readFileSync(inputFile);
    const sourcePdf = await PDFDocument.load(sourceBytes);

    const totalPages = sourcePdf.getPageCount();

    console.log(`Total pages: ${totalPages}`);


    // --------------------------------------------------------
    // Validate exclusion ranges
    // --------------------------------------------------------

    for (const range of excludeRanges) {
      if (
        !Array.isArray(range) ||
        range.length !== 2
      ) {
        throw new Error(
          `Invalid range: ${JSON.stringify(range)}`
        );
      }

      const [start, end] = range;

      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end)
      ) {
        throw new Error(
          `Page numbers must be integers: ${start}-${end}`
        );
      }

      if (start < 1 || end < 1) {
        throw new Error(
          `Page numbers must start from 1: ${start}-${end}`
        );
      }

      if (start > end) {
        throw new Error(
          `Invalid range: ${start}-${end}. Start cannot be greater than end.`
        );
      }

      if (end > totalPages) {
        throw new Error(
          `Range ${start}-${end} exceeds the PDF's total page count (${totalPages}).`
        );
      }
    }


    // --------------------------------------------------------
    // Display ranges being removed
    // --------------------------------------------------------

    console.log("\nPages to exclude:");

    if (excludeRanges.length === 0) {
      console.log("  None");
    } else {
      for (const [start, end] of excludeRanges) {
        console.log(`  ${start}-${end}`);
      }
    }


    // --------------------------------------------------------
    // Determine pages to KEEP
    // --------------------------------------------------------

    const pagesToKeep = [];

    for (let page = 1; page <= totalPages; page++) {

      const shouldExclude = excludeRanges.some(
        ([start, end]) =>
          page >= start && page <= end
      );

      if (!shouldExclude) {
        pagesToKeep.push(page);
      }
    }


    // --------------------------------------------------------
    // Display summary
    // --------------------------------------------------------

    const removedPages =
      totalPages - pagesToKeep.length;

    console.log(`\nPages removed: ${removedPages}`);
    console.log(`Pages kept:    ${pagesToKeep.length}`);


    // --------------------------------------------------------
    // Create new PDF
    // --------------------------------------------------------

    const outputPdf = await PDFDocument.create();

    // pdf-lib uses 0-based page indexes,
    // while our configuration uses 1-based page numbers.
    const pageIndices = pagesToKeep.map(
      (page) => page - 1
    );

    const copiedPages = await outputPdf.copyPages(
      sourcePdf,
      pageIndices
    );

    for (const page of copiedPages) {
      outputPdf.addPage(page);
    }


    // --------------------------------------------------------
    // Generate output filename automatically
    // --------------------------------------------------------

    const extension = path.extname(inputFile);

    const baseName = path.basename(
      inputFile,
      extension
    );

    const outputFile =
      `${baseName}-SOLID-version${extension}`;


    // --------------------------------------------------------
    // Save output PDF
    // --------------------------------------------------------

    const outputBytes = await outputPdf.save();

    fs.writeFileSync(
      outputFile,
      outputBytes
    );


    // --------------------------------------------------------
    // Finished
    // --------------------------------------------------------

    console.log("\n========================================");
    console.log("PDF CREATED SUCCESSFULLY");
    console.log("========================================");
    console.log(`Input : ${inputFile}`);
    console.log(`Output: ${outputFile}`);
    console.log(`Pages : ${pagesToKeep.length}`);
    console.log("========================================\n");

  } catch (error) {

    console.error("\n========================================");
    console.error("ERROR");
    console.error("========================================");
    console.error(error.message);
    console.error();

    process.exit(1);
  }
})();
