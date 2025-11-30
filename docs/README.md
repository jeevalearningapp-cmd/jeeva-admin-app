# Jeeva Learning Platform - Complete Documentation

Welcome to the official documentation for the Jeeva Learning Platform. This is your complete reference for building, maintaining, and deploying the platform.

## 📚 Documentation Structure

### **01-Admin-Portal** 📊
Admin dashboard for managing content, users, subscriptions, payments, and analytics.
- UI/UX specifications and design system
- Complete feature specifications
- Dashboard and management interfaces
- **Start here:** [Admin Portal Docs](./01-Admin-Portal/INDEX.md)

### **02-Mobile-App** 📱
Student-facing mobile learning application with practice MCQs, lessons, mock exams, and AI tutoring.
- Architecture and feature overview
- Setup and development guides
- Payment integration (Stripe)
- Push notifications and chatbot
- **Start here:** [Mobile App Docs](./02-Mobile-App/INDEX.md)

### **03-Database** 🗄️
Database schema, content organization, and data models for the entire platform.
- Complete PostgreSQL schema documentation
- Content hierarchy (Modules → Topics → Lessons → Questions)
- Learning progress tracking
- Seed data management
- **Start here:** [Database Docs](./03-Database/INDEX.md)

### **04-Backend** 🔧
Express.js backend API, services, and integrations.
- REST API endpoint documentation
- Email service (Resend)
- Payment processing (Stripe)
- AI integration (Google Gemini)
- Webhook handlers
- **Start here:** [Backend Docs](./04-Backend/INDEX.md)

### **05-Architecture** 🏗️
System design, authentication flow, and AI implementation.
- Authentication and authorization
- JeevaBot AI chatbot architecture
- AI security and privacy
- System design patterns
- **Start here:** [Architecture Docs](./05-Architecture/INDEX.md)

### **06-Development** 🛠️
Development guides, testing procedures, and quality assurance.
- Development setup
- Testing guidelines and procedures
- Seed data management
- Quick fix guides
- Migration guides
- **Start here:** [Development Docs](./06-Development/INDEX.md)

### **07-Deployment** 🚀
Deployment procedures, production readiness, and release documentation.
- Deployment instructions
- Production readiness checklist
- Environment setup
- Release procedures
- **Start here:** [Deployment Docs](./07-Deployment/INDEX.md)

### **08-Mobile-App-Trial-Module-Implementation** 📲
Mobile app trial module implementation guide with user onboarding flow.
- Default trial user setup
- Profile completion to dashboard flow
- "Let's Try" button on NMC CBT course page
- Trial Practice, Learning, Mock Exam modules
- API endpoints and state management
- Conversion tracking and analytics
- **Read:** [Mobile Trial Implementation](./08-Mobile-App-Trial-Module-Implementation.md)

### **09-Payment-Gateway-Subscriptions-Implementation** 💳
Complete payment gateway and subscription implementation guide using Stripe.
- Location detection and currency conversion
- One-time purchase payment model (no auto-renewal)
- Stripe setup for Expo React Native apps
- Multi-currency pricing: INR, GBP, USD
- Automatic tax calculation (18% GST India, 20% VAT UK)
- Payment flow architecture with ChatGPT-like location awareness
- Complete API endpoints with request/response formats
- Stripe webhook handling and error management
- **Read:** [Payment Gateway & Subscriptions](./09-Payment-Gateway-Subscriptions-Implementation.md)

---

## 🎯 Quick Start by Role

### **For Admin Portal Developers**
1. Read: [01-Admin-Portal/INDEX.md](./01-Admin-Portal/INDEX.md)
2. Review: UI_DESIGN_SPECS.md
3. Check: FEATURE_SPECIFICATIONS.md

### **For Mobile App Developers**
1. Read: [02-Mobile-App/INDEX.md](./02-Mobile-App/INDEX.md)
2. Follow: SETUP_GUIDE.md
3. Review: MOBILE_IMPLEMENTATION_CHECKLIST.md
4. **NEW:** Trial Module - [08-Mobile-App-Trial-Module-Implementation.md](./08-Mobile-App-Trial-Module-Implementation.md)
5. **NEW:** Payment & Subscriptions - [09-Payment-Gateway-Subscriptions-Implementation.md](./09-Payment-Gateway-Subscriptions-Implementation.md)

