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
  // Placeholder skeleton - Gemini/OpenAI integration logic will be implemented later.
  console.log("[AI Service] Skeleton: analyzeResumeText called");
  return {
    skills: [],
    experienceYears: 0,
    targetRole: "",
  };
};
