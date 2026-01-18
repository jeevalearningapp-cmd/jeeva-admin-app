export type Platform = "ios" | "android";

export type NotificationStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"
  | "cancelled";

export type NotificationType =
  | "manual"
  | "subscription_expiring"
  | "content_approved"
  | "content_rejected"
  | "welcome"
  | "study_reminder";

export type DeliveryStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "failed"
  | "read";

export type QueueStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type AudienceFilterType =
  | "all"
  | "subscription_tier"
  | "specific_users"
  | "active_users";

export interface PushToken {
  id: string;
  userId: string;
  expoPushToken: string;
  deviceId?: string;
  platform?: Platform;
  isActive: boolean;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceFilter {
  type: AudienceFilterType;
  value?: string | string[];
  subscriptionTier?: string;
  userIds?: string[];
}

export interface NotificationData {
  screen?: string;
  lessonId?: string;
  moduleId?: string;
  topicId?: string;
  subscriptionId?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: NotificationData;
  audienceFilter: AudienceFilter;
  scheduledFor?: string;
  sentAt?: string;
  status: NotificationStatus;
  notificationType: NotificationType;
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTarget {
  id: string;
  notificationId: string;
  userId: string;
  pushTokenId?: string;
  deliveryStatus: DeliveryStatus;
  expoTicketId?: string;
  expoReceiptId?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueue {
  id: string;
  notificationId: string;
  runAt: string;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  status: QueueStatus;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationInput {
  title: string;
  body: string;
  imageUrl?: string;
  data?: NotificationData;
  audienceFilter: AudienceFilter;
  scheduledFor?: string;
  notificationType?: NotificationType;
}

export interface UpdateNotificationInput {
  title?: string;
  body?: string;
  imageUrl?: string;
  data?: NotificationData;
  audienceFilter?: AudienceFilter;
  scheduledFor?: string;
  status?: NotificationStatus;
}

export interface NotificationStats {
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalRead: number;
  deliveryRate: number;
  openRate: number;
}

export interface UserTargetingOption {
  id: string;
  label: string;
  count: number;
  type: "all" | "subscription" | "activity" | "custom";
}

export interface NotificationCampaign extends Notification {
  stats: NotificationStats;
  createdByAdmin?: {
    id: string;
    email: string;
    fullName?: string;
  };
}

export interface NotificationFilters {
  status?: NotificationStatus[];
  type?: NotificationType[];
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface RegisterPushTokenInput {
  expoPushToken: string;
  deviceId?: string;
  platform?: Platform;
}

export interface UpdatePushTokenInput {
  isActive?: boolean;
  lastSeenAt?: string;
}

export interface UserNotification extends Notification {
  isRead: boolean;
  readAt?: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  subscriptionExpiringEnabled: boolean;
  contentApprovedEnabled: boolean;
  welcomeEnabled: boolean;
  milestonesEnabled: boolean;
  marketingEnabled: boolean;
  quietHours?: {
    start: string;
    end: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferencesInput {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  subscriptionExpiringEnabled?: boolean;
  contentApprovedEnabled?: boolean;
  welcomeEnabled?: boolean;
  milestonesEnabled?: boolean;
  marketingEnabled?: boolean;
  quietHours?: {
    start: string;
    end: string;
  } | null;
}
