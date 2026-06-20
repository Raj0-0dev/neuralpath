import GapAnalysis from "../models/GapAnalysis.js";
import User from "../models/User.js";
import EmployeeSkill from "../models/EmployeeSkill.js";
import { 
  getRequiredSkillsForRole, 
  performProgrammaticAnalysis
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

    // Check if employee has uploaded a resume (checked by existence of EmployeeSkill)
    const employeeSkill = await EmployeeSkill.findOne({ employeeId: userId });
    if (!employeeSkill) {
      return res.status(400).json({
        success: false,
        message: "No skills profile found. Please upload a resume first."
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

      const skillsWithScores = requiredSkills.map(skillName => {
        const hasSkill = currentSkills.some(s => s.toLowerCase() === skillName.toLowerCase());
        return {
          name: skillName,
          score: hasSkill ? 7 : 0,
          reason: hasSkill ? "Extracted from skills profile." : "Missing from skills profile."
        };
      });

      gap = await GapAnalysis.findOneAndUpdate(
        { employeeId: userId },
        {
          targetRole: user.targetRole,
          matchingSkills: programmatic.matchingSkills,
          missingSkills: programmatic.missingSkills,
          skillsWithScores,
          matchPercentage: programmatic.matchPercentage
        },
        { upsert: true, returnDocument: "after" }
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
        skillsWithScores: gap.skillsWithScores || []
      }
    });
  } catch (error) {
    next(error);
  }
};
