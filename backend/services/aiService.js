export const RESUME_ANALYSIS_PROMPT = `You are an expert ATS (Applicant Tracking System) parser.
Your task is to analyze the raw text extracted from a candidate's resume and extract key professional details in valid JSON.

Resume Text:
"""
{resumeText}
"""

Please extract and return the following fields:
1. "skills": A flat array of technical and professional skills mentioned in the resume.
2. "experienceYears": The estimated number of years of professional experience as an integer.
3. "targetRole": The candidate's primary or target professional role title.

Response Format:
Return ONLY a valid JSON object matching this schema. Do not include markdown formatting, markdown code blocks, or extra text.
{
  "skills": ["string"],
  "experienceYears": 0,
  "targetRole": "string"
}`;

/**
 * Analyzes raw resume text using an LLM to extract key professional attributes.
 * 
 * @param {string} resumeText - The raw text content of the resume.
 * @returns {Promise<object>} A promise resolving to the mock/structured parsed data (skills, experience, target role).
 */
export const analyzeResumeText = async (resumeText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.warn("[AI Service] Warning: GEMINI_API_KEY is not defined or is placeholder. Using fallback keyword matching extraction.");
    return fallbackExtract(resumeText);
  }

  try {
    const prompt = RESUME_ANALYSIS_PROMPT.replace("{resumeText}", resumeText);
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
            responseMimeType: "application/json",
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

    const outputText = result.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(outputText);

    return {
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      experienceYears: Number.isInteger(parsedData.experienceYears) ? parsedData.experienceYears : 0,
      targetRole: typeof parsedData.targetRole === "string" ? parsedData.targetRole : "",
    };
  } catch (error) {
    console.error("[AI Service] LLM Skill extraction failed:", error.message);
    // Graceful fallback instead of crashing
    return fallbackExtract(resumeText);
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
