# 🚀 Jeeva Mobile App - Step-by-Step Development Prompts

## 📋 Overview

This document provides **sequential prompts** for Replit Agent to build the Jeeva Learning mobile app error-free. Each prompt is designed to be copied and pasted one at a time, with validation before moving to the next step.

**Total Steps:** 23 (18 core + 5 AI Phase 1)  
**Estimated Time:** 3-4 weeks for complete implementation  
**Platform:** Expo/React Native

---

## 🎯 How to Use

1. **Copy one prompt at a time** from below
2. **Paste into Replit Agent** chat
3. **Wait for completion** and verify success
4. **Review the output** before proceeding
5. **Move to next prompt** only after current step works

---

## 📱 PHASE 1: PROJECT SETUP & CONFIGURATION

### **Prompt 1: Environment Setup**
```
Read the file docs/MOBILE_SETUP_GUIDE.md and set up the project structure and environment variables.

1. Create the folder structure: src/components, src/screens, src/navigation, src/hooks, src/context, src/utils, src/types, src/api, src/constants, src/lib
2. Create a .env file with these variables (ask me for the values):
   EXPO_PUBLIC_SUPABASE_URL=
   EXPO_PUBLIC_SUPABASE_ANON_KEY=
   EXPO_PUBLIC_BACKEND_URL=
   (NO GEMINI_API_KEY here - that's backend-only!)
3. Install these core dependencies:
   npm install @supabase/supabase-js @react-native-async-storage/async-storage
4. Show me the created structure
```

---

### **Prompt 2: TypeScript & Path Aliases**
```
Configure TypeScript with path aliases following docs/MOBILE_SETUP_GUIDE.md.

1. Update tsconfig.json to add path aliases:
   - "@/*": ["src/*"]
   - "@components/*": ["src/components/*"]
   - "@screens/*": ["src/screens/*"]
   - "@hooks/*": ["src/hooks/*"]
   - "@utils/*": ["src/utils/*"]
   - "@api/*": ["src/api/*"]
   - "@types/*": ["src/types/*"]
   - "@lib/*": ["src/lib/*"]
2. Install: npm install --save-dev babel-plugin-module-resolver
3. Update babel.config.js with the same aliases
4. Show me the updated files
```

---

### **Prompt 3: Install Navigation Dependencies**
```
Install React Navigation dependencies following docs/MOBILE_SETUP_GUIDE.md.

Run these installations:
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

Confirm installation is complete.
```

---

## 📱 PHASE 2: SUPABASE INTEGRATION

### **Prompt 4: Create Supabase Client**
```
Read docs/API_DOCUMENTATION.md and create the Supabase client.

1. Create src/lib/supabase.ts
2. Set up Supabase client with:
   - AsyncStorage for auth persistence
   - Auto refresh token enabled
   - Environment variables from .env
3. Follow the exact configuration in API_DOCUMENTATION.md
4. Show me the created file
```

---

### **Prompt 5: Create TypeScript Types**
```
Read docs/DATABASE_SCHEMA.md and create TypeScript types.

1. Create src/types/database.ts with all table interfaces:
   - User, UserProfile, Module, Topic, Lesson, Question, QuestionOption, Flashcard, PracticeSession, MockExam, ChatConversation, ChatMessage
2. Create src/types/auth.ts with authentication types
3. Follow the exact schema structure from DATABASE_SCHEMA.md
4. Show me the created types
```

---

## 📱 PHASE 3: AUTHENTICATION (Core Feature)

### **Prompt 6: Create Auth Context**
```
Read docs/AUTHENTICATION_FLOW.md and create the Auth Context.

1. Create src/context/AuthContext.tsx with:
   - AuthProvider component
   - useAuth hook
   - Session management
   - Sign in, sign up, sign out functions
   - Auto session check on app launch
2. Follow the exact implementation in AUTHENTICATION_FLOW.md
3. Show me the created file
```

---

### **Prompt 7: Create Login Screen**
```
Read docs/UI_DESIGN_SPECS.md and docs/FEATURE_SPECIFICATIONS.md to create the Login screen.

1. Create src/screens/auth/LoginScreen.tsx
2. Use the exact design from UI_DESIGN_SPECS.md:
   - Logo at top
   - "Hi, welcome back" title (24pt, Bold)
   - Email and Password inputs (48px height, 8px border radius)
   - Primary button (#3B82F6, 48px height)
   - Social login buttons (Google, Apple)
   - "Forgot password?" link
3. Implement form validation
4. Connect to AuthContext for authentication
5. Show me the screen
```

