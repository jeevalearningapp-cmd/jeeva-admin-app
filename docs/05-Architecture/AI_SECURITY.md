# 🔒 AI Integration Security & Cost Management

## 📋 Document Overview

This document covers security best practices, API key management, rate limiting, cost controls, and compliance for the JeevaBot AI chatbot integration.

**Version:** 1.0  
**Last Updated:** October 11, 2025  
**AI Service:** Google AI Studio API (Gemini)  
**Compliance:** Data privacy, cost optimization

---

## 🔐 1. API Key Management

### 1.1 Secure Storage

**❌ NEVER DO THIS:**

```typescript
// ❌ DANGER: Hardcoded API keys
const API_KEY = "AIzaSyC-xxxxxxxxxxxxxxxxxxx";

// ❌ DANGER: Committed to version control
// .env file with actual keys in Git

// ❌ CRITICAL DANGER: Exposing API key to mobile clients
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; // NO!!
```

**✅ ALWAYS DO THIS (Backend Only!):**

```typescript
// ✅ SAFE: Backend server-side environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""; // NO EXPO_PUBLIC_!

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured in backend");
}

// Mobile app calls backend API, never touches Gemini directly
```

---

### 1.2 Replit Secrets Setup

**⚠️ CRITICAL: API Key ONLY on Backend Server**

**For Admin Portal (Backend) - REQUIRED:**

1. Go to Replit Project → **Tools** → **Secrets**
2. Add backend-only secrets (NO `EXPO_PUBLIC_` prefix!):

   ```
   GEMINI_API_KEY=AIzaSyC-your-actual-key-here
   AI_MAX_MESSAGES_PER_DAY=50
   AI_COST_ALERT_THRESHOLD=100
   ```

3. Backend code (server-side only):
   ```typescript
   const apiKey = process.env.GEMINI_API_KEY; // Backend only!
   ```

**For Mobile App (Expo) - NO API KEY:**

1. Create `.env` file in project root:

   ```env
   # NO Gemini API key here! Mobile calls backend API.
   EXPO_PUBLIC_BACKEND_URL=https://your-backend.replit.app
   ```

2. Add to `.gitignore`:

   ```
   .env
   .env.local
   .env.*.local
   ```

3. Mobile app code:
   ```typescript
   // Call backend API, NOT Gemini directly
   const response = await fetch(
     `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/chat/send`,
     {
       method: "POST",
       headers: {
         Authorization: `Bearer ${session.access_token}`,
       },
       body: JSON.stringify({ userId, content }),
     },
   );
   ```

---

### 1.3 Key Rotation Policy

**Best Practices:**

- Rotate API keys every 90 days
- Use different keys for dev/staging/production
- Revoke old keys immediately after rotation
- Log all key usage for audit trail

**Rotation Process:**

1. Generate new key in Google AI Studio
2. Update Replit Secrets with new key
3. Test in staging environment
4. Deploy to production
5. Revoke old key after 24 hours
6. Document rotation date

---

### 1.4 Environment Separation

**Use different API keys per environment (BACKEND ONLY!):**

⚠️ All Gemini API keys stored on backend server only, NEVER in mobile app!

```typescript
// Backend server (Admin Portal) - Different keys per environment
// Development
const DEV_API_KEY = process.env.GEMINI_API_KEY_DEV; // Backend secret

// Staging
const STAGING_API_KEY = process.env.GEMINI_API_KEY_STAGING; // Backend secret

// Production
const PROD_API_KEY = process.env.GEMINI_API_KEY_PROD; // Backend secret

// Select based on backend environment
const apiKey =
  process.env.NODE_ENV === "production"
    ? PROD_API_KEY
    : process.env.NODE_ENV === "staging"
      ? STAGING_API_KEY
      : DEV_API_KEY;

// Mobile app NEVER has API keys - only backend URL
// Mobile .env:
// EXPO_PUBLIC_BACKEND_URL=https://your-backend.replit.app
```

---

## 🚦 2. Rate Limiting

### 2.1 User-Level Rate Limits

**Daily Message Limit: 50 messages per user**

**Implementation:**

```typescript
const checkRateLimit = async (userId: string): Promise<boolean> => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("ai_usage_stats")
    .select("message_count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Rate limit check failed:", error);
    return false;
  }

  const maxMessages = parseInt(process.env.AI_MAX_MESSAGES_PER_DAY || "50"); // Backend secret
  const currentCount = data?.message_count || 0;

  if (currentCount >= maxMessages) {
    throw new RateLimitError(`Daily limit of ${maxMessages} messages reached`);
  }

  return true;
};
```

