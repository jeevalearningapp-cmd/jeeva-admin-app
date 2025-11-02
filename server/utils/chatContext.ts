import { supabase } from '../lib/supabase.js'

interface UserContext {
  currentLesson?: {
    title: string
    module: string
    topic: string
  }
  recentPractice?: Array<{
    topic: string
    score: number
  }>
  weakTopics?: string[]
}

export async function buildChatContext(userId: string): Promise<string> {
  try {
    const { data: currentLesson } = await supabase
      .from('learning_completions')
      .select(`
        lesson_id,
        lessons (
          title,
          topic_id,
          topics (
            title,
            module_id,
            modules (title)
          )
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    const { data: recentPractice } = await supabase
      .from('practice_sessions')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    let context = `You are JeevaBot, an AI tutor helping an Indian nurse prepare for the UK NMC CBT (Nursing and Midwifery Council Computer-Based Test) exam.\n\nStudent Context:\n`

    if (currentLesson?.lessons) {
      const lesson = currentLesson.lessons as any
      const topic = lesson.topics
      const module = topic?.modules

      context += `- Currently studying: "${lesson.title}"`
      if (topic) context += ` in topic "${topic.title}"`
      if (module) context += ` from module "${module.title}"`
      context += '\n'
    }

    if (recentPractice && recentPractice.length > 0) {
      context += `- Recent practice activity: ${recentPractice.length} session(s) in the last week\n`
    } else {
      context += `- New student: Just getting started with the platform\n`
    }

    context += `\nExam Focus Areas:
- Numeracy: Medication dosage calculations, IV flow rates, unit conversions, fluid balance
- Clinical Knowledge: UK-specific nursing care, patient safety, infection control, wound care
- NMC Code (Professional Standards): UK healthcare ethics, accountability, patient advocacy
- Mental Capacity Act: UK law on patient decision-making capacity
- Safeguarding: Recognising abuse, reporting protocols, child protection
- Consent & Confidentiality: Valid consent, GDPR, confidentiality vs safeguarding

Instructions:
1. Provide clear, concise explanations relevant to UK nursing practice and NMC CBT exam
2. For numeracy questions, show step-by-step calculations with units
3. For clinical scenarios, reference UK protocols and NMC Code principles where applicable
4. Be culturally aware - mention differences between Indian and UK healthcare systems when relevant
5. If the student is struggling, offer encouraging support and study tips
6. Use simple language and break down complex nursing concepts
7. Suggest relevant practice topics aligned with NMC CBT exam format
8. Keep responses under 200 words unless detailed explanation is requested

Remember: You're a supportive nursing tutor helping students transition from Indian nursing education to UK healthcare standards. Focus on exam-relevant, practical nursing knowledge.`

    return context
  } catch (error) {
    console.error('Error building chat context:', error)
    return `You are JeevaBot, an AI tutor helping nurses prepare for the UK NMC CBT exam. Provide clear, supportive guidance on nursing topics.`
  }
}