---

### **Prompt 8: Create Register Screen**
```
Read docs/UI_DESIGN_SPECS.md and create the Register screen.

1. Create src/screens/auth/RegisterScreen.tsx
2. Follow the exact design:
   - "Hello, Register to get started" title
   - Full name, Email, Password inputs (48px height)
   - Password validation helper text
   - Register button (#3B82F6)
   - Social signup options
3. Implement validation (8+ chars, uppercase, lowercase, number)
4. Connect to AuthContext
5. Show me the screen
```

---

## 📱 PHASE 4: NAVIGATION SETUP

### **Prompt 9: Create Navigation Structure**
```
Create the navigation structure with Auth and Main stacks.

1. Create src/navigation/AuthStack.tsx - for Login, Register screens
2. Create src/navigation/MainStack.tsx - for authenticated screens (Home, Courses, Profile, Chat)
3. Create src/navigation/RootNavigator.tsx - switches between Auth and Main based on session
4. Use @react-navigation/native-stack
5. Show me the navigation files
```

---

### **Prompt 10: Create Bottom Tab Navigation**
```
Read docs/UI_DESIGN_SPECS.md and create Bottom Tab Navigation.

1. Create src/navigation/BottomTabs.tsx
2. Include 4 tabs as per design:
   - Home (house icon)
   - AI assistant (chat icon)
   - Courses (book icon)
   - Profile (person icon)
3. Use exact styling:
   - Height: 64px
   - Active color: #3B82F6
   - Inactive: #9E9E9E
4. Show me the navigation
```

---

## 📱 PHASE 5: CORE SCREENS

### **Prompt 11: Create Home/Dashboard Screen**
```
Read docs/UI_DESIGN_SPECS.md and docs/FEATURE_SPECIFICATIONS.md to create Home screen.

1. Create src/screens/HomeScreen.tsx
2. Follow exact layout from UI_DESIGN_SPECS.md:
   - Logo and avatar in header
   - "Hi, [User Name]" greeting (24pt)
   - Hero card with "Upgrade your career" gradient
   - 4 quick action icons (courses, packages, features, queries)
   - Promotional card
3. Use exact colors (#3B82F6, #4ADE80) and spacing (16px, 24px)
4. Show me the screen
```

---

### **Prompt 12: Create Courses/Modules Screen**
```
Read docs/API_DOCUMENTATION.md and docs/UI_DESIGN_SPECS.md to create Courses screen.

1. Create src/screens/CoursesScreen.tsx
2. Fetch modules from Supabase using API_DOCUMENTATION.md
3. Display with exact design:
   - Hero card "CRACK NMC" with gradient (#2F80ED → #5B9FED)
   - Module cards with images
   - 2-column grid layout
   - Card style: white background, 12px border radius
4. Use exact styling from UI_DESIGN_SPECS.md
5. Show me the screen
```

---

### **Prompt 13: Create Profile Screen**
```
Read docs/UI_DESIGN_SPECS.md to create Profile screen.

1. Create src/screens/ProfileScreen.tsx
2. Follow exact layout:
   - 80px avatar at top
   - User name and email below avatar
   - Edit profile button
   - Grouped menu items:
     * Dashboard
     * Courses
     * Subscription
     * Settings
     * Support
   - Logout button (blue text, bottom)
3. Connect to AuthContext for user data and logout
4. Show me the screen
```

---

## 📱 PHASE 6: INTEGRATION & TESTING

### **Prompt 14: Update App.tsx**
```
Update App.tsx to use the navigation and auth context.

1. Wrap app with AuthProvider
2. Add RootNavigator
3. Add SafeAreaProvider
4. Show me the updated App.tsx
```

---

### **Prompt 15: Run & Test**
```
Start the Expo development server.

1. Run: npm start
2. Show me the QR code to scan with Expo Go app
3. Check for any errors in the console
4. Confirm the app is running
```

---

## 📱 PHASE 7: ADDITIONAL FEATURES (After Core Works)

### **Prompt 16: Create API Service Layer**
```
Read docs/API_DOCUMENTATION.md and create API service files.

1. Create src/api/modules.ts - for fetching modules, topics, lessons
2. Create src/api/practice.ts - for practice sessions, questions
3. Create src/api/profile.ts - for user profile operations
4. Use React Query (@tanstack/react-query) for data fetching
   npm install @tanstack/react-query
5. Show me the API services
```

