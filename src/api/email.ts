const API_URL = '/api/email'

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

interface WelcomeEmailParams {
  to: string
  userName: string
  confirmationUrl: string
}

interface SubscriptionConfirmationParams {
  to: string
  userName: string
  planName: string
  price: string
  billingCycle: string
  startDate: string
  nextBillingDate: string
  appUrl: string
}

export const emailAPI = {
  async sendEmail(params: SendEmailParams) {
    const response = await fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send email')
    }

    return response.json()
  },

  async sendWelcomeEmail(params: WelcomeEmailParams) {
    const response = await fetch(`${API_URL}/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send welcome email')
    }

    return response.json()
  },

  async sendSubscriptionConfirmation(params: SubscriptionConfirmationParams) {
    const response = await fetch(`${API_URL}/subscription-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send subscription confirmation')
    }

    return response.json()
  },

  async sendTestEmail(to: string) {
    const response = await fetch(`${API_URL}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send test email')
    }

    return response.json()
  },
}
