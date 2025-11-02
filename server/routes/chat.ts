import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { generateAIResponse } from '../lib/gemini.js'
import { buildChatContext } from '../utils/chatContext.js'
import { checkAIRateLimit, updateAIUsageStats } from '../utils/rateLimiter.js'

const router = Router()

router.post('/send', async (req, res) => {
  try {
    const { userId, content, conversationId } = req.body

    if (!userId || !content) {
      return res.status(400).json({
        error: 'Missing required fields: userId, content',
      })
    }

    const rateLimit = await checkAIRateLimit(userId)
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: `Daily AI message limit reached (${rateLimit.limit} messages/day)`,
        limit: rateLimit.limit,
        current: rateLimit.current,
        remaining: 0,
      })
    }

    let activeConversationId = conversationId

    if (!activeConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userId,
          title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        })
        .select()
        .single()

      if (convError) throw convError
      activeConversationId = newConv.id
    }

    const { data: userMsg, error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'user',
        content,
      })
      .select()
      .single()

    if (userMsgError) throw userMsgError

    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(10)

    const conversationHistory =
      history?.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })) || []

    const context = await buildChatContext(userId)

    const aiResponse = await generateAIResponse(
      content,
      context,
      conversationHistory.slice(0, -1)
    )

    const estimatedTokens = Math.ceil((content.length + aiResponse.length) / 4)

    const { data: aiMsg, error: aiMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: {
          model: 'gemini-2.5-flash',
          tokensUsed: estimatedTokens,
        },
      })
      .select()
      .single()

    if (aiMsgError) throw aiMsgError

    await updateAIUsageStats(userId, estimatedTokens)

    res.json({
      success: true,
      conversationId: activeConversationId,
      userMessage: userMsg,
      aiMessage: aiMsg,
      rateLimit: {
        limit: rateLimit.limit,
        remaining: rateLimit.remaining - 1,
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    res.status(500).json({
      error: error.message || 'Failed to send message',
    })
  }
})

router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      conversations: data || [],
    })
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({
      error: error.message || 'Failed to fetch conversations',
    })
  }
})

router.get('/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    res.json({
      success: true,
      messages: data || [],
    })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    res.status(500).json({
      error: error.message || 'Failed to fetch messages',
    })
  }
})

router.get('/rate-limit/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const rateLimit = await checkAIRateLimit(userId)

    res.json({
      success: true,
      rateLimit,
    })
  } catch (error: any) {
    console.error('Error checking rate limit:', error)
    res.status(500).json({
      error: error.message || 'Failed to check rate limit',
    })
  }
})

export default router
