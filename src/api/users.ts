import { supabase } from "@/lib/supabase";
import { User, UserProfile, UserWithProfile } from "@/types";

export const usersApi = {
  async getUsers(params?: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 10 } = params || {};

    let query = supabase
      .from("users")
      .select("*, user_profiles(*)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`email.ilike.%${search}%`);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    const users: UserWithProfile[] =
      data?.map((user: any) => ({
        ...user,
        profile: user.user_profiles?.[0] || null,
      })) || [];

    return { users, total: count || 0 };
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*, user_profiles(*)")
      .eq("id", id)
      .single();

    if (error) throw error;

    const user: UserWithProfile = {
      ...data,
      profile: data.user_profiles?.[0] || null,
    };

    return user;
  },

  async updateUserStatus(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from("users")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createUser(userData: Partial<User>) {
    const { data, error } = await supabase
      .from("users")
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(id: string, userData: Partial<User>) {
    const { data, error } = await supabase
      .from("users")
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUser(id: string) {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) throw error;
  },
};
