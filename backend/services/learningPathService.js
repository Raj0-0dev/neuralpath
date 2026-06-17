import LearningPath from "../models/LearningPath.js";
import GapAnalysis from "../models/GapAnalysis.js";
import { getOrderedLearningSequence, generatePhasesFromSortedSkills } from "./dependencyGraphService.js";

/**
 * Generates and stores/upserts the learning path for a given user based on their gap analysis.
 * 
 * @param {string} employeeId - User database ID.
 * @returns {Promise<object>} The stored/updated LearningPath document.
 */
export const generateAndStoreLearningPath = async (employeeId) => {
  // 1. Fetch user's current gap analysis
  const gap = await GapAnalysis.findOne({ employeeId });
  if (!gap) {
    throw new Error("No gap analysis found for this user. Please upload a resume first.");
  }

  // 2. Resolve prerequisites and sort topologically
  const sortedSkills = await getOrderedLearningSequence(gap.missingSkills);

  // 3. Generate structured phases and modules
  const phases = generatePhasesFromSortedSkills(sortedSkills);

  // 4. Save/Upsert in database
  const learningPath = await LearningPath.findOneAndUpdate(
    { employeeId },
    {
      targetRole: gap.targetRole,
      orderedSkills: sortedSkills,
      phases,
    },
    { upsert: true, new: true }
  );

  return learningPath;
};
