import Resume from "../models/Resume.js";
import EmployeeSkill from "../models/EmployeeSkill.js";
import User from "../models/User.js";
import { extractTextFromPDF } from "../services/pdfService.js";
import { analyzeResumeText } from "../services/aiService.js";
import { getRequiredSkillsForRole, performProgrammaticAnalysis } from "../services/gapAnalysisService.js";

export const uploadResume = async (req, res, next) => {
  try {
    const file = req.file;
    // Extract employeeId from protected req.user
    const employeeId = req.user._id;
    // Normalize backslashes to forward slashes for the file path
    const fileUrl = file.path.replace(/\\/g, "/");

    // Extract text from the PDF file
    const extractedText = await extractTextFromPDF(file.path);

    // Store resume metadata and extracted text in the database
    const resume = new Resume({
      employeeId,
      fileUrl,
      extractedText,
    });

    await resume.save();

    // Analyze raw text using the AI service to extract skills and target role
    const aiData = await analyzeResumeText(extractedText);

    const targetRole = aiData.targetRole || "Professional";

    // Update target role in User model
    await User.findByIdAndUpdate(employeeId, {
      targetRole: targetRole,
    });

    // Resolve required skills for targetRole
    const requiredSkills = await getRequiredSkillsForRole(targetRole);

    // Compute programmatic match percentage
    const matchAnalysis = performProgrammaticAnalysis(aiData.skills, requiredSkills);
    const matchPercentage = matchAnalysis.matchPercentage;

    // Store/Upsert extracted skills and matchPercentage in the EmployeeSkill model
    const employeeSkill = await EmployeeSkill.findOneAndUpdate(
      { employeeId },
      { 
        skills: aiData.skills,
        matchPercentage: matchPercentage
      },
      { upsert: true, new: true }
    );

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
        extractedText: resume.extractedText,
        skills: employeeSkill.skills,
        targetRole: targetRole,
        matchPercentage: employeeSkill.matchPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};
