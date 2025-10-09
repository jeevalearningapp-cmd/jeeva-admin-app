import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context'
import { PageLoader } from '@/components/common'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('superadmin' | 'editor' | 'moderator')[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, adminUser, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (!user || !adminUser) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(adminUser.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
