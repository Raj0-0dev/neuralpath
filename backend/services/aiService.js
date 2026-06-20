export const RESUME_ANALYSIS_PROMPT = `You are an expert ATS (Applicant Tracking System) parser and technical evaluator.
Your task is to analyze the raw text extracted from a candidate's resume, evaluate their experience level for each of the target role's required skills on a scale of 0 to 10, and return the structured JSON data.

Target Role Required Skills to Evaluate:
{targetRoleRequirements}

Resume Text:
"""
{resumeText}
"""

Evaluation Guidelines (Scale 0-10):
- 0: The skill is completely missing or has no evidence of usage in the resume.
- 1-3: Low readiness. The skill is only listed in a skills list, or has evidence of minor use in simple projects.
- 4-7: Moderate readiness. The skill is used in a professional job setting or complex project, showing solid practical experience.
- 8-10: High readiness. The candidate has done heavy engineering, system architecture, or performance optimization work with this skill.

Response Format:
Return ONLY a valid JSON object matching this schema. Do not include markdown formatting, markdown code blocks, or extra text.
{
  "skillsWithScores": [
    {
      "name": "string",
      "score": 0,
      "reason": "string"
    }
  ],
  "experienceYears": 0,
  "targetRole": "string"
}`;

/**
 * Centered fetch wrapper that handles timeouts and makes a single attempt (no retries).
 */
const fetchGemini = async (prompt, responseMimeType = "text/plain") => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const controller = new AbortController();
  // Use a safer 30-second timeout limit to avoid aborting under heavy load
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType,
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (Status ${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    return result.candidates[0].content.parts[0].text;

  } catch (error) {
    clearTimeout(timeoutId);
    const isTimeout = error.name === "AbortError";
    console.error(`[AI Service] Request failed: ${isTimeout ? "Timeout" : error.message}`);
    throw error;
  }
};

/**
 * Analyzes raw resume text using an LLM to extract key professional attributes and grade their readiness.
 * 
 * @param {string} resumeText - The raw text content of the resume.
 * @param {string[]} targetRoleRequirements - Required skills list.
 * @returns {Promise<object>} A promise resolving to the structured parsed data (skills, skillsWithScores, experience, target role).
 */
export const analyzeResumeText = async (resumeText, targetRoleRequirements = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY is not defined or is placeholder.");
  }

  try {
    const reqsString = Array.isArray(targetRoleRequirements) 
      ? targetRoleRequirements.map(s => `- ${s}`).join("\n")
      : "";

    const prompt = RESUME_ANALYSIS_PROMPT
      .replace("{targetRoleRequirements}", reqsString)
      .replace("{resumeText}", resumeText);

    const outputText = await fetchGemini(prompt, "application/json");
    const parsedData = JSON.parse(outputText);

    const skillsWithScores = Array.isArray(parsedData.skillsWithScores) ? parsedData.skillsWithScores : [];
    
    // Maintain backwards compatibility with a flat skills list (score > 0)
    const skills = skillsWithScores
      .filter(s => s.score > 0)
      .map(s => s.name);

    return {
      skills,
      skillsWithScores,
      experienceYears: Number.isInteger(parsedData.experienceYears) ? parsedData.experienceYears : 0,
      targetRole: typeof parsedData.targetRole === "string" ? parsedData.targetRole : "",
    };
  } catch (error) {
    console.error("[AI Service] LLM Skill extraction failed:", error.message);
    throw error;
  }
};

