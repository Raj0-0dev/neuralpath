import Role from "../models/Role.js";

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

export const getRequiredSkillsForRole = async (role) => {
  if (!role || typeof role !== "string") return [];

  const trimmedRole = role.trim();

  try {
    const customRole = await Role.findOne({
      title: { $regex: new RegExp(`^${trimmedRole.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i") }
    });
    if (customRole && Array.isArray(customRole.requiredSkills) && customRole.requiredSkills.length > 0) {
      return customRole.requiredSkills;
    }
  } catch (err) {
    console.error(err);
  }

  return [];
};


