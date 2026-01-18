import { GoogleGenerativeAI } from "@google/generative-ai";

// Backend secret - NEVER exposed to clients
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

if (!GEMINI_API_KEY) {
  console.warn(
    "GEMINI_API_KEY is not configured in backend environment variables",
  );
}

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const chatModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
});

export const getModelResponse = async (
  prompt: string,
  conversationHistory: { role: string; content: string }[] = [],
): Promise<string> => {
  try {
    const chat = chatModel.startChat({
      history: conversationHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get AI response");
  }
};
