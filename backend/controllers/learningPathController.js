import LearningPath from "../models/LearningPath.js";
import ProgressTracking from "../models/ProgressTracking.js";
import { generateAndStoreLearningPath } from "../services/learningPathService.js";
import GapAnalysis from "../models/GapAnalysis.js";

/**
 * GET /api/learning-path
 * Retrieves the user's active learning pathway, generating it dynamically if missing/stale.
 */
export const getUserLearningPath = async (req, res, next) => {
  try {
    const employeeId = req.user._id;

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

    // Push to completed if not already there
    if (!progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId);
    }

    const normalizedSkillName = skillName.trim();
    if (!progress.completedSkills.includes(normalizedSkillName)) {
      progress.completedSkills.push(normalizedSkillName);
    }

    // Recalculate learning completion percentage
    const path = await LearningPath.findOne({ employeeId });
    if (path) {
      let totalModules = 0;
      path.phases.forEach(phase => {
        totalModules += phase.modules.length;
      });

      const completedCount = progress.completedModules.length;
      progress.learningCompletionPercentage = totalModules > 0
        ? Math.round((completedCount / totalModules) * 100)
        : 100;
    } else {
      progress.learningCompletionPercentage = 0;
    }

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Module marked as completed.",
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};
