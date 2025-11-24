import { supabase } from '@/lib/supabase'
import type { AppSettings, UpdateSettingsInput } from '@/types'

/**
 * Get all app settings from key-value store
 */
export const getSettings = async (): Promise<AppSettings> => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')

  if (error) {
    throw new Error(`Failed to fetch settings: ${error.message}`)
  }

  // Transform array of key-value pairs to object
  const settings: Record<string, any> = { id: 'settings' }
  
  if (data) {
    data.forEach((row: any) => {
      // Convert camelCase key back from snake_case if needed
      const key = row.key
      settings[key] = row.value
    })
  }

  return {
    id: 'settings',
    siteName: settings.site_name || '',
    siteDescription: settings.site_description || '',
    contactEmail: settings.contact_email || '',
    supportEmail: settings.support_email || '',
    logoUrl: settings.logo_url || '',
    faviconUrl: settings.favicon_url || '',
    defaultNotificationImageUrl: settings.default_notification_image_url || '',
    maintenanceMode: settings.maintenance_mode || false,
    registrationEnabled: settings.registration_enabled ?? true,
    emailVerificationRequired: settings.email_verification_required ?? true,
    maxFileUploadSize: settings.max_file_upload_size || 5,
    allowedFileTypes: settings.allowed_file_types || ['image/jpeg', 'image/png'],
    sessionTimeout: settings.session_timeout || 60,
    passwordMinLength: settings.password_min_length || 8,
    passwordRequireUppercase: settings.password_require_uppercase ?? true,
    passwordRequireLowercase: settings.password_require_lowercase ?? true,
    passwordRequireNumbers: settings.password_require_numbers ?? true,
    passwordRequireSpecialChars: settings.password_require_special_chars ?? true,
    emailNotifications: settings.email_notifications ?? true,
    pushNotifications: settings.push_notifications ?? false,
    newUserSignup: settings.new_user_signup ?? true,
    contentSubmitted: settings.content_submitted ?? true,
    contentApproved: settings.content_approved ?? true,
    contentRejected: settings.content_rejected ?? true,
    subscriptionExpiring: settings.subscription_expiring ?? true,
    subscriptionRenewed: settings.subscription_renewed ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Update app settings
 * Only superadmin can update settings (enforced by RLS)
 */
export const updateSettings = async (
  id: string,
  input: UpdateSettingsInput
): Promise<AppSettings> => {
  // Transform camelCase to snake_case and prepare updates
  const updates: Array<{ key: string; value: any }> = []

  if (input.siteName !== undefined) updates.push({ key: 'site_name', value: input.siteName })
  if (input.siteDescription !== undefined) updates.push({ key: 'site_description', value: input.siteDescription })
  if (input.contactEmail !== undefined) updates.push({ key: 'contact_email', value: input.contactEmail })
  if (input.supportEmail !== undefined) updates.push({ key: 'support_email', value: input.supportEmail })
  if (input.logoUrl !== undefined) updates.push({ key: 'logo_url', value: input.logoUrl })
  if (input.faviconUrl !== undefined) updates.push({ key: 'favicon_url', value: input.faviconUrl })
  if (input.defaultNotificationImageUrl !== undefined) updates.push({ key: 'default_notification_image_url', value: input.defaultNotificationImageUrl })
  if (input.maintenanceMode !== undefined) updates.push({ key: 'maintenance_mode', value: input.maintenanceMode })
  if (input.registrationEnabled !== undefined) updates.push({ key: 'registration_enabled', value: input.registrationEnabled })
  if (input.emailVerificationRequired !== undefined) updates.push({ key: 'email_verification_required', value: input.emailVerificationRequired })
  if (input.maxFileUploadSize !== undefined) updates.push({ key: 'max_file_upload_size', value: input.maxFileUploadSize })
  if (input.allowedFileTypes !== undefined) updates.push({ key: 'allowed_file_types', value: input.allowedFileTypes })
  if (input.sessionTimeout !== undefined) updates.push({ key: 'session_timeout', value: input.sessionTimeout })
  if (input.passwordMinLength !== undefined) updates.push({ key: 'password_min_length', value: input.passwordMinLength })
  if (input.passwordRequireUppercase !== undefined) updates.push({ key: 'password_require_uppercase', value: input.passwordRequireUppercase })
  if (input.passwordRequireLowercase !== undefined) updates.push({ key: 'password_require_lowercase', value: input.passwordRequireLowercase })
  if (input.passwordRequireNumbers !== undefined) updates.push({ key: 'password_require_numbers', value: input.passwordRequireNumbers })
  if (input.passwordRequireSpecialChars !== undefined) updates.push({ key: 'password_require_special_chars', value: input.passwordRequireSpecialChars })
  if (input.emailNotifications !== undefined) updates.push({ key: 'email_notifications', value: input.emailNotifications })
  if (input.pushNotifications !== undefined) updates.push({ key: 'push_notifications', value: input.pushNotifications })
  if (input.newUserSignup !== undefined) updates.push({ key: 'new_user_signup', value: input.newUserSignup })
  if (input.contentSubmitted !== undefined) updates.push({ key: 'content_submitted', value: input.contentSubmitted })
  if (input.contentApproved !== undefined) updates.push({ key: 'content_approved', value: input.contentApproved })
  if (input.contentRejected !== undefined) updates.push({ key: 'content_rejected', value: input.contentRejected })
  if (input.subscriptionExpiring !== undefined) updates.push({ key: 'subscription_expiring', value: input.subscriptionExpiring })
  if (input.subscriptionRenewed !== undefined) updates.push({ key: 'subscription_renewed', value: input.subscriptionRenewed })

  // Upsert each setting (insert or update)
  for (const update of updates) {
    const { error } = await supabase
      .from('app_settings')
      .upsert(
        {
          key: update.key,
          value: update.value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )

    if (error) {
      throw new Error(`Failed to update setting ${update.key}: ${error.message}`)
    }
  }

  // Return updated settings
  return getSettings()
}