**Custom Error Class:**

```typescript
class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}
```

---

### 2.2 System-Wide Rate Limits

**Gemini API Free Tier:**

- 60 requests per minute
- 1,500 requests per day

**Protection Strategy:**

```typescript
import PQueue from "p-queue";

// Limit concurrent requests
const queue = new PQueue({
  concurrency: 10, // Max 10 concurrent requests
  interval: 60000, // Per minute
  intervalCap: 60, // Max 60 requests per minute
});

export const queuedGeminiRequest = async (prompt: string) => {
  return queue.add(() => getModelResponse(prompt));
};
```

---

### 2.3 Burst Protection

**Prevent spam attacks:**

```typescript
// Redis/Memory cache for burst detection
const recentRequests = new Map<string, number[]>();

const checkBurstLimit = (userId: string): boolean => {
  const now = Date.now();
  const userRequests = recentRequests.get(userId) || [];

  // Remove requests older than 1 minute
  const recentReqs = userRequests.filter((time) => now - time < 60000);

  // Max 10 requests per minute per user
  if (recentReqs.length >= 10) {
    throw new Error("Too many requests. Please slow down.");
  }

  recentReqs.push(now);
  recentRequests.set(userId, recentReqs);

  return true;
};
```

---

## 💰 3. Cost Management

### 3.1 Cost Tracking

**Gemini API Pricing (as of Oct 2025):**

- Input: $0.00025 per 1K tokens (~750 words)
- Output: $0.00075 per 1K tokens (~750 words)
- Average message: 500 tokens total
- **Cost per message: ~$0.0005 (half a cent)**

**Daily Cost Calculation:**

```typescript
const calculateDailyCost = async (
  date: string = new Date().toISOString().split("T")[0],
) => {
  const { data } = await supabase
    .from("ai_usage_stats")
    .select("total_tokens")
    .eq("date", date);

  const totalTokens =
    data?.reduce((sum, row) => sum + row.total_tokens, 0) || 0;

  // Average cost: $0.001 per 1K tokens
  const estimatedCost = (totalTokens / 1000) * 0.001;

  return {
    totalTokens,
    estimatedCost,
    formattedCost: `$${estimatedCost.toFixed(2)}`,
  };
};
```

---

### 3.2 Budget Alerts

**Set up automated alerts:**

```typescript
const checkBudget = async () => {
  const { estimatedCost } = await calculateDailyCost();
  const threshold = parseFloat(process.env.AI_COST_ALERT_THRESHOLD || "100");

  if (estimatedCost > threshold) {
    // Send alert to admin
    await sendAdminAlert({
      type: "COST_ALERT",
      message: `AI costs exceeded $${threshold} today`,
      currentCost: estimatedCost,
      date: new Date().toISOString(),
    });

    // Optionally disable AI temporarily
    await disableAITemporarily();
  }
};

// Run every hour
setInterval(checkBudget, 60 * 60 * 1000);
```

---

### 3.3 Cost Optimization Strategies

**1. Response Caching**

```typescript
// Cache common Q&A pairs
const responseCache = new Map<string, string>();

const getCachedOrFreshResponse = async (prompt: string): Promise<string> => {
  const cacheKey = prompt.toLowerCase().trim();

  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey)!;
  }

  const response = await getModelResponse(prompt);
  responseCache.set(cacheKey, response);

  return response;
};
```

**2. Token Limits**

```typescript
// Limit response length
const chatModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    maxOutputTokens: 1024, // ~200 words max
  },
});
```

**3. Conversation History Trimming**

```typescript
// Keep only last 10 messages for context
const trimHistory = (messages: ChatMessage[]) => {
  return messages.slice(-10);
};
```

**4. Use Cheaper Model**

```typescript
// gemini-1.5-flash is 10x cheaper than gemini-1.5-pro
const chatModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Recommended
});
```

---

### 3.4 Admin Dashboard Metrics

**Track these KPIs:**

