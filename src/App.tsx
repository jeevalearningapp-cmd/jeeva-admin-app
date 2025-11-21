import { CssBaseline } from '@mui/material'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack'
import { AuthProvider, ThemeProvider } from './context'
import { LoginForm } from './components/auth/LoginForm'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MainLayout } from './components/layout'
import { ErrorBoundary } from './components/common'
import {
  DashboardPage,
  AdminUsersPage,
  SubscriptionsPage,
  SubscriptionPlansPage,
  ContentManagementPage,
  ApprovalsPage,
  AnalyticsPage,
  SettingsPage,
  DashboardHeroPage,
  ProfilePage,
  StudentsPage,
  DiscountCouponsPage,
  NotificationsPage,
  PaymentsPage,
} from './pages'
import { SplashScreen } from './pages/SplashScreen'
import { EmailTestPage } from './pages/EmailTestPage'

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={3000}
        >
          <ThemeProvider>
            <CssBaseline />
            <AuthProvider>
              <BrowserRouter>
                <Routes>
            <Route path="/" element={<SplashScreen />} />
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
              path="/subscription-plans"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <MainLayout>
                    <SubscriptionPlansPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/discount-coupons"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <DiscountCouponsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/payments"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <PaymentsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/content"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <ContentManagementPage />
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
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <NotificationsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/mobile-app-users"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                  <MainLayout>
                    <StudentsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/email-test"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <MainLayout>
                    <EmailTestPage />
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
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
