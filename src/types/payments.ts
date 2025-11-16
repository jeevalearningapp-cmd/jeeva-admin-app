export type PaymentGateway = 'stripe' | 'razorpay'

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
  stripeCustomerId?: string
  razorpayCustomerId?: string
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
  stripePaymentMethodId?: string
  razorpayTokenId?: string
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
  stripePaymentIntentId?: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
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
  gatewayResponse?: any
  receiptUrl?: string
  invoicePdf?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface PaymentRefund {
  id: string
  paymentId: string
  gateway: PaymentGateway
  stripeRefundId?: string
  razorpayRefundId?: string
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
  payload: any
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
  metadata?: Record<string, any>
}

export interface CreateStripePaymentIntentInput {
  amount: number
  currency: CurrencyCode
  customerId?: string
  paymentMethodId?: string
  metadata?: Record<string, any>
}

export interface CreateRazorpayOrderInput {
  amount: number
  currency: CurrencyCode
  receipt?: string
  notes?: Record<string, any>
}

export interface VerifyPaymentInput {
  paymentId: string
  gateway: PaymentGateway
  stripePaymentIntentId?: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
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
  stripeCustomerId?: string
  razorpayCustomerId?: string
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
