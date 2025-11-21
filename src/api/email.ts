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

import { supabase } from '@/lib/supabase'
import type { EmailTemplate } from '@/types'

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

// Email Templates API
export const emailTemplatesAPI = {
  async getAll(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return (data || []).map(t => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      body: t.body,
      variables: t.variables || [],
      isActive: t.is_active,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }))
  },

  async create(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name: template.name,
        subject: template.subject,
        body: template.body,
        variables: template.variables,
        is_active: template.isActive,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      body: data.body,
      variables: data.variables || [],
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  async update(id: string, template: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EmailTemplate> {
    const updateData: Record<string, any> = {}
    if (template.name !== undefined) updateData.name = template.name
    if (template.subject !== undefined) updateData.subject = template.subject
    if (template.body !== undefined) updateData.body = template.body
    if (template.variables !== undefined) updateData.variables = template.variables
    if (template.isActive !== undefined) updateData.is_active = template.isActive

    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      body: data.body,
      variables: data.variables || [],
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  },
}
