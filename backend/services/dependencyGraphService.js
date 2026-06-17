import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEPENDENCIES_PATH = path.join(__dirname, "../data/dependencies.json");

let dependencies = {};

try {
  const fileContent = fs.readFileSync(DEPENDENCIES_PATH, "utf8");
  dependencies = JSON.parse(fileContent);
} catch (error) {
  console.error("[Dependency Graph Service] Failed to load dependencies.json:", error.message);
}

// Normalize key lookup for case-insensitivity
const normalizedDependencies = {};
for (const [key, value] of Object.entries(dependencies)) {
  normalizedDependencies[key.toLowerCase()] = {
    originalName: key,
    prereqs: value
  };
}

/**
 * Resolves all prerequisites for a list of missing skills recursively.
 * 
 * @param {string[]} missingSkills - Array of missing skill names.
 * @returns {Promise<string[]>} Resolved list of skills.
 */
export const resolvePrerequisites = async (missingSkills) => {
  if (!Array.isArray(missingSkills)) {
    return [];
  }

  const visited = new Set();
  const resolved = [];

  const resolve = (skill) => {
    const normalizedSkill = skill.trim().toLowerCase();
    if (!normalizedSkill) return;

    if (visited.has(normalizedSkill)) {
      return;
    }
    visited.add(normalizedSkill);

    const match = normalizedDependencies[normalizedSkill];
    if (match) {
      // Recursively resolve prerequisites
      for (const prereq of match.prereqs) {
        resolve(prereq);
      }
      resolved.push(match.originalName);
    } else {
      // If the skill is not in dependencies.json, it has no prerequisites
      resolved.push(skill.trim());
    }
  };

  for (const skill of missingSkills) {
    resolve(skill);
  }

  return resolved;
};

/**
 * Constructs a directed graph representation (adjacency list & in-degrees) for the resolved skills list.
 * Edges point from prerequisite to dependent skill.
 * 
 * @param {string[]} resolvedSkills - Array of resolved skills.
 * @returns {object} { adjList, inDegrees, nameMap }
 */
export const buildDirectedGraph = (resolvedSkills) => {
  const adjList = {};
  const inDegrees = {};
  const skillSet = new Set(resolvedSkills.map(s => s.toLowerCase()));
  const nameMap = {}; // Maps lowercase skill to original/correct casing

  // Initialize graph structures
  resolvedSkills.forEach(skill => {
    const key = skill.toLowerCase();
    adjList[key] = [];
    inDegrees[key] = 0;
    nameMap[key] = skill;
  });

  // Build edges and in-degrees
  resolvedSkills.forEach(skill => {
    const key = skill.toLowerCase();
    const match = normalizedDependencies[key];
    if (match) {
      match.prereqs.forEach(prereq => {
        const prereqKey = prereq.toLowerCase();
        // Only build edges within our resolved skills subset
        if (skillSet.has(prereqKey)) {
          // Edge goes from prereq -> skill
          adjList[prereqKey].push(key);
          inDegrees[key]++;
        }
      });
    }
  });

  return { adjList, inDegrees, nameMap };
};



