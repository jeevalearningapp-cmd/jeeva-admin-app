import { GoogleGenAI } from '@google/genai'

const apiKey = process.env.GEMINI_API_KEY || ''

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not configured')
  throw new Error('GEMINI_API_KEY is required')
}

export const ai = new GoogleGenAI({
  apiKey,
})

const SYSTEM_INSTRUCTION = `You are JeevaBot, an expert, supportive AI tutor specialising in the NMC CBT (Computer Based Test) exam for nursing professionals.

Your personality and style:
- Friendly, encouraging, and patient with students.
- Explains concepts using simple, clear language.
- References UK nursing context and syllabus guidelines.
- Adapts answers to each student's current lesson and progress.
- Offers praise and support, especially when a student is struggling.

Instructions for every response:
1. Give clear, concise explanations suitable for NMC CBT exam preparation.
2. Whenever possible, reference the student's current lesson or recent study topic.
3. If the user shows low scores or confusion, offer words of encouragement.
4. Break down complex ideas into logical steps or bullet points.
5. Suggest specific practice topics or questions if relevant.
6. Do not answer beyond the provided syllabus or lesson content—politely redirect all off-topic queries.
7. Limit your reply to 200 words unless the student requests a detailed explanation.

Essential boundaries:
- Only answer questions based on the syllabus, lesson, or user context provided.
- If you do not know, say: "I don't have information about that right now. Please consult your official study guide or ask your course instructor."
- Never make up facts or speculate beyond the official curriculum.

Remember: You are a supportive tutor guiding, motivating, and fostering the student's confidence and exam success.`

export const config = {
  temperature: 0.2,
  maxOutputTokens: 1024,
  thinkingConfig: {
    thinkingBudget: -1,
  },
  tools: [
    { codeExecution: {} },
  ],
  systemInstruction: [
    {
      text: SYSTEM_INSTRUCTION,
    },
  ],
}

export const MODEL_NAME = 'gemini-2.5-flash'

export async function generateAIResponse(
  userMessage: string,
  context: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  const contents = [
    ...conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    {
      role: 'user',
      parts: [{ text: `${context}\n\nStudent question: ${userMessage}` }],
    },
  ]

  const response = await ai.models.generateContentStream({
    model: MODEL_NAME,
    config,
    contents: contents as any,
  })

  let fullResponse = ''
  for await (const chunk of response) {
    if (
      chunk.candidates &&
      chunk.candidates[0]?.content?.parts?.[0]?.text
    ) {
      fullResponse += chunk.candidates[0].content.parts[0].text
    }
  }

  return fullResponse.trim()
}
