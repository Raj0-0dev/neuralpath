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

/**
 * Performs Kahn's topological sort on a directed graph of skills.
 * 
 * @param {object} graph - Graph structure containing adjList, inDegrees, and nameMap.
 * @returns {string[]} Ordered list of skill names (original casing).
 */
export const kahnSort = (graph) => {
  const { adjList, inDegrees, nameMap } = graph;
  const queue = [];
  const sorted = [];

  // Enqueue all nodes with in-degree of 0
  for (const [node, inDegree] of Object.entries(inDegrees)) {
    if (inDegree === 0) {
      queue.push(node);
    }
  }

  // Process the queue
  while (queue.length > 0) {
    const node = queue.shift();
    sorted.push(nameMap[node]);

    const neighbors = adjList[node] || [];
    for (const neighbor of neighbors) {
      inDegrees[neighbor]--;
      if (inDegrees[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Check for cycles
  const totalNodesCount = Object.keys(inDegrees).length;
  if (sorted.length < totalNodesCount) {
    console.warn("[Kahn Sort] Cycle detected in dependencies! Graph is not a DAG.");
    // Fallback: append any unvisited nodes to ensure no skill is lost
    const sortedSet = new Set(sorted.map(s => s.toLowerCase()));
    for (const key of Object.keys(inDegrees)) {
      if (!sortedSet.has(key)) {
        sorted.push(nameMap[key]);
      }
    }
  }

  return sorted;
};




