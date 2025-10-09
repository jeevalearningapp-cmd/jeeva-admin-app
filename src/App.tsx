import { CssBaseline } from '@mui/material'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, ThemeProvider } from './context'
import { LoginForm } from './components/auth/LoginForm'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MainLayout } from './components/layout'
import {
  DashboardPage,
  UsersPage,
  AdminUsersPage,
  SubscriptionsPage,
  ContentPage,
  ApprovalsPage,
  AnalyticsPage,
  SettingsPage,
  DashboardHeroPage,
  ProfilePage,
} from './pages'
import { ModulesPage } from './pages/content/ModulesPage'
import { TopicsPage } from './pages/content/TopicsPage'
import { LessonsPage } from './pages/content/LessonsPage'
import { QuestionsPage } from './pages/content/QuestionsPage'
import { FlashcardsPage } from './pages/content/FlashcardsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CssBaseline />
        <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor', 'moderator']}>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <UsersPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin-users"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <MainLayout>
                    <AdminUsersPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <SubscriptionsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/content"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <ContentPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/content/modules"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <ModulesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/content/topics"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <TopicsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/content/lessons"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <LessonsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/content/questions"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <QuestionsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/content/flashcards"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <FlashcardsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/approvals"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'moderator']}>
                  <MainLayout>
                    <ApprovalsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <MainLayout>
                    <AnalyticsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/dashboard-hero"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <DashboardHeroPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
