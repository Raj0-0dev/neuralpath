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

/**
 * Resolves dependencies and returns the topologically sorted learning sequence of skills.
 * 
 * @param {string[]} missingSkills - List of missing skills.
 * @returns {Promise<string[]>} Ordered learning sequence.
 */
export const getOrderedLearningSequence = async (missingSkills) => {
  const resolved = await resolvePrerequisites(missingSkills);
  const graph = buildDirectedGraph(resolved);
  return kahnSort(graph);
};

/**
 * Generates structured learning phases and modules from a sorted list of skills.
 * 
 * @param {string[]} sortedSkills - Topologically sorted skills.
 * @returns {object[]} Array of generated phases matching the schema.
 */
export const generatePhasesFromSortedSkills = (sortedSkills) => {
  if (!Array.isArray(sortedSkills) || sortedSkills.length === 0) {
    return [];
  }

  const total = sortedSkills.length;
  // Divide into at most 3 phases
  let p1Size = Math.ceil(total / 3);
  let p2Size = Math.ceil((total - p1Size) / 2);

  // If very few skills, just put them in 1 or 2 phases
  if (total <= 3) {
    p1Size = total;
    p2Size = 0;
  }

  const phaseSkills = [
    sortedSkills.slice(0, p1Size),
    sortedSkills.slice(p1Size, p1Size + p2Size),
    sortedSkills.slice(p1Size + p2Size)
  ].filter(arr => arr.length > 0);

  const colors = ["#8b5cf6", "#d97706", "#059669"];
  const titles = [
    "Phase 1: Foundational Prerequisites",
    "Phase 2: Core Gap Competencies",
    "Phase 3: Advanced Applications"
  ];

  return phaseSkills.map((skills, idx) => {
    return {
      title: titles[idx] || `Phase ${idx + 1}: Technical Integration`,
      color: colors[idx] || "#4f46e5",
      modules: skills.map((skill, index) => {
        const type = index % 2 === 0 ? "Course" : "Lab";
        const duration = index % 2 === 0 ? "3 hrs" : "2 hrs";
        const level = idx === 0 ? "Basic" : idx === 1 ? "Intermediate" : "Advanced";
        const description = type === "Course" 
          ? `Master essential theories, patterns, and hands-on designs to acquire industry proficiency in ${skill}.`
          : `Practical workspace sandbox lab with unit tests and challenges targeting ${skill} integration.`;

        return {
          id: `mod_${idx}_${index}_${skill.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          title: type === "Course" ? `Fundamentals of ${skill}` : `${skill} Engineering Lab`,
          type,
          duration,
          level,
          description,
          skillName: skill
        };
      })
    };
  });
};






