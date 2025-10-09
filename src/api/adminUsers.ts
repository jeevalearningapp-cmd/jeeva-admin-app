import { supabase } from '@/lib/supabase'
import { AdminUser } from '@/types'

export const adminUsersApi = {
  async getAdminUsers(params?: { search?: string; role?: string; page?: number; limit?: number }) {
    const { search, role, page = 1, limit = 10 } = params || {}
    
    let query = supabase
      .from('admin_users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq('role', role)
    }

    const start = (page - 1) * limit
    const end = start + limit - 1

    const { data, error, count } = await query.range(start, end)

    if (error) throw error

    return { adminUsers: data || [], total: count || 0 }
  },

  async getAdminUserById(id: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as AdminUser
  },

  async createAdminUser(adminUserData: Partial<AdminUser>) {
    const { data, error } = await supabase
      .from('admin_users')
      .insert(adminUserData)
      .select()
      .single()

    if (error) throw error
    return data as AdminUser
  },

  async updateAdminUser(id: string, adminUserData: Partial<AdminUser>) {
    const { data, error } = await supabase
      .from('admin_users')
      .update({ ...adminUserData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as AdminUser
  },

  async updateAdminUserStatus(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('admin_users')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as AdminUser
  },

  async deleteAdminUser(id: string) {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
