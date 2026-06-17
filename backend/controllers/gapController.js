import User from "../models/User.js";
import EmployeeSkill from "../models/EmployeeSkill.js";
import GapAnalysis from "../models/GapAnalysis.js";
import { 
  getRequiredSkillsForRole, 
  performProgrammaticAnalysis, 
  performAIGapAnalysis 
} from "../services/gapAnalysisService.js";

/**
 * GET /api/gap-analysis/my-profile
 * Performs gap analysis for the authenticated user based on their skills and target role.
 */
export const getUserGapAnalysis = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Check if a pre-calculated gap analysis exists in the database
    const savedGap = await GapAnalysis.findOne({ employeeId: userId });

    // 2. Fetch user to check targetRole
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (!user.targetRole) {
      return res.status(400).json({
        success: false,
        message: "Target role not defined for this profile. Please set a target role or upload a resume first."
      });
    }

    // 3. Fetch employee skills (default to empty array if no record exists)
    const employeeSkill = await EmployeeSkill.findOne({ employeeId: userId });
    const currentSkills = employeeSkill ? employeeSkill.skills : [];

    // If a saved gap analysis exists AND matches current targetRole, return it
    if (savedGap && savedGap.targetRole === user.targetRole) {
      console.log("[Gap Controller] Found cached GapAnalysis in database");
      return res.status(200).json({
        success: true,
        message: "Profile gap analysis retrieved from database successfully.",
        data: {
          employeeId: userId,
          targetRole: savedGap.targetRole,
          currentSkills,
          requiredSkills: await getRequiredSkillsForRole(user.targetRole),
          programmatic: {
            matchingSkills: savedGap.matchingSkills,
            missingSkills: savedGap.missingSkills,
            matchPercentage: savedGap.matchPercentage
          },
          aiAnalysis: {
            matchPercentage: savedGap.matchPercentage,
            matchingSkills: savedGap.matchingSkills,
            missingSkills: savedGap.missingSkills,
            recommendations: savedGap.recommendations
          }
        }
      });
    }

    console.log("[Gap Controller] GapAnalysis not found or stale. Calculating and persisting to database...");

    // 4. Resolve required skills for targetRole
    const requiredSkills = await getRequiredSkillsForRole(user.targetRole);

    // 5. Perform programmatic set-comparison
    const programmatic = performProgrammaticAnalysis(currentSkills, requiredSkills);

    // 6. Perform AI suitability assessment
    const aiAnalysis = await performAIGapAnalysis(currentSkills, user.targetRole);

    // 7. Store/Persist results in database
    const newGap = await GapAnalysis.findOneAndUpdate(
      { employeeId: userId },
      {
        targetRole: user.targetRole,
        matchingSkills: programmatic.matchingSkills,
        missingSkills: programmatic.missingSkills,
        matchPercentage: programmatic.matchPercentage,
        recommendations: aiAnalysis.recommendations
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile gap analysis completed and persisted successfully.",
      data: {
        employeeId: userId,
        targetRole: newGap.targetRole,
        currentSkills,
        requiredSkills,
        programmatic,
        aiAnalysis
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/gap-analysis/custom
 * Performs gap analysis on arbitrary skills and target role passed in the request body.
 */
export const getCustomGapAnalysis = async (req, res, next) => {
  try {
    const { skills, targetRole } = req.body;

    if (!targetRole || typeof targetRole !== "string" || targetRole.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "A valid non-empty targetRole string is required."
      });
    }

    const currentSkills = Array.isArray(skills) ? skills.map(s => String(s).trim()) : [];

    // 1. Resolve required skills
    const requiredSkills = await getRequiredSkillsForRole(targetRole);

    // 2. Perform programmatic comparison
    const programmatic = performProgrammaticAnalysis(currentSkills, requiredSkills);

    // 3. Perform AI assessment
    const aiAnalysis = await performAIGapAnalysis(currentSkills, targetRole);

    res.status(200).json({
      success: true,
      message: "Custom gap analysis completed successfully.",
      data: {
        targetRole: targetRole.trim(),
        currentSkills,
        requiredSkills,
        programmatic,
        aiAnalysis
      }
    });
  } catch (error) {
    next(error);
  }
};
