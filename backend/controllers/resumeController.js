import Resume from "../models/Resume.js";
import EmployeeSkill from "../models/EmployeeSkill.js";
import User from "../models/User.js";
import GapAnalysis from "../models/GapAnalysis.js";
import LearningPath from "../models/LearningPath.js";
import { extractTextFromBuffer } from "../services/pdfService.js";
import { uploadToSupabase } from "../services/supabaseService.js";
import { analyzeResumeText } from "../services/aiService.js";
import { 
  getRequiredSkillsForRole, 
  performProgrammaticAnalysis
} from "../services/gapAnalysisService.js";

export const uploadResume = async (req, res, next) => {
  try {
    const file = req.file;
    const employeeId = req.user._id;

    const extractedText = await extractTextFromBuffer(file.buffer);
    const fileUrl = await uploadToSupabase(file.buffer, file.originalname, file.mimetype);

    const resume = new Resume({
      employeeId,
      fileUrl,
      extractedText,
    });

    await resume.save();

    const targetRole = req.body.targetRole || "Software Engineer";

    // Resolve required skills for targetRole
    const requiredSkills = await getRequiredSkillsForRole(targetRole);

    // Analyze raw text using the AI service to extract skills with scores and target role
    const aiData = await analyzeResumeText(extractedText, requiredSkills);

    // Update target role in User model
    await User.findByIdAndUpdate(employeeId, {
      targetRole: targetRole,
    });

    // Compute dynamic match percentage and split matching/missing lists
    const matchingSkills = [];
    const missingSkills = [];
    let sumOfScores = 0;

    aiData.skillsWithScores.forEach(skill => {
      sumOfScores += skill.score;
      if (skill.score >= 5) {
        matchingSkills.push(skill.name);
      } else {
        missingSkills.push(skill.name);
      }
    });

    const maxPossibleScore = requiredSkills.length * 10;
    const matchPercentage = maxPossibleScore > 0 
      ? Math.round((sumOfScores / maxPossibleScore) * 100)
      : 0;

    const employeeSkill = await EmployeeSkill.findOneAndUpdate(
      { employeeId },
      { 
        skills: aiData.extractedSkills || matchingSkills,
        skillsWithScores: aiData.skillsWithScores,
        matchPercentage: matchPercentage
      },
      { upsert: true, returnDocument: "after" }
    );

    // Save/Upsert GapAnalysis results in database
    await GapAnalysis.findOneAndUpdate(
      { employeeId },
      {
        targetRole,
        matchingSkills,
        missingSkills,
        skillsWithScores: aiData.skillsWithScores,
        matchPercentage
      },
      { upsert: true, returnDocument: "after" }
    );

    // Delete old learning path so a new one is generated
    await LearningPath.deleteOne({ employeeId });

    res.status(201).json({
      success: true,
      message: "Resume uploaded, saved, and processed successfully",
      data: {
        id: resume._id,
        employeeId: resume.employeeId,
        fileUrl: resume.fileUrl,
        originalName: file.originalname,
        filename: file.originalname,
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

export const getActiveResume = async (req, res, next) => {
  try {
    const employeeId = req.user._id;
    const resume = await Resume.findOne({ employeeId }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }
    const rawFilename = resume.fileUrl.split("/").pop();
    const filename = rawFilename.replace(/^\d+_/, "");
    res.status(200).json({
      success: true,
      data: {
        id: resume._id,
        fileUrl: resume.fileUrl,
        filename
      }
    });
  } catch (error) {
    next(error);
  }
};
