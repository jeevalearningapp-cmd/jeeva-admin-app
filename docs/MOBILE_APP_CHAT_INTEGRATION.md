# Mobile App Chat Integration Guide - JeevaBot

This guide explains how to integrate the JeevaBot AI chatbot into your React Native/Expo mobile app.

## Overview

JeevaBot is an AI-powered study assistant that helps nursing students prepare for the UK NMC CBT exam. It provides context-aware responses based on the student's current progress, lessons, and weak topics.

**Key Features:**
- Context-aware AI responses using Google Gemini 2.5-flash
- Rate limiting based on subscription plans (10-100 messages/day)
- Conversation history persistence
- Real-time streaming responses
- Integration with student's learning progress

## API Endpoints

All endpoints are hosted at: `https://your-replit-app.replit.dev/api/chat`

### 1. Send Message

Send a message to JeevaBot and get an AI response.

**Endpoint:** `POST /api/chat/send`

**Request Body:**
```json
{
  "userId": "uuid-string",
  "content": "What is the NMC Code?",
  "conversationId": "optional-uuid"
}
```

**Response:**
```json
{
  "conversationId": "uuid-string",
  "messageId": "uuid-string",
  "response": "The NMC Code is a professional framework...",
  "tokensUsed": 150,
  "remainingMessages": 45
}
```

**Error Response (Rate Limit):**
```json
{
  "error": "Daily AI message limit reached",
  "limit": 50,
  "current": 50,
  "resetTime": "2025-11-03T00:00:00Z"
}
```

### 2. Get Conversations

Fetch all conversations for a user.

**Endpoint:** `GET /api/chat/conversations/:userId`

**Response:**
```json
[
  {
    "id": "uuid-string",
    "userId": "uuid-string",
    "title": "NMC Code Questions",
    "createdAt": "2025-11-02T10:30:00Z",
    "updatedAt": "2025-11-02T11:15:00Z",
    "messageCount": 5
  }
]
```

### 3. Get Messages

Fetch all messages in a conversation.

**Endpoint:** `GET /api/chat/messages/:conversationId`

**Response:**
```json
[
  {
    "id": "uuid-string",
    "conversationId": "uuid-string",
    "role": "user",
    "content": "What is the NMC Code?",
    "createdAt": "2025-11-02T10:30:00Z"
  },
  {
    "id": "uuid-string",
    "conversationId": "uuid-string",
    "role": "assistant",
    "content": "The NMC Code is a professional framework...",
    "tokensUsed": 150,
    "createdAt": "2025-11-02T10:30:05Z"
  }
]
```

### 4. Check Rate Limit

Check remaining AI messages for the day.

**Endpoint:** `GET /api/chat/rate-limit/:userId`

**Response:**
```json
{
  "allowed": true,
  "limit": 50,
  "current": 5,
  "remaining": 45
}
```

## React Native Implementation

### 1. API Service Setup

Create a chat service to handle API calls:

```typescript
// services/chatService.ts
import axios from 'axios';

const API_BASE_URL = 'https://your-replit-app.replit.dev/api/chat';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  tokensUsed?: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface SendMessageResponse {
  conversationId: string;
  messageId: string;
  response: string;
  tokensUsed: number;
  remainingMessages: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
}

class ChatService {
  async sendMessage(
    userId: string,
    content: string,
    conversationId?: string
  ): Promise<SendMessageResponse> {
    const response = await axios.post(`${API_BASE_URL}/send`, {
      userId,
      content,
      conversationId,
    });
    return response.data;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const response = await axios.get(`${API_BASE_URL}/conversations/${userId}`);
    return response.data;
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const response = await axios.get(`${API_BASE_URL}/messages/${conversationId}`);
    return response.data;
  }

  async checkRateLimit(userId: string): Promise<RateLimitStatus> {
    const response = await axios.get(`${API_BASE_URL}/rate-limit/${userId}`);
    return response.data;
  }
}

export default new ChatService();
```

### 2. Chat Context/State Management

Use React Context or Zustand for state management:

```typescript
// store/chatStore.ts (using Zustand)
import { create } from 'zustand';
import chatService, { ChatMessage, Conversation } from '../services/chatService';

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  rateLimitStatus: RateLimitStatus | null;
  
  loadConversations: (userId: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (userId: string, content: string) => Promise<void>;
  checkRateLimit: (userId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  rateLimitStatus: null,

  loadConversations: async (userId: string) => {
    set({ isLoading: true });
    try {
      const conversations = await chatService.getConversations(userId);
      set({ conversations, isLoading: false });
    } catch (error) {
      console.error('Failed to load conversations:', error);
      set({ isLoading: false });
    }
  },

  loadMessages: async (conversationId: string) => {
    set({ isLoading: true });
    try {
      const messages = await chatService.getMessages(conversationId);
      set({ messages, isLoading: false });
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (userId: string, content: string) => {
    const { currentConversation } = get();
    set({ isLoading: true });
    
    try {
      const result = await chatService.sendMessage(
        userId,
        content,
        currentConversation?.id
      );
      
      // Add user message
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: result.conversationId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: result.messageId,
        conversationId: result.conversationId,
        role: 'assistant',
        content: result.response,
        tokensUsed: result.tokensUsed,
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({
        messages: [...state.messages, userMessage, aiMessage],
        isLoading: false,
        rateLimitStatus: {
          allowed: result.remainingMessages > 0,
          limit: result.remainingMessages + (state.rateLimitStatus?.current || 0),
          current: (state.rateLimitStatus?.current || 0) + 1,
          remaining: result.remainingMessages,
        },
      }));
      
      // Reload conversations to update message count
      await get().loadConversations(userId);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      if (error.response?.data?.error?.includes('limit')) {
        // Handle rate limit error
        alert('Daily AI message limit reached. Upgrade your plan for more messages!');
      }
      set({ isLoading: false });
    }
  },

  checkRateLimit: async (userId: string) => {
    try {
      const status = await chatService.checkRateLimit(userId);
      set({ rateLimitStatus: status });
    } catch (error) {
      console.error('Failed to check rate limit:', error);
    }
  },

  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation, messages: [] });
    if (conversation) {
      get().loadMessages(conversation.id);
    }
  },
}));
```

