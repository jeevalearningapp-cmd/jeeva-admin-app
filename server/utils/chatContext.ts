import { supabase } from "../lib/supabase";

interface UserContext {
  userId: string;
  currentLesson?: any;
  recentProgress?: any[];
  weakTopics?: string[];
}

export const buildChatContext = async (userId: string): Promise<string> => {
  // Get user's current lesson
  const { data: currentLesson } = await supabase
    .from("learning_completions")
    .select("lesson:lessons(title), module:modules(title)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  // Get recent practice performance
  const { data: recentPractice } = await supabase
    .from("practice_sessions")
    .select("score, topic:topics(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  // Build context string for AI
  let context = `You are JeevaBot, an AI tutor for medical exam preparation.

Student Context:
`;

  if (currentLesson) {
    // calculate module title safely
    const moduleTitle =
      (currentLesson as any).module?.title || "Unknown Module";
    const lessonTitle =
      (currentLesson as any).lesson?.title || "Unknown Lesson";
    context += `- Currently studying: ${lessonTitle} in ${moduleTitle}\n`;
  }

  if (recentPractice && recentPractice.length > 0) {
    context += `- Recent practice scores:\n`;
    recentPractice.forEach((p: any) => {
      const topicTitle = p.topic?.title || "Unknown Topic";
      context += `  * ${topicTitle}: ${p.score}%\n`;
    });
  }

  context += `
Instructions:
1. Provide clear, concise explanations suitable for medical students
2. Reference the student's current lesson when relevant
3. If the student is struggling (low scores), offer encouraging support
4. Use simple language and break down complex concepts
5. Suggest relevant practice topics when appropriate
6. Keep responses under 200 words unless detailed explanation is requested

Remember: You're a supportive tutor, not just an information source.`;

  return context;
};
