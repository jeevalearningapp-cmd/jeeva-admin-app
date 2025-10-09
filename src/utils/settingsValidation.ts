import { isValidEmail } from './security'

interface ValidationError {
  field: string
  message: string
}

export interface SettingsValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export const validateSettings = (settings: Record<string, any>): SettingsValidationResult => {
  const errors: ValidationError[] = []

  // Validate site name
  if (!settings.siteName || settings.siteName.trim().length === 0) {
    errors.push({ field: 'siteName', message: 'Site name is required' })
  } else if (settings.siteName.length > 255) {
    errors.push({ field: 'siteName', message: 'Site name must be less than 255 characters' })
  }

  // Validate emails
  if (settings.contactEmail && !isValidEmail(settings.contactEmail)) {
    errors.push({ field: 'contactEmail', message: 'Contact email is invalid' })
  }

  if (settings.supportEmail && !isValidEmail(settings.supportEmail)) {
    errors.push({ field: 'supportEmail', message: 'Support email is invalid' })
  }

  // Validate numeric fields - treat empty/null as required field error
  if (settings.maxFileUploadSize !== undefined && settings.maxFileUploadSize !== null) {
    const size = Number(settings.maxFileUploadSize)
    if (isNaN(size) || settings.maxFileUploadSize === '' || settings.maxFileUploadSize === 0) {
      errors.push({ field: 'maxFileUploadSize', message: 'File upload size is required' })
    } else if (size < 1) {
      errors.push({ field: 'maxFileUploadSize', message: 'File upload size must be at least 1 MB' })
    } else if (size > 100) {
      errors.push({ field: 'maxFileUploadSize', message: 'File upload size cannot exceed 100 MB' })
    }
  }

  if (settings.sessionTimeout !== undefined && settings.sessionTimeout !== null) {
    const timeout = Number(settings.sessionTimeout)
    if (isNaN(timeout) || settings.sessionTimeout === '' || settings.sessionTimeout === 0) {
      errors.push({ field: 'sessionTimeout', message: 'Session timeout is required' })
    } else if (timeout < 5) {
      errors.push({ field: 'sessionTimeout', message: 'Session timeout must be at least 5 minutes' })
    } else if (timeout > 1440) {
      errors.push({ field: 'sessionTimeout', message: 'Session timeout cannot exceed 1440 minutes (24 hours)' })
    }
  }

  if (settings.passwordMinLength !== undefined && settings.passwordMinLength !== null) {
    const length = Number(settings.passwordMinLength)
    if (isNaN(length) || settings.passwordMinLength === '' || settings.passwordMinLength === 0) {
      errors.push({ field: 'passwordMinLength', message: 'Password minimum length is required' })
    } else if (length < 6) {
      errors.push({ field: 'passwordMinLength', message: 'Password minimum length must be at least 6' })
    } else if (length > 128) {
      errors.push({ field: 'passwordMinLength', message: 'Password minimum length cannot exceed 128' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const getValidationErrorMessage = (
  field: string,
  errors: ValidationError[]
): string | undefined => {
  const error = errors.find((e) => e.field === field)
  return error?.message
}
