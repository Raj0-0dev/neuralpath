import pdf from "pdf-parse";

export const extractTextFromBuffer = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF buffer:", error.message);
    throw new Error(`Failed to extract text from PDF buffer: ${error.message}`);
  }
};
