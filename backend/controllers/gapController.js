import User from "../models/User.js";
import EmployeeSkill from "../models/EmployeeSkill.js";
import GapAnalysis from "../models/GapAnalysis.js";
import Role from "../models/Role.js";
import { 
  getRequiredSkillsForRole, 
  performProgrammaticAnalysis
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

    // 3. Fetch employee skills (require it to exist)
    const employeeSkill = await EmployeeSkill.findOne({ employeeId: userId });
    if (!employeeSkill) {
      return res.status(400).json({
        success: false,
        message: "No skills profile found. Please upload a resume first."
      });
    }
    const currentSkills = employeeSkill.skills;

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
          skillsWithScores: savedGap.skillsWithScores || [],
          programmatic: {
            matchingSkills: savedGap.matchingSkills,
            missingSkills: savedGap.missingSkills,
            matchPercentage: savedGap.matchPercentage
          },
          aiAnalysis: {
            matchPercentage: savedGap.matchPercentage,
            matchingSkills: savedGap.matchingSkills,
            missingSkills: savedGap.missingSkills
          }
        }
      });
    }

    console.log("[Gap Controller] GapAnalysis not found or stale. Calculating and persisting to database...");

    // 4. Resolve required skills for targetRole
    const requiredSkills = await getRequiredSkillsForRole(user.targetRole);

    // 5. Perform programmatic set-comparison
    const programmatic = performProgrammaticAnalysis(currentSkills, requiredSkills);

    // 7. Store/Persist results in database
    const skillsWithScores = requiredSkills.map(skillName => {
      const hasSkill = currentSkills.some(s => s.toLowerCase() === skillName.toLowerCase());
      return {
        name: skillName,
        score: hasSkill ? 7 : 0,
        reason: hasSkill ? "Extracted from skills profile." : "Missing from skills profile."
      };
    });

    const newGap = await GapAnalysis.findOneAndUpdate(
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

    res.status(200).json({
      success: true,
      message: "Profile gap analysis completed and persisted successfully.",
      data: {
        employeeId: userId,
        targetRole: newGap.targetRole,
        currentSkills,
        requiredSkills,
        skillsWithScores,
        programmatic,
        aiAnalysis: {
          matchPercentage: programmatic.matchPercentage,
          matchingSkills: programmatic.matchingSkills,
          missingSkills: programmatic.missingSkills
        }
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

    const skillsWithScores = requiredSkills.map(skillName => {
      const hasSkill = currentSkills.some(s => s.toLowerCase() === skillName.toLowerCase());
      return {
        name: skillName,
        score: hasSkill ? 7 : 0,
        reason: hasSkill ? "Indicated in custom skills list." : "Not in custom skills list."
      };
    });

    res.status(200).json({
      success: true,
      message: "Custom gap analysis completed successfully.",
      data: {
        targetRole: targetRole.trim(),
        currentSkills,
        requiredSkills,
        skillsWithScores,
        programmatic,
        aiAnalysis: {
          matchPercentage: programmatic.matchPercentage,
          matchingSkills: programmatic.matchingSkills,
          missingSkills: programmatic.missingSkills
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveRoles = async (req, res, next) => {
  try {
    const roles = await Role.find({});
    res.status(200).json({
      success: true,
      data: roles.map(r => ({
        id: r._id.toString(),
        title: r.title,
        description: r.description,
        requiredSkills: r.requiredSkills
      }))
    });
  } catch (error) {
    next(error);
  }
};
