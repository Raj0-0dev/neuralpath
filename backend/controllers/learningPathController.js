import LearningPath from "../models/LearningPath.js";
import ProgressTracking from "../models/ProgressTracking.js";
import { generateAndStoreLearningPath } from "../services/learningPathService.js";
import GapAnalysis from "../models/GapAnalysis.js";
import EmployeeSkill from "../models/EmployeeSkill.js";

/**
 * GET /api/learning-path
 * Retrieves the user's active learning pathway, generating it dynamically if missing/stale.
 */
export const getUserLearningPath = async (req, res, next) => {
  try {
    const employeeId = req.user._id;

    // Check if employee has uploaded a resume (checked by existence of EmployeeSkill)
    const employeeSkill = await EmployeeSkill.findOne({ employeeId });
    if (!employeeSkill) {
      return res.status(400).json({
        success: false,
        message: "No skills profile found. Please upload a resume first."
      });
    }

    // 1. Fetch user gap analysis
    const gap = await GapAnalysis.findOne({ employeeId });
    if (!gap) {
      return res.status(400).json({
        success: false,
        message: "No gap analysis found. Please upload a resume first to generate a learning path.",
      });
    }

    // 2. Fetch learning path or check if stale (role change or skill changes)
    let path = await LearningPath.findOne({ employeeId });
    if (!path || path.targetRole !== gap.targetRole) {
      console.log("[Learning Path Controller] Learning path not found or stale. Re-generating...");
      path = await generateAndStoreLearningPath(employeeId);
    }

    // 3. Get or initialize ProgressTracking
    let progress = await ProgressTracking.findOne({ employeeId });
    if (!progress) {
      progress = await ProgressTracking.create({ employeeId });
    }

    res.status(200).json({
      success: true,
      message: "Learning pathway retrieved successfully.",
      data: {
        pathway: path,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/learning-path/complete
 * Marks a specific module and skill as completed.
 */
export const completeModule = async (req, res, next) => {
  try {
    const employeeId = req.user._id;
    const { moduleId, skillName } = req.body;

    if (!moduleId || !skillName) {
      return res.status(400).json({
        success: false,
        message: "moduleId and skillName are required.",
      });
    }

    let progress = await ProgressTracking.findOne({ employeeId });
    if (!progress) {
      progress = new ProgressTracking({ employeeId });
    }

    let actualSkillName = "";
    if (typeof skillName === "object" && skillName !== null) {
      actualSkillName = skillName.title || skillName.name || "Skill";
    } else if (typeof skillName === "string") {
      actualSkillName = skillName;
    } else {
      actualSkillName = "Skill";
    }
    const normalizedSkillName = actualSkillName.trim();

    // Toggle logic: If already completed, remove. Otherwise, add.
    if (progress.completedModules.includes(moduleId)) {
      progress.completedModules = progress.completedModules.filter(id => id !== moduleId);
      progress.completedSkills = progress.completedSkills.filter(s => s !== normalizedSkillName);
    } else {
      progress.completedModules.push(moduleId);
      if (!progress.completedSkills.includes(normalizedSkillName)) {
        progress.completedSkills.push(normalizedSkillName);
      }
    }

    // Recalculate learning completion percentage
    const path = await LearningPath.findOne({ employeeId });
    if (path) {
      let totalModules = 0;
      let completedModulesCount = 0;
      const allModIds = [];

      path.phases.forEach(phase => {
        phase.modules.forEach(mod => {
          allModIds.push(mod.id);
          totalModules++;
        });
      });

      allModIds.forEach(modId => {
        // Find the module object in the path to check videos count
        let modObj = null;
        for (const phase of path.phases) {
          const found = phase.modules.find(m => m.id === modId);
          if (found) {
            modObj = found;
            break;
          }
        }

        const totalVids = modObj?.videos?.length || 1;
        let allVidsDone = true;
        for (let s = 1; s <= totalVids; s++) {
          if (!progress.completedModules.includes(`${modId}_${s}`)) {
            allVidsDone = false;
            break;
          }
        }
        if (allVidsDone) {
          completedModulesCount++;
        }
      });

      progress.learningCompletionPercentage = totalModules > 0
        ? Math.round((completedModulesCount / totalModules) * 100)
        : 100;
    } else {
      progress.learningCompletionPercentage = 0;
    }

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Module completion state toggled.",
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};
