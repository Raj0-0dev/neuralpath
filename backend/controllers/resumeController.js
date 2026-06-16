import Resume from "../models/Resume.js";
import { extractTextFromPDF } from "../services/pdfService.js";

export const uploadResume = async (req, res, next) => {
  try {
    const file = req.file;
    // Extract employeeId from protected req.user
    const employeeId = req.user._id;
    // Normalize backslashes to forward slashes for the file path
    const fileUrl = file.path.replace(/\\/g, "/");

    // Store resume metadata in the database
    const resume = new Resume({
      employeeId,
      fileUrl,
    });

    await resume.save();

    // Extract text from the PDF file (not stored in DB yet)
    const extractedText = await extractTextFromPDF(file.path);

    res.status(201).json({
      success: true,
      message: "Resume uploaded, saved, and processed successfully",
      data: {
        id: resume._id,
        employeeId: resume.employeeId,
        fileUrl: resume.fileUrl,
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: resume.uploadedAt,
        extractedText,
      },
    });
  } catch (error) {
    next(error);
  }
};
