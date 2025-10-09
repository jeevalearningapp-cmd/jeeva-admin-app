export interface User {
  id: string
  email: string
  role: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name?: string
  phone_number?: string
  date_of_birth?: string
  created_at?: string
  updated_at?: string
}

export interface UserWithProfile extends User {
  profile?: UserProfile
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: string
  status: 'active' | 'inactive' | 'cancelled' | 'expired'
  start_date: string
  end_date?: string
  created_at?: string
  updated_at?: string
}

export interface UserWithSubscription extends UserWithProfile {
  subscription?: Subscription
}
