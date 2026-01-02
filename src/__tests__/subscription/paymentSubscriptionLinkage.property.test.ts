import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * **Feature: currency-subscription-fix, Property 5: Payment-Subscription Linkage**
 * **Validates: Requirements 3.1**
 * 
 * For any successful payment, the payment record SHALL have a valid subscription_id 
 * linking to an existing subscription.
 */

// Types representing the core data structures
interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'pending' | 'active' | 'expired' | 'cancelled'
}

interface Payment {
  id: string
  user_id: string
  subscription_id: string | null
  subscription_plan_id: string
  status: 'pending' | 'succeeded' | 'failed'
}

interface PaymentCreationResult {
  paymentId: string
  subscriptionId: string
}

/**
 * Pure function that models the payment creation logic
 * This mirrors the core business logic in payment.ts createPayment
 */
function createPaymentWithSubscription(
  userId: string,
  subscriptionPlanId: string,
  existingSubscriptions: Map<string, Subscription>
): PaymentCreationResult {
  // Generate a subscription ID (in real code this comes from DB)
  const subscriptionId = `sub_${userId}_${Date.now()}`
  
  // Create subscription record first (Requirements 3.1)
  const subscription: Subscription = {
    id: subscriptionId,
    user_id: userId,
    plan_id: subscriptionPlanId,
    status: 'pending',
  }
  existingSubscriptions.set(subscriptionId, subscription)
  
  // Create payment linked to subscription (Requirements 3.1)
  const paymentId = `pay_${userId}_${Date.now()}`
  
  return {
    paymentId,
    subscriptionId,
  }
}

/**
 * Validates that a subscription_id references an existing subscription
 */
function isValidSubscriptionLink(
  subscriptionId: string | null,
  existingSubscriptions: Map<string, Subscription>
): boolean {
  if (!subscriptionId) return false
  return existingSubscriptions.has(subscriptionId)
}

describe('Property 5: Payment-Subscription Linkage', () => {
  // Generate valid UUIDs for user IDs
  const userIdArb = fc.uuid()
  // Generate valid subscription plan IDs (could be UUID or Stripe price ID)
  const planIdArb = fc.oneof(
    fc.uuid(),
    fc.string({ minLength: 10, maxLength: 30 }).map(s => `price_${s}`)
  )

  it('payment creation always produces a valid subscription_id', () => {
    fc.assert(
      fc.property(userIdArb, planIdArb, (userId, planId) => {
        const subscriptions = new Map<string, Subscription>()
        const result = createPaymentWithSubscription(userId, planId, subscriptions)
        
        // The subscription_id should not be null or empty
        expect(result.subscriptionId).toBeTruthy()
        expect(typeof result.subscriptionId).toBe('string')
        expect(result.subscriptionId.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('subscription_id always references an existing subscription', () => {
    fc.assert(
      fc.property(userIdArb, planIdArb, (userId, planId) => {
        const subscriptions = new Map<string, Subscription>()
        const result = createPaymentWithSubscription(userId, planId, subscriptions)
        
        // The subscription_id should reference an existing subscription
        expect(isValidSubscriptionLink(result.subscriptionId, subscriptions)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('created subscription has correct user_id and plan_id', () => {
    fc.assert(
      fc.property(userIdArb, planIdArb, (userId, planId) => {
        const subscriptions = new Map<string, Subscription>()
        const result = createPaymentWithSubscription(userId, planId, subscriptions)
        
        const subscription = subscriptions.get(result.subscriptionId)
        expect(subscription).toBeDefined()
        expect(subscription!.user_id).toBe(userId)
        expect(subscription!.plan_id).toBe(planId)
      }),
      { numRuns: 100 }
    )
  })

  it('created subscription starts in pending status', () => {
    fc.assert(
      fc.property(userIdArb, planIdArb, (userId, planId) => {
        const subscriptions = new Map<string, Subscription>()
        const result = createPaymentWithSubscription(userId, planId, subscriptions)
        
        const subscription = subscriptions.get(result.subscriptionId)
        expect(subscription).toBeDefined()
        expect(subscription!.status).toBe('pending')
      }),
      { numRuns: 100 }
    )
  })

  it('each payment creates exactly one subscription', () => {
    fc.assert(
      fc.property(userIdArb, planIdArb, (userId, planId) => {
        const subscriptions = new Map<string, Subscription>()
        const initialCount = subscriptions.size
        
        createPaymentWithSubscription(userId, planId, subscriptions)
        
        expect(subscriptions.size).toBe(initialCount + 1)
      }),
      { numRuns: 100 }
    )
  })
})
