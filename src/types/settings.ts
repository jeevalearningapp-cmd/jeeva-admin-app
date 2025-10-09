export interface AppSettings {
  id: string
  siteName: string
  siteDescription?: string
  contactEmail?: string
  supportEmail?: string
  logoUrl?: string
  faviconUrl?: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  maxFileUploadSize: number // in MB
  allowedFileTypes: string[]
  sessionTimeout: number // in minutes
  passwordMinLength: number
  passwordRequireUppercase: boolean
  passwordRequireLowercase: boolean
  passwordRequireNumbers: boolean
  passwordRequireSpecialChars: boolean
  // Notification Settings
  emailNotifications: boolean
  pushNotifications: boolean
  newUserSignup: boolean
  contentSubmitted: boolean
  contentApproved: boolean
  contentRejected: boolean
  subscriptionExpiring: boolean
  subscriptionRenewed: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UpdateSettingsInput {
  siteName?: string
  siteDescription?: string
  contactEmail?: string
  supportEmail?: string
  logoUrl?: string
  faviconUrl?: string
  maintenanceMode?: boolean
  registrationEnabled?: boolean
  emailVerificationRequired?: boolean
  maxFileUploadSize?: number
  allowedFileTypes?: string[]
  sessionTimeout?: number
  passwordMinLength?: number
  passwordRequireUppercase?: boolean
  passwordRequireLowercase?: boolean
  passwordRequireNumbers?: boolean
  passwordRequireSpecialChars?: boolean
  // Notification Settings
  emailNotifications?: boolean
  pushNotifications?: boolean
  newUserSignup?: boolean
  contentSubmitted?: boolean
  contentApproved?: boolean
  contentRejected?: boolean
  subscriptionExpiring?: boolean
  subscriptionRenewed?: boolean
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface NotificationSettings {
  id: string
  emailNotifications: boolean
  pushNotifications: boolean
  newUserSignup: boolean
  contentSubmitted: boolean
  contentApproved: boolean
  contentRejected: boolean
  subscriptionExpiring: boolean
  subscriptionRenewed: boolean
  createdAt?: string
  updatedAt?: string
}