```typescript
interface AIMetrics {
  dailyMessages: number;
  dailyCost: number;
  averageResponseTime: number;
  errorRate: number;
  topUsers: { userId: string; messageCount: number }[];
  costPerUser: number;
  tokenEfficiency: number; // Tokens per message
}

const getAIMetrics = async (): Promise<AIMetrics> => {
  const today = new Date().toISOString().split("T")[0];

  const { data: stats } = await supabase
    .from("ai_usage_stats")
    .select("*")
    .eq("date", today);

  const dailyMessages =
    stats?.reduce((sum, s) => sum + s.message_count, 0) || 0;
  const totalTokens = stats?.reduce((sum, s) => sum + s.total_tokens, 0) || 0;
  const dailyCost = (totalTokens / 1000) * 0.001;

  return {
    dailyMessages,
    dailyCost,
    averageResponseTime: 0, // Calculate from metadata
    errorRate: 0, // Calculate from logs
    topUsers: [], // Sort stats by message_count
    costPerUser: dailyCost / (stats?.length || 1),
    tokenEfficiency: totalTokens / dailyMessages,
  };
};
```

---

## 🛡️ 4. Data Security & Privacy

### 4.1 User Data Protection

**PII Handling Rules:**

```typescript
// ❌ NEVER send PII to AI
const badPrompt = `
User John Doe (email: john@example.com, phone: 555-1234) 
is struggling with Physics...
`;

// ✅ ALWAYS anonymize user data
const goodPrompt = `
A student is struggling with Physics. 
Current lesson: Newton's Laws
Recent scores: 65%, 70%, 68%
`;
```

**Data Sanitization:**

```typescript
const sanitizeUserContext = (context: UserContext) => {
  return {
    currentLesson: context.currentLesson?.title,
    recentTopics: context.recentTopics,
    performanceLevel: context.averageScore > 80 ? "advanced" : "intermediate",
    // Exclude: name, email, phone, location, etc.
  };
};
```

---

### 4.2 Conversation Data Storage

**Database Security:**

1. **Encryption at Rest:** Supabase encrypts all data
2. **Access Control:** Row Level Security (RLS)
3. **Data Retention:** Delete conversations after 90 days

**RLS Policy:**

```sql
-- Users can only access their own conversations
CREATE POLICY "Users can view own conversations"
ON chat_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
ON chat_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
ON chat_conversations
FOR DELETE
USING (auth.uid() = user_id);
```

---

### 4.3 Audit Logging

**Log all AI interactions:**

```typescript
const logAIRequest = async (data: {
  userId: string;
  conversationId: string;
  promptTokens: number;
  responseTokens: number;
  model: string;
  success: boolean;
  errorMessage?: string;
}) => {
  await supabase.from("ai_audit_logs").insert({
    ...data,
    timestamp: new Date().toISOString(),
    ip_address: null, // Don't log IP for privacy
  });
};
```

**Audit Log Schema:**

