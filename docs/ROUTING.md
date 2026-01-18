``# Jeeva Admin Portal – Routing & Component Scaffolding Guide (`routing.md`)``

`---`

`## 📑 Routes & Feature Map`

`| Path                  | Description                  | Nested/Dynamic         | Protected? | Roles          |`  
`|-----------------------|-----------------------------|------------------------|------------|---------------|`  
`| /login                | Admin login page            | –                      | No         | –             |`  
`| /dashboard            | Main overview               | –                      | Yes        | All admin     |`  
`| /users                | User management             | /users/:id             | Yes        | Superadmin    |`  
`| /admin-users          | Admins management           | /admin-users/:id       | Yes        | Superadmin    |`  
`| /subscriptions        | Subscription overview       | /subscriptions/:id     | Yes        | Superadmin    |`  
`| /content              | Content manager             | modules, topics, etc.  | Yes        | Superadmin, Editor, Moderator (review only) |`  
`| /content/modules      | Module list/manage          | /:id, /:id/edit        | Yes        | Superadmin, Editor, Moderator (review only) |`  
`| /content/topics       | Topic manager               | /:id                   | Yes        | Superadmin, Editor, Moderator (review only) |`  
`| /content/subtopics    | Subtopic manager            | /:id                   | Yes        | Superadmin, Editor, Moderator (review only) |`  
`| /content/lessons      | Lesson manager              | /:id                   | Yes        | Superadmin, Editor, Moderator (review only) |`  
`| /content/questions    | Question bank               | /:id (modal)           | Yes        | Superadmin, Editor, Moderator (review only) |`  
`| /content/flashcards   | Flashcard manager           | /:id                   | Yes        | Superadmin, Editor, Moderator (review only) |`  
`| /approvals            | Content approval queue      | /:id (modal)           | Yes        | All admin     |`  
`| /settings             | Portal/app settings         | –                      | Yes        | Superadmin    |`  
`| /analytics            | Analytics dashboard         | users/content/traffic  | Yes        | All admin     |`  
`| /dashboard-hero       | Banner/Hero editor          | /:id                   | Yes        | Superadmin    |`  
`| /profile              | Own admin profile           | –                      | Yes        | All admin     |`  
`| /logout               | Logout page/flow            | –                      | Yes        | All admin     |`

`---`

`## 🧭 Navigation & Layout`

`- **SidebarNav:**`  
 `Persistent, vertical; icons+labels; dynamic based on admin role`  
`- **TopBar:**`  
 `Global; title, search, profile, notifications`  
`- **Modals/Drawers:**`  
 `Used for detail views, create/edit forms; overlays map to URL for deep-link/share`  
`- **Role-Adaptive Menus:**`  
 `Sidebar/Topbar hide unavailable links per role`  
`- **Main Components:**`  
 `` `<SidebarNav />`, `<TopBar />`, `<UserProfileMenu />`, `<ProtectedRoute />`, `<ModalContainer />`, `<ToastManager />` ``

`---`

`## 🔒 Protected Route Logic`

``- All routes except `/login` use `<ProtectedRoute />` for Supabase Auth and role gate.``  
``- Menus/links rendered dynamically based on `useAuth()` context (`roles` prop).``  
`- Example:`

\<ProtectedRoute role={\['superadmin', 'editor'\]} exact path="/content"\>  
\<ContentManager /\>  
\</ProtectedRoute\>  
\<ProtectedRoute role="superadmin" exact path="/admin-users"\>  
\<AdminUserManager /\>  
\</ProtectedRoute\>

text

`---`

`## 📦 Component Scaffold & File Tree`

`` ### `/src/pages/` ``  
`- DashboardPage.jsx`  
`- UsersPage.jsx`  
`- UserDetailsPage.jsx`  
`- AdminUsersPage.jsx`  
`- AdminUserDetailsPage.jsx`  
`- SubscriptionsPage.jsx`  
`- SubscriptionDetailsPage.jsx`  
`- Content/`  
 `- ModulesPage.jsx`  
 `- ModuleDetailsPage.jsx`  
 `- TopicsPage.jsx`  
 `- TopicDetailsPage.jsx`  
 `- SubtopicsPage.jsx`  
 `- SubtopicDetailsPage.jsx`  
 `- LessonsPage.jsx`  
 `- LessonDetailsPage.jsx`  
 `- QuestionsPage.jsx`  
 `- QuestionDetailsModal.jsx`  
 `- FlashcardsPage.jsx`  
 `- FlashcardDetailsPage.jsx`  
`- ApprovalsPage.jsx`  
`- ApprovalDetailsModal.jsx`  
`- SettingsPage.jsx`  
`- AnalyticsPage.jsx`  
`- DashboardHeroPage.jsx`

`` ### `/src/components/` ``  
`- SidebarNav.jsx`  
`- TopBar.jsx`  
`- TableList.jsx`  
`- EditFormModal.jsx`  
`- ProtectedRoute.jsx`  
`- UserProfileMenu.jsx`  
`- ModalContainer.jsx`  
`- ToastManager.jsx`

`---`

`## 🧑‍💻 Developer Best Practices`

``- Centralize routes and role logic (use `routes.js`/`sidebarConfig.js`)``  
`- All routes/components protected by Auth context and role gates`  
`- Use Suspense and React.lazy for code splitting/fast navigation`  
`- Deep-link support via modal routes (URL reflects detail/modal state)`  
`- Always document new route/components in both code and docs`  
`- Update role links and access logic as features/permissions evolve`

`---`

`## 🔗 References`

`- supabase.md: RLS, role matrix`  
`- theme.md: UI, branding`  
`- README.md/replit.md: Workspace, onboarding`

`---`

`**Keep this file up to date: add new routes, features, modals, and role rules as the admin portal grows.**`
