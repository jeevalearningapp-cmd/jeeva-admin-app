// Subscription Plan Types
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'yearly' | 'lifetime'
  features: string[]
  maxUsers?: number
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateSubscriptionPlanInput {
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'yearly' | 'lifetime'
  features: string[]
  maxUsers?: number
  isActive?: boolean
  displayOrder?: number
}

export interface UpdateSubscriptionPlanInput {
  name?: string
  description?: string
  price?: number
  billingCycle?: 'monthly' | 'yearly' | 'lifetime'
  features?: string[]
  maxUsers?: number
  isActive?: boolean
  displayOrder?: number
}

// User Subscription Types
export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate: string
  endDate?: string
  autoRenew: boolean
  paymentMethod?: string
  lastPaymentDate?: string
  nextPaymentDate?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  plan?: SubscriptionPlan
}

export interface CreateUserSubscriptionInput {
  userId: string
  planId: string
  status?: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate?: string
  endDate?: string
  autoRenew?: boolean
  paymentMethod?: string
}

export interface UpdateUserSubscriptionInput {
  planId?: string
  status?: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate?: string
  endDate?: string
  autoRenew?: boolean
  paymentMethod?: string
  lastPaymentDate?: string
  nextPaymentDate?: string
}

// Country Detection Types
export interface CountryInfo {
  countryCode: string
  countryName: string
  currency: string
  currencySymbol: string
  exchangeRate: number
  paymentProvider: 'stripe'
}

export interface ExchangeRateMap {
  [countryCode: string]: number
}

export interface CurrencyMap {
  [countryCode: string]: string
}

// Subscription Analytics
export interface SubscriptionAnalytics {
  totalSubscriptions: number
  activeSubscriptions: number
  cancelledSubscriptions: number
  trialSubscriptions: number
  monthlyRecurringRevenue: number
  churnRate: number
  averageSubscriptionValue: number
  subscriptionsByPlan: {
    planId: string
    planName: string
    count: number
    revenue: number
  }[]
}
