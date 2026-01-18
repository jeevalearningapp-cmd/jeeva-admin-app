import express from "express";
import { getModelResponse } from "../lib/gemini.js";
import { buildChatContext } from "../utils/chatContext.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

// Helper to check message limits
const checkMessageLimit = async (userId: string): Promise<boolean> => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("ai_usage_stats")
    .select("message_count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error checking limits:", error);
    return true; // Fail open if error
  }

  // limit is 50 messages per day
  return (data?.message_count || 0) < 50;
};

// Helper to update usage stats
const updateUsageStats = async (userId: string, tokens: number) => {
  const today = new Date().toISOString().split("T")[0];

  // Upsert usage stats
  // First try to get existing row
  const { data } = await supabase
    .from("ai_usage_stats")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (data) {
    await supabase
      .from("ai_usage_stats")
      .update({
        message_count: data.message_count + 1,
        total_tokens: data.total_tokens + tokens,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
  } else {
    await supabase.from("ai_usage_stats").insert({
      user_id: userId,
      date: today,
      message_count: 1,
      total_tokens: tokens,
    });
  }
};

// Helper to get conversation history
const getConversationHistory = async (conversationId: string) => {
  const { data } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true }) // Oldest first for context
    .limit(20); // Limit context window

  return data || [];
};

// POST /api/chat/send
router.post("/send", async (req, res) => {
  try {
    const { userId, conversationId, content } = req.body;

    // Verify user authentication (simplified verification via headers or body for now,
    // ideally should use Supabase auth token from headers)
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user || user.id !== userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid token or user mismatch" });
    }

    // Check rate limit
    const canSend = await checkMessageLimit(userId);
    if (!canSend) {
      return res.status(429).json({
        error: "Daily message limit reached (50 messages/day)",
      });
    }

    // Save user message
    const { data: userMsg, error: msgError } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role: "user",
        content,
      })
      .select()
      .single();

    if (msgError) {
      throw msgError;
    }

    // Build context and get AI response
    const context = await buildChatContext(userId);
    const history = await getConversationHistory(conversationId);

    // Prepend context to the prompt or history?
    // Usually system instructions are top level.
    // getModelResponse takes (prompt, history).
    // prompt is the new message? No, prompt is usually the full logical prompt.
    // If using chat mode, the prompt is the new user input, and context should be system instruction.
    // The gemini.ts wrapper uses `chat.sendMessage(prompt)`.
    // And `history` is passed to `startChat`.
    // We should add the context as a system instruction or the first message in history.
    // Since `gemini.ts` expects `history` as array of messages, we can prepend a system message if the model supports it
    // or just assume `gemini.ts` needs adjustment.
    // The `gemini.ts` wrapper created earlier creates a chat session.
    // `gemini-1.5-flash` supports system instructions.

    // Let's modify the call to send the context.
    // Actually, `gemini.ts` wrapper is simple.
    // Current wrapper: `chatModel.startChat({ history... }).sendMessage(prompt)`
    // We can inject context into the prompt or valid history.
    // Let's append context to the prompt for now as a simple solution.
    // Or better, add it as a 'user' message at the start of history if history is empty.

    let effectivePrompt = content;
    // If history is empty, this is the first message (or close to it), so include context.
    // But `buildChatContext` returns a system prompt style string.
    // Let's prepend it to the current prompt to ensure it's considered.
    effectivePrompt = `${context}\n\nUser Question: ${content}`;

    const aiResponse = await getModelResponse(effectivePrompt, history);

    // Save AI response
    const { data: aiMsg } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: aiResponse,
        metadata: {
          model: "gemini-1.5-flash",
          tokensUsed: Math.ceil(aiResponse.length / 4),
        },
      })
      .select()
      .single();

    // Update usage stats
    await updateUsageStats(userId, Math.ceil(aiResponse.length / 4));

    res.json({ userMsg, aiMsg });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
