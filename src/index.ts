import express from "express";
import createTemplate from "./create-template";
import fs from "fs";
import { Readable } from "stream";
import { fromPath } from "pdf2pic";
import { stableDataExamples } from "./data";

const app = express();
app.use(express.json());
const port = 3000;

const savePDFToFile = async (pdfStream, fileName) => {
  const writeStream = fs.createWriteStream(fileName);
  const readable = new Readable().wrap(pdfStream);
  readable.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
};

const savePDFToPNG = async (pdfPath, pngFileName) => {
  try {
    const converter = fromPath(pdfPath, {
      density: 100, // output pixels per inch
      saveFilename: pngFileName.split(".")[0], // output file name
      savePath: "./lost-pixel", // output file location
      format: "png", // output file format
      // A4 size
      width: 2480,
      height: 3508,
    });

    const data = await converter(1);
    console.log(`Saved PNG: ./lost-pixel/${pngFileName}`);
  } catch (error) {
    console.error("Error converting PDF to PNG:", error);
  }
};

const server = app.listen(port, async () => {
  console.log(`The sample PDF app is running on port ${port}.`);

  for (let i = 0; i < stableDataExamples.length; i++) {
    const data = stableDataExamples[i];
    console.log(`Generating PDF with stable data example ${i + 1}: `, data);

    const pdfStream = await createTemplate(data);
    const pdfFileName = `stable-data-example-${i + 1}-export.pdf`;
    await savePDFToFile(pdfStream, pdfFileName);
    console.log(
      `Saved PDF with stable data example ${i + 1} to the file system.`
    );

    await savePDFToPNG(pdfFileName, `stable-data-example-${i + 1}-export.png`);

    server.close();
  }
});
