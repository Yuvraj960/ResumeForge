/**
 * Unified AI Service
 * ------------------
 * Supports two providers, controlled by the AI_PROVIDER env variable:
 *
 *   AI_PROVIDER=ollama   → Uses your local Ollama instance (default: http://localhost:11434)
 *   AI_PROVIDER=gemini   → Uses Google Gemini API (requires GEMINI_API_KEY)
 *
 * Switch providers by changing AI_PROVIDER in your .env file.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Prompt builder (shared by both providers) ──────────────────────────────

const buildPrompt = (userData, jdText) => {
  const { projects, skills, certifications, profiles } = userData;

  return `
You are an expert ATS-optimized resume writer. Analyze the job description and the user's data below.
Your task is to select and tailor the most relevant information to match the job description.

---
JOB DESCRIPTION:
${jdText}
---

USER PROFILES:
${JSON.stringify(profiles, null, 2)}

USER PROJECTS (full list):
${JSON.stringify(projects, null, 2)}

USER CERTIFICATIONS (full list):
${JSON.stringify(certifications, null, 2)}

USER SKILLS:
${JSON.stringify(skills, null, 2)}
---

INSTRUCTIONS:
1. Write a compelling 2-3 sentence professional_summary tailored to the JD.
2. Select the top 3-4 most relevant projects from the user's list. Rewrite descriptions to use JD keywords naturally.
3. Select the most relevant certifications (max 4).
4. Curate the skills list to highlight what's most relevant to the JD first.
5. Return ONLY a valid JSON object. NO markdown, NO code blocks, NO explanation — just raw JSON.

OUTPUT FORMAT (strict JSON, no extra text):
{
  "professional_summary": "...",
  "skills": {
    "Languages": ["..."],
    "Frameworks": ["..."],
    "Tools": ["..."],
    "Databases": ["..."]
  },
  "selected_projects": [
    {
      "title": "...",
      "description": "...",
      "techStack": ["..."],
      "liveLink": "...",
      "repoLink": "..."
    }
  ],
  "selected_certifications": [
    { "name": "...", "issuer": "...", "date": "..." }
  ]
}
`.trim();
};

// ── JSON cleaner (strips markdown code fences if model adds them) ───────────

const parseJson = (text) => {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to extract the first {...} block if there's surrounding text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`AI returned non-JSON response:\n${text.slice(0, 400)}`);
  }
};

// ── Ollama provider ────────────────────────────────────────────────────────

const callOllama = async (prompt) => {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'gemma3:12b';

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  // Ollama response shape: { message: { content: "..." } }
  return data.message?.content || data.response || '';
};

// ── Gemini provider ────────────────────────────────────────────────────────

const callGemini = async (prompt) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ── Main export (provider-aware) ───────────────────────────────────────────

const generateResumeJson = async (userData, jdText) => {
  const prompt = buildPrompt(userData, jdText);
  const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase();

  let rawText;

  if (provider === 'ollama') {
    console.log(`🦙 Using Ollama model: ${process.env.OLLAMA_MODEL || 'gemma3'}`);
    rawText = await callOllama(prompt);
  } else if (provider === 'gemini') {
    console.log(`✨ Using Gemini model: ${process.env.GEMINI_MODEL || 'gemini-1.5-flash'}`);
    rawText = await callGemini(prompt);
  } else {
    throw new Error(`Unknown AI_PROVIDER: "${provider}". Use "ollama" or "gemini".`);
  }

  return parseJson(rawText);
};

module.exports = { generateResumeJson };
