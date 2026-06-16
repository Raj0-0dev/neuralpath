import fs from "fs";
import pdf from "pdf-parse";

/**
 * Extracts raw text content from a PDF file buffer.
 * 
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {Promise<string>} A promise resolving to the extracted text content.
 */
export const extractTextFromBuffer = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF buffer:", error.message);
    throw new Error(`Failed to extract text from PDF buffer: ${error.message}`);
  }
};

/**
 * Extracts raw text content from a PDF file.
 * 
 * @param {string} filePath - Absolute or relative path to the PDF file.
 * @returns {Promise<string>} A promise resolving to the extracted text content.
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    return await extractTextFromBuffer(dataBuffer);
  } catch (error) {
    console.error(`Error extracting text from PDF at ${filePath}:`, error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};
