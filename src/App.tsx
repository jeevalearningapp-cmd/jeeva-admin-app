import { lazy, Suspense } from 'react'
import { CssBaseline, CircularProgress, Box } from '@mui/material'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack'
import { AuthProvider, ThemeProvider } from './context'
import { LoginForm } from './components/auth/LoginForm'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MainLayout } from './components/layout'
import { ErrorBoundary } from './components/common'
import { SplashScreen } from './pages/SplashScreen'

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const SubscriptionPlansPage = lazy(() => import('./pages/SubscriptionPlansPage'))
const ContentManagementPage = lazy(() => import('./pages/ContentManagementPage'))
const ApprovalsPage = lazy(() => import('./pages/ApprovalsPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const DashboardHeroPage = lazy(() => import('./pages/DashboardHeroPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const StudentsPage = lazy(() => import('./pages/StudentsPage'))
const DiscountCouponsPage = lazy(() => import('./pages/DiscountCouponsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'))
const TrialModuleManagementPage = lazy(() => import('./pages/TrialModuleManagementPage'))
const EmailTestPage = lazy(() => import('./pages/EmailTestPage'))

// Loading fallback component
const PageLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
    <CircularProgress />
  </Box>
)

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
                <Suspense fallback={<PageLoader />}>
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
                      path="/trial-module"
                      element={
                        <ProtectedRoute allowedRoles={['superadmin', 'editor']}>
                          <MainLayout>
                            <TrialModuleManagementPage />
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
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
