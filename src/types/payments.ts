export type PaymentGateway = 'stripe'

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'succeeded' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded'

export type PaymentMethodType = 'card' | 'upi' | 'netbanking' | 'wallet' | 'other'

export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'INR'

export interface PaymentCustomer {
  id: string
  userId: string
  gateway: PaymentGateway
  stripeCustomerId: string
  email: string
  fullName?: string
  phone?: string
  countryCode?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentMethod {
  id: string
  paymentCustomerId: string
  gateway: PaymentGateway
  stripePaymentMethodId: string
  methodType: PaymentMethodType
  last4?: string
  cardBrand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  userId: string
  paymentCustomerId?: string
  gateway: PaymentGateway
  stripePaymentIntentId: string
  amount: number
  currency: CurrencyCode
  status: PaymentStatus
  subscriptionId?: string
  subscriptionPlanId?: string
  discountCouponId?: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
  paymentMethodId?: string
  paymentMethodType?: PaymentMethodType
  failureCode?: string
  failureMessage?: string
  gatewayResponse?: Record<string, unknown>
  receiptUrl?: string
  invoicePdf?: string
  metadata?: Record<string, string | number | boolean | null>
  createdAt: string
  updatedAt: string
  completedAt?: string
  
  // Stripe Adaptive Pricing presentment fields
  stripeCheckoutSessionId?: string    // Checkout Session ID (cs_xxx)
  amountChargedLocal?: number         // Amount in presentment currency
  currencyChargedLocal?: string       // Presentment currency code (INR, USD, GBP)
  amountChargedGbp?: number           // Amount in GBP (settlement currency)
  fxRateApplied?: number              // FX rate used (local/gbp)
  countryDetected?: string            // Customer country code (ISO 3166-1 alpha-2)
}

export interface PaymentRefund {
  id: string
  paymentId: string
  gateway: PaymentGateway
  stripeRefundId: string
  amount: number
  currency: CurrencyCode
  reason?: string
  status: PaymentStatus
  refundedBy?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface PaymentWebhookEvent {
  id: string
  gateway: PaymentGateway
  eventId: string
  eventType: string
  payload: Record<string, unknown>
  processed: boolean
  processedAt?: string
  errorMessage?: string
  retryCount: number
  createdAt: string
}

export interface CreatePaymentInput {
  userId: string
  amount: number
  currency: CurrencyCode
  subscriptionPlanId?: string
  discountCouponCode?: string
  countryCode: string
  gatewayOverride?: PaymentGateway
  metadata?: Record<string, string | number | boolean | null>
}

export interface CreateStripePaymentIntentInput {
  amount: number
  currency: CurrencyCode
  customerId?: string
  paymentMethodId?: string
  metadata?: Record<string, string | number | boolean | null>
}

export interface CreateRazorpayOrderInput {
  amount: number
  currency: CurrencyCode
  receipt?: string
  notes?: Record<string, string | number | boolean | null>
}

export interface VerifyPaymentInput {
  paymentId: string
  gateway: PaymentGateway
  stripePaymentIntentId: string
}

export interface PaymentSummary {
  totalPayments: number
  totalAmount: number
  successfulPayments: number
  failedPayments: number
  refundedAmount: number
}

export interface PaymentFilters {
  status?: PaymentStatus[]
  gateway?: PaymentGateway[]
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
  subscriptionPlanId?: string
}

export interface CreatePaymentCustomerInput {
  userId: string
  gateway: PaymentGateway
  stripeCustomerId: string
  email: string
  fullName?: string
  phone?: string
  countryCode?: string
}

export interface CreateRefundInput {
  paymentId: string
  amount?: number
  reason?: string
  refundedBy: string
}

export interface PaymentGatewayConfig {
  gateway: PaymentGateway
  publicKey: string
  isEnabled: boolean
  supportedCurrencies: CurrencyCode[]
  supportedPaymentMethods: PaymentMethodType[]
}

export interface PricingCalculation {
  originalAmount: number
  discountAmount: number
  discountPercent?: number
  finalAmount: number
  currency: CurrencyCode
  couponCode?: string
  trialDays?: number
}

/**
 * Catalog Plan for Stripe Adaptive Pricing
 * Represents a subscription plan with GBP-only pricing.
 * No country-based grouping - Stripe handles currency conversion automatically.
 * 
 * Requirements: 1.2, 1.4, 7.3
 */
export interface CatalogPlan {
  planId: string              // Stripe Product ID
  name: string                // Plan tier name (Starter, Growth, Ultimate)
  description: string         // Plan description
  durationDays: number        // Subscription duration in days
  stripePriceIdGbp: string    // Stripe Price ID (price_xxx)
  unitAmountGbp: number       // Amount in pence (e.g., 2500 = £25.00)
  active: boolean             // Whether the plan is active
  features: string[]          // List of plan features
}

/**
 * Catalog API Response
 * Returns all active GBP plans without country grouping.
 */
export interface CatalogResponse {
  plans: CatalogPlan[]
}