---

### **Prompt 17: Create Lesson Viewer**
```
Read docs/FEATURE_SPECIFICATIONS.md and docs/UI_DESIGN_SPECS.md to create Lesson Viewer.

1. Create src/screens/LessonScreen.tsx
2. Support text, video, and audio lessons
3. Follow exact design with video player controls
4. Add "Check your understanding" button (green, #4ADE80)
5. Show me the screen
```

---

### **Prompt 18: Create Practice/Quiz Screen**
```
Read docs/FEATURE_SPECIFICATIONS.md to create Practice screen.

1. Create src/screens/PracticeScreen.tsx
2. Display questions one at a time
3. Show answer options (white cards, hover state)
4. Instant feedback (green for correct, red for incorrect)
5. Track score
6. Show results screen at end with score breakdown
7. Follow UI_DESIGN_SPECS.md for styling
```

---

## 🤖 PHASE 8: AI CHATBOT - PHASE 1 (JeevaBot)

### **Prompt 19: Set Up Backend Chat API (Admin Portal)**
```
⚠️ CRITICAL: This step happens in the ADMIN PORTAL backend, NOT the mobile app!

Read docs/AI_PHASE1_CHATBOT.md and docs/AI_SECURITY.md to set up Google Gemini AI on the backend.

1. In ADMIN PORTAL backend, install Google Generative AI SDK:
   npm install @google/generative-ai

2. Ask user for GEMINI_API_KEY (Replit Secrets in Admin Portal backend):
   - Key: GEMINI_API_KEY (NO EXPO_PUBLIC_ prefix!)
   - Value: [user provides API key]

3. Create server/lib/gemini.ts (BACKEND ONLY):
   - GoogleGenerativeAI client initialization
   - chatModel configuration (gemini-1.5-flash)
   - getModelResponse function with error handling
   - Use process.env.GEMINI_API_KEY (server-side secret)

4. Create server/routes/chat.ts (Backend API endpoint):
   - POST /api/chat/send
   - Authenticate user with Supabase auth
   - Check rate limits
   - Call Gemini API
   - Save messages to database
   - Return response to mobile app

5. Add to backend server/index.ts:
   app.use('/api/chat', chatRouter)

6. Show me the backend implementation
```

---

### **Prompt 20: Create Chat Database Tables**
```
Read docs/DATABASE_SCHEMA.md section "AI & Chat (Phase 1)" and create chat tables in Supabase.

1. Create chat_conversations table with:
   - id (UUID, PRIMARY KEY)
   - user_id (UUID, FK to users)
   - title (TEXT)
   - context_data (JSONB)
   - created_at, updated_at (TIMESTAMP)

2. Create chat_messages table with:
   - id (UUID, PRIMARY KEY)
   - conversation_id (UUID, FK to chat_conversations)
   - role (TEXT, CHECK 'user' or 'assistant')
   - content (TEXT)
   - metadata (JSONB)
   - created_at (TIMESTAMP)

3. Create ai_usage_stats table with:
   - id (UUID, PRIMARY KEY)
   - user_id (UUID, FK to users)
   - date (DATE)
   - message_count (INTEGER)
   - total_tokens (INTEGER)
   - UNIQUE constraint on (user_id, date)

4. Add indexes:
   - idx_chat_conversations_user on chat_conversations(user_id)
   - idx_chat_messages_conversation on chat_messages(conversation_id)
   - idx_ai_usage_user_date on ai_usage_stats(user_id, date)

5. Create increment_ai_usage database function (see DATABASE_SCHEMA.md)

6. Show me confirmation that tables are created
```

---

### **Prompt 21: Build JeevaBot Chat UI**
```
Read docs/AI_PHASE1_CHATBOT.md and docs/UI_DESIGN_SPECS.md to create the chat interface.

1. Create src/screens/ChatScreen.tsx with:
   - Header: "JeevaBot" title, "Your AI Study Assistant" subtitle
   - Message list (FlatList)
   - Message input field (rounded, 48px height)
   - Send button (blue #3B82F6)
   - Empty state with welcome message

2. Create src/components/ChatBubble.tsx:
   - User messages: blue bubble (#3B82F6), right-aligned
   - AI messages: gray bubble (#E0E0E0), left-aligned
   - Timestamp below each message

3. Create src/components/AskAIButton.tsx:
   - Floating action button
   - Blue background (#3B82F6)
   - "🤖 Ask AI" text
   - Position: bottom right (24px from edges)

4. Follow exact design from UI_DESIGN_SPECS.md

5. Show me the chat UI components
```

