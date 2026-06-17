import { generateRequiredSkillsForRole, analyzeGapWithAI } from "./aiService.js";

export const STANDARD_ROLE_SKILLS = {
  "Frontend Developer": ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Git", "State Management", "REST API"],
  "Backend Developer": ["Node.js", "Express", "MongoDB", "SQL", "REST API", "Git", "System Design", "Docker"],
  "Full Stack Developer": ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML", "CSS", "Git", "REST API", "System Design"],
  "Data Scientist": ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Statistics", "Data Visualization", "Git"],
  "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git", "Terraform", "Bash"],
  "Software Engineer": ["JavaScript", "Python", "Data Structures", "Algorithms", "Git", "System Design", "REST API", "SQL"]
};

/**
 * Performs a programmatic set comparison between employee skills and required skills.
 * 
 * @param {string[]} employeeSkills - Current skills array.
 * @param {string[]} requiredSkills - Required skills array.
 * @returns {object} Object containing matchingSkills, missingSkills, and matchPercentage.
 */
export const performProgrammaticAnalysis = (employeeSkills = [], requiredSkills = []) => {
  const empNormalized = (employeeSkills || []).map(s => s.trim().toLowerCase());

  const matchingSkills = [];
  const missingSkills = [];

  (requiredSkills || []).forEach(reqSkill => {
    const idx = empNormalized.indexOf(reqSkill.trim().toLowerCase());
    if (idx !== -1) {
      matchingSkills.push(reqSkill.trim());
    } else {
      missingSkills.push(reqSkill.trim());
    }
  });

  const totalRequired = requiredSkills.length;
  const matchPercentage = totalRequired > 0 
    ? Math.round((matchingSkills.length / totalRequired) * 100)
    : 100;

  return {
    matchingSkills,
    missingSkills,
    matchPercentage
  };
};

/**
 * Resolves the required skills list for a given target role, querying the standard role mapping
 * or using AI generation if it doesn't match any standard industry title.
 * 
 * @param {string} role - The target role name.
 * @returns {Promise<string[]>} Required skills for that role.
 */
export const getRequiredSkillsForRole = async (role) => {
  if (!role || typeof role !== "string") return [];

  const trimmedRole = role.trim();
  const roleKeys = Object.keys(STANDARD_ROLE_SKILLS);
  const matchedKey = roleKeys.find(key => key.toLowerCase() === trimmedRole.toLowerCase());

  if (matchedKey) {
    return STANDARD_ROLE_SKILLS[matchedKey];
  }

  // Fallback to AI generation for custom role titles
  try {
    return await generateRequiredSkillsForRole(trimmedRole);
  } catch (error) {
    console.error(`[Gap Analysis Service] Error resolving role skills with AI: ${error.message}`);
    // Default fallback array
    return ["Problem Solving", "Communication", "Collaboration"];
  }
};

/**
 * Performs a full AI-driven gap analysis comparing candidate skills with the target role requirements.
 * 
 * @param {string[]} employeeSkills - Current candidate skills.
 * @param {string} targetRole - Target role.
 * @returns {Promise<object>} Complete suitability and recommendation report.
 */
export const performAIGapAnalysis = async (employeeSkills = [], targetRole) => {
  if (!targetRole) {
    throw new Error("Target role is required for gap analysis.");
  }
  return await analyzeGapWithAI(employeeSkills, targetRole);
};