### **For Backend Developers**
1. Read: [04-Backend/INDEX.md](./04-Backend/INDEX.md)
2. Review: [03-Database/INDEX.md](./03-Database/INDEX.md)
3. Check: API_DOCUMENTATION.md
4. **NEW:** Payment APIs - [09-Payment-Gateway-Subscriptions-Implementation.md](./09-Payment-Gateway-Subscriptions-Implementation.md)
5. **NEW:** Trial APIs - [08-Mobile-App-Trial-Module-Implementation.md](./08-Mobile-App-Trial-Module-Implementation.md)

### **For DevOps/Deployment**
1. Read: [07-Deployment/INDEX.md](./07-Deployment/INDEX.md)
2. Follow: DEPLOYMENT_INSTRUCTIONS.md
3. Verify: PRODUCTION_READINESS_PLAN.md

---

## 📖 Root Level Reference Docs

- **SECURITY_BEST_PRACTICES.md** - Security guidelines and best practices
- **THEME.md** - Design theme and styling system
- **ROUTING.md** - Application routing structure
- **AUTHENTICATION.md** - Authentication system overview
- **supabase.md** - Supabase configuration and usage

---

## 🆕 Recent Additions (Nov 30, 2025)

- ✅ **Trial Module Admin Panel** - Complete UI with 4 tabs (Practice, Learning, Mock Exam, Analytics)
- ✅ **Mobile Trial Module Documentation** - User flow, onboarding, and "Let's Try" button
- ✅ **Payment Gateway Documentation** - Location-aware Stripe integration for Expo
- ✅ **Supabase Schema** - 6 new tables for trial tracking and analytics

---

## 🔄 Key System Components

### **Frontend Stack**
- React 18 + TypeScript (Admin Portal)
- React Native + Expo (Mobile App)
- Vite 5 for fast development
- Material-UI (MUI) v7
- Zustand for state management
- React Query for data fetching
- Stripe React Native components

### **Backend Stack**
- Express.js + Node.js
- Supabase PostgreSQL
- Google Gemini for AI
- Stripe for payments
- Resend for email
- Expo for push notifications

### **Subscription Model**
- **One-Time Purchases** (no auto-renewal)
- 3 plans: Starter (30d), Growth (90d), Ultimate (150d)
- Multi-currency: INR, GBP, USD
- Automatic tax calculation (18% GST India, 20% VAT UK)

---

## 🚀 Getting Started

### **New Team Member?**
1. Start with the role-specific quick start above
2. Read the relevant INDEX.md file
3. Review the key files for your area

### **Bug Fix or Small Feature?**
1. Go to [06-Development/QUICK_FIX_GUIDE.md](./06-Development/QUICK_FIX_GUIDE.md)
2. Follow the relevant section
3. Reference the specific documentation needed

### **Major Feature or Release?**
1. Read [07-Deployment/PRODUCTION_READINESS_PLAN.md](./07-Deployment/PRODUCTION_READINESS_PLAN.md)
2. Follow [07-Deployment/DEPLOYMENT_INSTRUCTIONS.md](./07-Deployment/DEPLOYMENT_INSTRUCTIONS.md)
3. Verify all checklist items

---

## 📞 Need Help?

- Check the relevant category docs first
- Search for specific topics in the appropriate folder
- Review quick fix guides for common issues
- Consult the root reference docs for cross-cutting concerns

---

---

## 📋 Implementation Status (Nov 30, 2025)

| Component | Status | Docs |
|-----------|--------|------|
| Trial Module Admin UI | ✅ Complete | [Docs](./README.md#new-additions) |
| Trial Module API | 📋 Ready | [08-Mobile-App-Trial-Module-Implementation.md](./08-Mobile-App-Trial-Module-Implementation.md) |
| Supabase Schema | ✅ Deployed | Database updated with 6 new tables |
| Payment Gateway | 📋 Ready | [09-Payment-Gateway-Subscriptions-Implementation.md](./09-Payment-Gateway-Subscriptions-Implementation.md) |
| Mobile Implementation | 📋 Ready | Complete code examples in both docs |

**Last Updated:** November 30, 2025