// Simple regex fallback extractor
const fallbackExtract = (text) => {
  const lowerText = text.toLowerCase();
  const commonSkills = [
    "react", "node", "javascript", "typescript", "python", "java", "c++", "c#", "ruby", 
    "php", "html", "css", "sql", "nosql", "mongodb", "postgres", "mysql", "aws", "gcp", 
    "azure", "docker", "kubernetes", "git", "agile", "scrum", "machine learning", "ai",
    "project management", "system design", "rest api", "graphql", "devops", "ci/cd"
  ];

  const matchedSkills = commonSkills.filter(skill => {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedSkill}\\b`, "i");
    return regex.test(lowerText);
  });

  // Capitalize matched skills nicely
  const capitalizedSkills = matchedSkills.map(skill => {
    if (skill === "aws" || skill === "gcp" || skill === "sql" || skill === "api" || skill === "ci/cd") return skill.toUpperCase();
    if (skill === "javascript") return "JavaScript";
    if (skill === "typescript") return "TypeScript";
    if (skill === "mongodb") return "MongoDB";
    return skill.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  });

  // Simple experience estimate (look for "X years" or "X+ years")
  let experienceYears = 0;
  const expMatch = text.match(/(\d+)\+?\s*years?\s+(?:of\s+)?experience/i);
  if (expMatch) {
    experienceYears = parseInt(expMatch[1], 10);
  }

  // Simple target role estimate
  let targetRole = "";
  const roles = ["software engineer", "developer", "product manager", "data scientist", "system analyst", "project manager", "designer"];
  for (const role of roles) {
    if (lowerText.includes(role)) {
      targetRole = role.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      break;
    }
  }

  return {
    skills: capitalizedSkills,
    experienceYears,
    targetRole: targetRole || "Professional",
  };
};

export const ROLE_SKILLS_PROMPT = `You are an expert HR and recruitment analyst.
Given a job role/title, generate a list of the top 8 essential technical and professional skills required for this role.

Role: {role}

Response Format:
Return ONLY a valid JSON array of strings. Do not include markdown formatting, markdown code blocks, or extra text.
Example: ["React", "JavaScript", "Redux"]`;

export const AI_GAP_ANALYSIS_PROMPT = `You are a career development coach and technical evaluator.
Analyze the candidate's current skills against the target role and provide a structured gap analysis in valid JSON.

Candidate Skills:
{employeeSkills}

Target Role:
{targetRole}

Provide:
1. "matchPercentage": A suitability percentage score (0-100) based on the alignment of candidate skills to target role requirements.
2. "matchingSkills": Array of candidate skills that align with the role.
3. "missingSkills": Array of key skills the candidate needs to acquire.
4. "recommendations": Array of structured learning action items to bridge the gap.

Response Format:
Return ONLY a valid JSON object matching this schema. Do not include markdown formatting, code blocks, or extra text.
{
  "matchPercentage": 0,
  "matchingSkills": ["string"],
  "missingSkills": ["string"],
  "recommendations": ["string"]
}`;

/**
 * Dynamically generates a list of required skills for a target role using LLM.
 * 
 * @param {string} role - The target role title.
 * @returns {Promise<string[]>} List of required skills.
 */
export const generateRequiredSkillsForRole = async (role) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY is not defined or is placeholder.");
  }

  try {
    const prompt = ROLE_SKILLS_PROMPT.replace("{role}", role);
    const outputText = await fetchGemini(prompt, "application/json");
    const parsedData = JSON.parse(outputText);

    return Array.isArray(parsedData) ? parsedData : fallbackRoleSkills(role);
  } catch (error) {
    console.error("[AI Service] LLM role skills generation failed:", error.message);
    throw error;
  }
};

/**
 * Analyzes skill gaps between current employee skills and a target role.
 * 
 * @param {string[]} employeeSkills - Current candidate skills.
 * @param {string} targetRole - Target role title.
 * @returns {Promise<object>} Detailed gap analysis matching target response schema.
 */
export const analyzeGapWithAI = async (employeeSkills, targetRole) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY is not defined or is placeholder.");
  }

  try {
    const prompt = AI_GAP_ANALYSIS_PROMPT
      .replace("{employeeSkills}", JSON.stringify(employeeSkills))
      .replace("{targetRole}", targetRole);
    const outputText = await fetchGemini(prompt, "application/json");
    const parsedData = JSON.parse(outputText);

    return {
      matchPercentage: typeof parsedData.matchPercentage === "number" ? parsedData.matchPercentage : 0,
      matchingSkills: Array.isArray(parsedData.matchingSkills) ? parsedData.matchingSkills : [],
      missingSkills: Array.isArray(parsedData.missingSkills) ? parsedData.missingSkills : [],
      recommendations: Array.isArray(parsedData.recommendations) ? parsedData.recommendations : [],
    };
  } catch (error) {
    console.error("[AI Service] LLM gap analysis failed:", error.message);
    throw error;
  }
};

const fallbackRoleSkills = (role) => {
  const roleLower = (role || "").toLowerCase();
  if (roleLower.includes("front")) {
    return ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Git", "State Management", "REST API"];
  } else if (roleLower.includes("back")) {
    return ["Node.js", "Express", "MongoDB", "SQL", "REST API", "Git", "System Design", "Docker"];
  } else if (roleLower.includes("data")) {
    return ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Statistics", "Data Visualization", "Git"];
  } else if (roleLower.includes("devops")) {
    return ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git", "Terraform", "Bash"];
  } else if (roleLower.includes("full")) {
    return ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML", "CSS", "Git", "REST API", "System Design"];
  } else {
    return ["JavaScript", "Python", "Data Structures", "Algorithms", "Git", "System Design", "REST API", "SQL"];
  }
};

const fallbackGapAnalysis = (employeeSkills, targetRole) => {
  const requiredSkills = fallbackRoleSkills(targetRole);
  const employeeSkillsLower = (employeeSkills || []).map(s => s.toLowerCase());

  const matchingSkills = [];
  const missingSkills = [];

  requiredSkills.forEach(skill => {
    if (employeeSkillsLower.includes(skill.toLowerCase())) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const totalRequired = requiredSkills.length;
  const matchPercentage = totalRequired > 0 
    ? Math.round((matchingSkills.length / totalRequired) * 100)
    : 100;

  const recommendations = missingSkills.map(skill => 
    `Learn ${skill} through documentation, build a project, or take a course to bridge the gap.`
  );

  return {
    matchPercentage,
    matchingSkills,
    missingSkills,
    recommendations: recommendations.length > 0 ? recommendations : ["Your skills already fully match the target role!"]
  };
};

