import { supabase } from '@/lib/supabase'
import type { AppSettings, UpdateSettingsInput } from '@/types'

/**
 * Get the current app settings
 */
export const getSettings = async (): Promise<AppSettings> => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to fetch settings: ${error.message}`)
  }

  // Transform snake_case to camelCase
  return {
    id: data.id,
    siteName: data.site_name,
    siteDescription: data.site_description,
    contactEmail: data.contact_email,
    supportEmail: data.support_email,
    logoUrl: data.logo_url,
    faviconUrl: data.favicon_url,
    defaultNotificationImageUrl: data.default_notification_image_url,
    maintenanceMode: data.maintenance_mode,
    registrationEnabled: data.registration_enabled,
    emailVerificationRequired: data.email_verification_required,
    maxFileUploadSize: data.max_file_upload_size,
    allowedFileTypes: data.allowed_file_types || [],
    sessionTimeout: data.session_timeout,
    passwordMinLength: data.password_min_length,
    passwordRequireUppercase: data.password_require_uppercase,
    passwordRequireLowercase: data.password_require_lowercase,
    passwordRequireNumbers: data.password_require_numbers,
    passwordRequireSpecialChars: data.password_require_special_chars,
    emailNotifications: data.email_notifications,
    pushNotifications: data.push_notifications,
    newUserSignup: data.new_user_signup,
    contentSubmitted: data.content_submitted,
    contentApproved: data.content_approved,
    contentRejected: data.content_rejected,
    subscriptionExpiring: data.subscription_expiring,
    subscriptionRenewed: data.subscription_renewed,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Update app settings
 */
export const updateSettings = async (
  id: string,
  input: UpdateSettingsInput
): Promise<AppSettings> => {
  // Transform camelCase to snake_case
  const updateData: Record<string, any> = {}

  if (input.siteName !== undefined) updateData.site_name = input.siteName
  if (input.siteDescription !== undefined) updateData.site_description = input.siteDescription
  if (input.contactEmail !== undefined) updateData.contact_email = input.contactEmail
  if (input.supportEmail !== undefined) updateData.support_email = input.supportEmail
  if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl
  if (input.faviconUrl !== undefined) updateData.favicon_url = input.faviconUrl
  if (input.defaultNotificationImageUrl !== undefined) updateData.default_notification_image_url = input.defaultNotificationImageUrl
  if (input.maintenanceMode !== undefined) updateData.maintenance_mode = input.maintenanceMode
  if (input.registrationEnabled !== undefined) updateData.registration_enabled = input.registrationEnabled
  if (input.emailVerificationRequired !== undefined) updateData.email_verification_required = input.emailVerificationRequired
  if (input.maxFileUploadSize !== undefined) updateData.max_file_upload_size = input.maxFileUploadSize
  if (input.allowedFileTypes !== undefined) updateData.allowed_file_types = input.allowedFileTypes
  if (input.sessionTimeout !== undefined) updateData.session_timeout = input.sessionTimeout
  if (input.passwordMinLength !== undefined) updateData.password_min_length = input.passwordMinLength
  if (input.passwordRequireUppercase !== undefined) updateData.password_require_uppercase = input.passwordRequireUppercase
  if (input.passwordRequireLowercase !== undefined) updateData.password_require_lowercase = input.passwordRequireLowercase
  if (input.passwordRequireNumbers !== undefined) updateData.password_require_numbers = input.passwordRequireNumbers
  if (input.passwordRequireSpecialChars !== undefined) updateData.password_require_special_chars = input.passwordRequireSpecialChars
  if (input.emailNotifications !== undefined) updateData.email_notifications = input.emailNotifications
  if (input.pushNotifications !== undefined) updateData.push_notifications = input.pushNotifications
  if (input.newUserSignup !== undefined) updateData.new_user_signup = input.newUserSignup
  if (input.contentSubmitted !== undefined) updateData.content_submitted = input.contentSubmitted
  if (input.contentApproved !== undefined) updateData.content_approved = input.contentApproved
  if (input.contentRejected !== undefined) updateData.content_rejected = input.contentRejected
  if (input.subscriptionExpiring !== undefined) updateData.subscription_expiring = input.subscriptionExpiring
  if (input.subscriptionRenewed !== undefined) updateData.subscription_renewed = input.subscriptionRenewed

  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('app_settings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update settings: ${error.message}`)
  }

  // Transform response
  return {
    id: data.id,
    siteName: data.site_name,
    siteDescription: data.site_description,
    contactEmail: data.contact_email,
    supportEmail: data.support_email,
    logoUrl: data.logo_url,
    faviconUrl: data.favicon_url,
    defaultNotificationImageUrl: data.default_notification_image_url,
    maintenanceMode: data.maintenance_mode,
    registrationEnabled: data.registration_enabled,
    emailVerificationRequired: data.email_verification_required,
    maxFileUploadSize: data.max_file_upload_size,
    allowedFileTypes: data.allowed_file_types || [],
    sessionTimeout: data.session_timeout,
    passwordMinLength: data.password_min_length,
    passwordRequireUppercase: data.password_require_uppercase,
    passwordRequireLowercase: data.password_require_lowercase,
    passwordRequireNumbers: data.password_require_numbers,
    passwordRequireSpecialChars: data.password_require_special_chars,
    emailNotifications: data.email_notifications,
    pushNotifications: data.push_notifications,
    newUserSignup: data.new_user_signup,
    contentSubmitted: data.content_submitted,
    contentApproved: data.content_approved,
    contentRejected: data.content_rejected,
    subscriptionExpiring: data.subscription_expiring,
    subscriptionRenewed: data.subscription_renewed,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