```sql
CREATE TABLE ai_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  conversation_id UUID REFERENCES chat_conversations(id),
  prompt_tokens INTEGER,
  response_tokens INTEGER,
  model TEXT,
  success BOOLEAN,
  error_message TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## 🚨 5. Error Handling & Monitoring

### 5.1 Graceful Degradation

```typescript
const getAIResponseSafely = async (prompt: string): Promise<string> => {
  try {
    return await getModelResponse(prompt);
  } catch (error) {
    console.error("AI Error:", error);

    // Log to monitoring service
    await logError({
      type: "AI_FAILURE",
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    // Return fallback
    return getFallbackResponse(error);
  }
};

const getFallbackResponse = (error: any): string => {
  if (error.message?.includes("quota")) {
    return "I've reached my daily limit. Try again tomorrow!";
  }

  if (error.message?.includes("timeout")) {
    return "The request is taking too long. Please try again.";
  }

  return "I'm having trouble right now. Please try again in a moment.";
};
```

---

### 5.2 Monitoring & Alerts

**Set up alerts for:**

1. **High Error Rate** (>5% failures)
2. **Quota Exceeded** (API limit reached)
3. **Slow Response Times** (>10s average)
4. **Cost Spikes** (>2x daily average)
5. **Suspicious Activity** (burst requests)

**Alert Implementation:**

```typescript
const checkSystemHealth = async () => {
  const metrics = await getAIMetrics();

  const alerts = [];

  if (metrics.errorRate > 0.05) {
    alerts.push({
      type: "HIGH_ERROR_RATE",
      message: `Error rate at ${(metrics.errorRate * 100).toFixed(1)}%`,
      severity: "critical",
    });
  }

  if (metrics.averageResponseTime > 10000) {
    alerts.push({
      type: "SLOW_RESPONSE",
      message: `Average response time: ${metrics.averageResponseTime}ms`,
      severity: "warning",
    });
  }

  if (metrics.dailyCost > 100) {
    alerts.push({
      type: "COST_SPIKE",
      message: `Daily cost: $${metrics.dailyCost}`,
      severity: "critical",
    });
  }

  if (alerts.length > 0) {
    await sendAdminNotification(alerts);
  }
};
```

---

## 🔒 6. Compliance & Best Practices

### 6.1 GDPR Compliance

**User Rights:**

1. **Right to Access:** Export conversation data
2. **Right to Deletion:** Delete all AI interactions
3. **Right to Portability:** Download chat history

**Implementation:**

```typescript
// Export user's AI data
const exportUserAIData = async (userId: string) => {
  const conversations = await supabase
    .from("chat_conversations")
    .select("*, messages:chat_messages(*)")
    .eq("user_id", userId);

  return {
    userId,
    conversations,
    exportDate: new Date().toISOString(),
    format: "JSON",
  };
};

// Delete user's AI data
const deleteUserAIData = async (userId: string) => {
  await supabase.from("chat_conversations").delete().eq("user_id", userId);

  await supabase.from("ai_usage_stats").delete().eq("user_id", userId);
};
```

---

### 6.2 Content Moderation

**Filter inappropriate content:**

```typescript
const moderateContent = (message: string): boolean => {
  const bannedWords = ['spam', 'abuse', ...]  // Load from config
  const lowerMessage = message.toLowerCase()

  for (const word of bannedWords) {
    if (lowerMessage.includes(word)) {
      return false  // Reject message
    }
  }

  return true  // Allow message
}

const sendMessage = async (content: string, userId: string) => {
  if (!moderateContent(content)) {
    throw new Error('Message contains inappropriate content')
  }

  // Continue with AI request...
}
```

---

### 6.3 Security Checklist

**Before Production:**

- [ ] API keys stored in environment variables (not code)
- [ ] Rate limiting enabled (user + system level)
- [ ] Cost alerts configured
- [ ] PII sanitization in place
- [ ] RLS policies active on database
- [ ] Audit logging enabled
- [ ] Error monitoring set up
- [ ] GDPR compliance verified
- [ ] Content moderation active
- [ ] Fallback responses tested
- [ ] API key rotation schedule defined
- [ ] Emergency shutdown procedure documented

---

## 🚦 7. Emergency Procedures

### 7.1 Disable AI Temporarily

```typescript
const disableAI = async (reason: string) => {
  await supabase
    .from("app_settings")
    .update({ ai_enabled: false, ai_disabled_reason: reason })
    .eq("id", "global");

  console.log(`AI DISABLED: ${reason}`);
};

// Check before each request
const checkAIEnabled = async (): Promise<boolean> => {
  const { data } = await supabase
    .from("app_settings")
    .select("ai_enabled")
    .eq("id", "global")
    .single();

  return data?.ai_enabled ?? true;
};
```

---

### 7.2 Incident Response

**If API key is compromised:**

1. **Immediately revoke key** in Google AI Studio
2. **Generate new key**
3. **Update all environments** (dev, staging, prod)
4. **Audit logs** for unauthorized usage
5. **Notify security team**
6. **Document incident**

**If costs spike unexpectedly:**

1. **Check usage stats** for anomalies
2. **Disable AI temporarily** if needed
3. **Investigate suspicious users**
4. **Implement stricter rate limits**
5. **Review and optimize prompts**

---

## 📊 8. Monitoring Dashboard

**Admin view should show:**

**Real-time Metrics:**

- Current requests per minute
- Active conversations
- Error rate (last hour)
- Average response time

**Daily Stats:**

- Total messages sent
- Estimated cost
- Top users by usage
- Error breakdown

**Historical Trends:**

- Cost over time (7/30/90 days)
- Usage growth
- Peak usage hours
- User engagement

**Alerts:**

- Active incidents
- Budget warnings
- Performance issues
- Security alerts

---

## 🔗 Related Documentation

- [AI Phase 1 Implementation Guide](./AI_PHASE1_CHATBOT.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Feature Specifications](./FEATURE_SPECIFICATIONS.md)

---

## 📞 Support & Escalation

**For Security Issues:**

- Email: vollstek@gmail.com
- Severity: Critical incidents require immediate response

**For Cost Alerts:**

- Check admin dashboard first
- Review usage stats
- Adjust rate limits if needed

**For API Issues:**

- [Google AI Studio Status](https://status.cloud.google.com/)
- [Gemini API Docs](https://ai.google.dev/docs)

---

**Version:** 1.0  
**Status:** ✅ Ready for Implementation  
**Last Review:** October 11, 2025  
**Next Review:** January 11, 2026 (Quarterly)
