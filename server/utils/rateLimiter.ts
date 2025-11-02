import { supabase } from '../lib/supabase.js'

export interface RateLimitResult {
  allowed: boolean
  limit: number
  current: number
  remaining: number
}

export async function checkAIRateLimit(userId: string): Promise<RateLimitResult> {
  try {
    const userLimit = await getUserAILimit(userId)
    
    const today = new Date().toISOString().split('T')[0]

    const { data: usageData } = await supabase
      .from('ai_usage_stats')
      .select('message_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    const currentCount = usageData?.message_count || 0

    return {
      allowed: currentCount < userLimit,
      limit: userLimit,
      current: currentCount,
      remaining: Math.max(0, userLimit - currentCount),
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    return {
      allowed: true,
      limit: 10,
      current: 0,
      remaining: 10,
    }
  }
}

async function getUserAILimit(userId: string): Promise<number> {
  try {
    const { data } = await supabase.rpc('get_user_ai_limit', {
      user_id_param: userId,
    })

    return data || 10
  } catch (error) {
    console.error('Error fetching user AI limit:', error)
    return 10
  }
}

export async function updateAIUsageStats(userId: string, tokensUsed: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('ai_usage_stats')
      .select('id, message_count, total_tokens')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (existing) {
      await supabase
        .from('ai_usage_stats')
        .update({
          message_count: existing.message_count + 1,
          total_tokens: existing.total_tokens + tokensUsed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('ai_usage_stats').insert({
        user_id: userId,
        date: today,
        message_count: 1,
        total_tokens: tokensUsed,
      })
    }
  } catch (error) {
    console.error('Error updating AI usage stats:', error)
  }
}