### 3. Chat UI Component

```typescript
// screens/ChatScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useChatStore } from '../store/chatStore';
import { useAuth } from '../context/AuthContext'; // Your auth context

export default function ChatScreen() {
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    rateLimitStatus,
    sendMessage,
    checkRateLimit,
  } = useChatStore();
  
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (user?.id) {
      checkRateLimit(user.id);
    }
  }, [user?.id]);

  const handleSend = async () => {
    if (!inputText.trim() || !user?.id) return;
    
    const message = inputText.trim();
    setInputText('');
    await sendMessage(user.id, message);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>JeevaBot</Text>
        {rateLimitStatus && (
          <Text style={styles.rateLimitText}>
            {rateLimitStatus.remaining}/{rateLimitStatus.limit} messages left today
          </Text>
        )}
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        inverted={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask JeevaBot anything..."
          multiline
          maxLength={500}
          editable={!isLoading && rateLimitStatus?.allowed}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading || !rateLimitStatus?.allowed) &&
              styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading || !rateLimitStatus?.allowed}
        >
          <Text style={styles.sendButtonText}>
            {isLoading ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#007aff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  rateLimitText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007aff',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8e8e8',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#007aff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### 4. Floating Chat Button

Add a floating chat button to lesson/practice screens:

```typescript
// components/FloatingChatButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function FloatingChatButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => navigation.navigate('Chat')}
    >
      <Text style={styles.buttonText}>💬</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    fontSize: 24,
  },
});
```

## Authentication

The chat API expects a `userId` (UUID) from your Supabase authentication. Make sure to:

1. Get the user ID from your auth context:
```typescript
const { user } = useAuth();
const userId = user?.id;
```

2. Pass it to all chat service methods

3. Handle unauthenticated users appropriately

## Rate Limiting

Rate limits are based on subscription plans:

| Plan | Messages/Day |
|------|--------------|
| Free Trial | 10 |
| 30/60 Day Plans | 50 |
| 90 Day Plan | 75 |
| 120 Day Plan | 100 |

**Best Practices:**
- Check rate limit status on app launch and before sending
- Show remaining messages in the UI
- Display upgrade prompts when limit is reached
- Handle rate limit errors gracefully with user-friendly messages

## Error Handling

```typescript
try {
  await sendMessage(userId, content);
} catch (error: any) {
  if (error.response?.status === 429) {
    // Rate limit exceeded
    Alert.alert(
      'Daily Limit Reached',
      'You\'ve used all your AI messages for today. Upgrade your plan for more!',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Upgrade', onPress: () => navigation.navigate('Subscriptions') },
      ]
    );
  } else if (error.response?.status === 401) {
    // Authentication error
    Alert.alert('Session Expired', 'Please log in again.');
  } else {
    // Generic error
    Alert.alert('Error', 'Failed to send message. Please try again.');
  }
}
```

## Context-Aware Responses

JeevaBot automatically includes context about:
- Student's current lesson topic
- Recent practice session performance
- Identified weak topics
- Progress statistics

This makes responses more relevant and personalized.

## Testing

### Test with cURL

```bash
# Send a message
curl -X POST http://localhost:3001/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"userId":"your-user-id","content":"What is the NMC Code?"}'

# Check rate limit
curl http://localhost:3001/api/chat/rate-limit/your-user-id

# Get conversations
curl http://localhost:3001/api/chat/conversations/your-user-id
```

### Test with Postman

1. Import the collection from `docs/postman/jeeva-chat-api.json`
2. Set the `API_URL` environment variable
3. Set the `USER_ID` environment variable
4. Run the test suite

## Production Deployment

Before deploying to production:

1. **Environment Variables**: Ensure these are set in your Replit Secrets:
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

2. **Update API URL**: Change `API_BASE_URL` in your mobile app to production URL

3. **Monitor Usage**: Track AI costs and usage patterns via the admin dashboard

4. **Rate Limiting**: Adjust limits in subscription plans as needed

## Future Enhancements

Potential improvements for Phase 2+:

- Voice input/output for hands-free studying
- Image-based questions (student can upload practice questions)
- Study schedule recommendations
- Peer comparison insights
- Conversation export/sharing
- Multi-language support (Hindi, Malayalam, etc.)

## Support

For issues or questions:
- Check API logs in Replit console
- Review error messages in mobile app
- Test endpoints with cURL/Postman
- Contact development team

---

**Version:** 1.0.0  
**Last Updated:** November 2, 2025  
**API Version:** Phase 1 - JeevaBot Core
