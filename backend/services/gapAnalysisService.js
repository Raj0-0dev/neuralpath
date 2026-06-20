import Role from "../models/Role.js";

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

  // 1. Try to find a custom role in the database first
  try {
    const customRole = await Role.findOne({
      title: { $regex: new RegExp(`^${trimmedRole.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i") }
    });
    if (customRole && Array.isArray(customRole.requiredSkills) && customRole.requiredSkills.length > 0) {
      return customRole.requiredSkills;
    }
  } catch (err) {
    console.error("Error looking up custom role in database:", err);
  }

  // 2. Check standard roles map
  const roleKeys = Object.keys(STANDARD_ROLE_SKILLS);
  const matchedKey = roleKeys.find(key => key.toLowerCase() === trimmedRole.toLowerCase());

  if (matchedKey) {
    return STANDARD_ROLE_SKILLS[matchedKey];
  }

  // Map custom roles locally to standard templates to guarantee exactly 1 LLM call is made
  const roleLower = trimmedRole.toLowerCase();
  if (roleLower.includes("front")) {
    return STANDARD_ROLE_SKILLS["Frontend Developer"];
  } else if (roleLower.includes("back")) {
    return STANDARD_ROLE_SKILLS["Backend Developer"];
  } else if (roleLower.includes("full") || roleLower.includes("stack")) {
    return STANDARD_ROLE_SKILLS["Full Stack Developer"];
  } else if (roleLower.includes("data") || roleLower.includes("ml") || roleLower.includes("machine")) {
    return STANDARD_ROLE_SKILLS["Data Scientist"];
  } else if (roleLower.includes("devops") || roleLower.includes("cloud") || roleLower.includes("infra") || roleLower.includes("sre")) {
    return STANDARD_ROLE_SKILLS["DevOps Engineer"];
  } else {
    return STANDARD_ROLE_SKILLS["Software Engineer"];
  }
};