---

### **Prompt 22: Implement Mobile Chat UI & Backend Integration**
```
Read docs/AI_PHASE1_CHATBOT.md to implement mobile chat with backend API integration.

1. Create src/hooks/useChatbot.ts (MOBILE APP):
   ⚠️ NO Gemini SDK or API key in mobile app!
   
   - useState for messages, loading, error
   - sendMessage function:
     * Create conversation in Supabase
     * Call BACKEND API: POST /api/chat/send
     * Include Authorization header with user token
     * Receive both user and AI messages from backend
     * Update UI
   - loadConversation function (load history from Supabase)
   - Error handling with fallbacks

2. Add environment variable to mobile .env:
   EXPO_PUBLIC_BACKEND_URL=https://your-admin-portal.replit.app

3. Connect ChatScreen to useChatbot hook

4. Mobile app flow:
   User types message → Call backend API → Backend calls Gemini → Return AI response → Display in UI

5. Show me the mobile implementation (NO Gemini code in mobile!)
```

---

### **Prompt 23: Add Cost Controls & Monitoring**
```
Read docs/AI_SECURITY.md to implement AI cost controls and usage monitoring.

1. Implement daily message limit (50 messages/user/day):
   - Check ai_usage_stats before each message
   - Show error when limit reached
   - Reset at midnight

2. Add usage tracking:
   - Track tokens used per message
   - Update ai_usage_stats table
   - Calculate estimated costs

3. Create error messages:
   - Rate limit reached: "Daily limit of 50 messages reached. Try again tomorrow!"
   - API failure: Show fallback response
   - Network error: "Connection issue. Please check internet."

4. Add admin monitoring (optional):
   - Create src/utils/aiMetrics.ts
   - Functions to calculate daily cost
   - Track total messages, tokens used

5. Test chat functionality:
   - Send 5 test messages
   - Verify responses are context-aware
   - Check database for saved messages
   - Test rate limiting (try to exceed 50 messages)

6. Show me the cost control implementation
```

---

## ✅ PHASE 9: FINAL TESTING & DEPLOYMENT

### **Final Verification Checklist**

After completing all 23 prompts, verify:

**Core Functionality:**
- [ ] User can register and login
- [ ] Navigation works (Auth → Main → Tabs)
- [ ] Home screen displays correctly
- [ ] Courses load from Supabase
- [ ] Profile shows user data
- [ ] Logout works

**AI Chatbot (Phase 1):**
- [ ] Chat screen accessible from bottom tab
- [ ] Can send messages to JeevaBot
- [ ] AI responses are context-aware
- [ ] Rate limiting works (50 msg/day)
- [ ] Conversation history persists
- [ ] Error handling shows fallback messages
- [ ] Cost tracking active

**UI/UX:**
- [ ] Design matches UI_DESIGN_SPECS.md
- [ ] Colors correct (#3B82F6, #4ADE80, etc.)
- [ ] Typography correct (SF Pro/Roboto)
- [ ] Spacing consistent (8px, 12px, 16px, 24px)
- [ ] Responsive on iOS and Android

**Data & Security:**
- [ ] Supabase connection working
- [ ] API keys stored in .env (not code)
- [ ] RLS policies active (users see only their data)
- [ ] No sensitive data in AI prompts
- [ ] Audit logging for AI usage

---

## 🚀 Next Steps After Phase 1

**Phase 2 (Future):**
- Vertex AI integration for ML-powered recommendations
- Adaptive learning paths
- Auto-generated practice content
- Question generation for admins
- Advanced analytics

See `docs/AI_PHASE2_ROADMAP.md` for Phase 2 planning.

---

## 📞 Support

**For Implementation Issues:**
- Email: vollstek@gmail.com
- Reference: Jeeva Mobile App Development

**Documentation:**
- [Mobile App Overview](./MOBILE_APP_OVERVIEW.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [AI Phase 1 Guide](./AI_PHASE1_CHATBOT.md)
- [AI Security](./AI_SECURITY.md)
- [UI Design Specs](./UI_DESIGN_SPECS.md)

---

**Version:** 2.0 (Updated with AI Phase 1)  
**Last Updated:** October 11, 2025  
**Total Prompts:** 23  
**Estimated Completion:** 3-4 weeks  
**Status:** ✅ Ready for Development
