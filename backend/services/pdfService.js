import fs from "fs";
import pdf from "pdf-parse";

/**
 * Extracts raw text content from a PDF file.
 * 
 * @param {string} filePath - Absolute or relative path to the PDF file.
 * @returns {Promise<string>} A promise resolving to the extracted text content.
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error extracting text from PDF at ${filePath}:`, error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};
