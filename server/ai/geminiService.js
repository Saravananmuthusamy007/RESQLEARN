import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey.trim() !== '') {
  genAI = new GoogleGenerativeAI(apiKey.trim());
}

/**
 * Generate adaptive MCQ assessment questions using Gemini 2.5 Flash
 */
export async function generateAdaptiveAssessmentWithGemini({
  levelNumber,
  levelTitle,
  practicalScore,
  difficulty,
  weakAreas = [],
  strengths = [],
  mistakes = 0,
}) {
  if (!genAI) {
    console.log('[Gemini AI]: API Key not configured; proceeding with pre-seeded fallback question engine.');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for clinical accuracy
      }
    });

    const prompt = `You are an expert Basic Life Support (BLS) and First-Aid Medical Simulation Evaluator.
Generate a structured 5-question adaptive Multiple Choice Question (MCQ) assessment for an emergency training platform.

Level ${levelNumber}: ${levelTitle}
Learner Practical Score: ${practicalScore}%
Assigned Difficulty: ${difficulty.toUpperCase()}
Learner Mistakes: ${mistakes}
Identified Weak Areas: ${weakAreas.length > 0 ? weakAreas.join('; ') : 'None'}
Identified Strengths: ${strengths.length > 0 ? strengths.join('; ') : 'Standard BLS proficiency'}

REQUIREMENTS:
1. Generate exactly 5 clinically accurate questions suited for "${difficulty}" difficulty.
2. If difficulty is "basic", ensure mandatory fundamental BLS safety principles are tested.
3. If weak areas are noted, target at least 2 questions directly to remediate those weak areas.
4. Each question MUST have exactly 4 distinct options.
5. "correctAnswer" MUST be an integer index (0, 1, 2, or 3) indicating the correct choice.
6. Provide a concise, educational explanation citing standard first-aid/BLS protocols.
7. Return strictly valid JSON adhering to this exact format:

{
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q1",
      "question": "Clear question text here?",
      "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
      "correctAnswer": 0,
      "explanation": "Clinical rationale explaining why this option is correct.",
      "skill": "Specific BLS Skill Name"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn(`[Gemini AI Notice]: Adaptive generation call error (${err.message}). Using fallback question bank.`);
    return null;
  }
}

/**
 * Chat with Gemini Learning Partner
 */
export async function chatWithGeminiPartner({ message, history = [], userRole = 'learner', platformContext = {} }) {
  if (!genAI) {
    return null; // Triggers clinical fallback engine
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemInstruction = userRole === 'admin'
      ? `You are the ResqLearn Executive Medical Simulation Assistant for Administrators.
         You analyze learner performance, training metrics, BLS protocols, and level curriculum.
         Keep answers analytical, professional, and clear.
         Platform Summary: ${JSON.stringify(platformContext)}`
      : `You are the ResqLearn AI Emergency Training Partner.
         You provide encouraging, highly accurate first-aid and BLS educational guidance.
         Keep explanations concise, step-by-step, and safe.
         Remind learners that ResqLearn is an educational training simulation and not a substitute for professional EMS.`;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to assist as the ResqLearn Medical Simulation Partner.' }] },
        ...history.slice(-6).map(h => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        }))
      ]
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (err) {
    console.warn(`[Gemini AI Notice]: Chat call failed (${err.message}). Using emergency knowledge fallback.`);
    return null;
  }
}

export default {
  generateAdaptiveAssessmentWithGemini,
  chatWithGeminiPartner,
};
