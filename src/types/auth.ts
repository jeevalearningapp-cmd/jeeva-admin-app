import { User, Session } from '@supabase/supabase-js'

export interface AdminUser {
  id: string
  email: string
  full_name?: string
  role: 'superadmin' | 'editor' | 'moderator'
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface AuthContextType {
  user: User | null
  adminUser: AdminUser | null
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAdminRole: () => Promise<AdminUser | null>
}
