import GapAnalysis from "../models/GapAnalysis.js";
import User from "../models/User.js";
import EmployeeSkill from "../models/EmployeeSkill.js";
import { 
  getRequiredSkillsForRole, 
  performProgrammaticAnalysis, 
  performAIGapAnalysis 
} from "../services/gapAnalysisService.js";

/**
 * GET /api/dashboard
 * Retrieves the candidate's match percentage, missing skills, and recommendations.
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user to verify they exist and obtain targetRole
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

    // 2. Fetch the cached GapAnalysis from the database
    let gap = await GapAnalysis.findOne({ employeeId: userId });

    // 3. If missing or stale (i.e. targetRole mismatch), compute it dynamically and cache it
    if (!gap || gap.targetRole !== user.targetRole) {
      console.log("[Dashboard Controller] GapAnalysis not cached or stale. Re-evaluating...");
      
      const employeeSkill = await EmployeeSkill.findOne({ employeeId: userId });
      const currentSkills = employeeSkill ? employeeSkill.skills : [];

      const requiredSkills = await getRequiredSkillsForRole(user.targetRole);
      const programmatic = performProgrammaticAnalysis(currentSkills, requiredSkills);
      const aiAnalysis = await performAIGapAnalysis(currentSkills, user.targetRole);

      gap = await GapAnalysis.findOneAndUpdate(
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
    } else {
      console.log("[Dashboard Controller] Found cached GapAnalysis in database.");
    }

    // 4. Return the required fields
    res.status(200).json({
      success: true,
      data: {
        matchPercentage: gap.matchPercentage,
        missingSkills: gap.missingSkills,
        recommendations: gap.recommendations
      }
    });
  } catch (error) {
    next(error);
  }
};
