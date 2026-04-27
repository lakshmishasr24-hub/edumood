import { GEMINI_API_KEY } from "./ai-config.js";
import { GoogleGenAI } from "https://esm.run/@google/genai";

let aiInstance = null;

function getAI() {
    if (!aiInstance) {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
            return null; // Return null to indicate fallback should be used
        }
        aiInstance = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
    return aiInstance;
}

export async function generateMoodContent(moodLabel) {
    const ai = getAI();
    if (!ai) {
        console.warn("AI Key not set. Falling back to local data.");
        return null; // Signals app.js to use local data fallback
    }
    
    const prompt = `You are an empathetic, insightful wellness coach for teachers.
A teacher has indicated they are currently feeling: "${moodLabel}".
Generate personalized, supportive content to help them process their emotion and take a constructive step.

Provide the response in raw JSON format with the following fields:
1. "quote": A short, powerful, empathetic motivational quote addressing their exact state.
2. "action": A small, highly actionable, 1-2 sentence behavioral step they can execute right now to help them.
3. "gita_quote": A relevant philosophical verse from the Bhagavad Gita that provides perspective on their current feeling. Do not include the reference in the string itself.
4. "gita_reference": The chapter and verse reference (e.g., "Bhagavad Gita 2.47").

Ensure the tone is warm, professional, not toxic positivity, but genuinely grounding. ONLY OUTPUT VALID JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        quote: { type: "STRING" },
                        action: { type: "STRING" },
                        gita_quote: { type: "STRING" },
                        gita_reference: { type: "STRING" }
                    },
                    required: ["quote", "action", "gita_quote", "gita_reference"]
                }
            }
        });
        
        return JSON.parse(response.text);
    } catch (error) {
        console.error("AI Generation Error: ", error);
        return null; // Fallback on error
    }
}
        
export async function analyzeMoodTrend(moodHistoryMap) {
    const ai = getAI();
    if (!ai) return null;
    
    // Convert e.g. { "Inspired": 2, "Overwhelmed": 1 } to string
    const trendSummaries = Object.entries(moodHistoryMap)
                                 .map(([k,v]) => `${k}: ${v} times`)
                                 .join(', ');
                                 
    const prompt = `You are a professional, empathetic wellness AI focused on teacher well-being.
Here is the user's mood frequency over the last few days: ${trendSummaries || "No mood data recorded yet."}.
Provide a short 2-sentence encouraging, insightful psychological observation about this pattern. Be warm, professional, and actionable. Do not use markdown, just plain text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (e) {
        console.error("AI Insight Error:", e);
        return null;
    }
}
