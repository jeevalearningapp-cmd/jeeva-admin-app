import { Notification } from "@/types/notifications";

const STORAGE_KEY = "jeeva_admin_notifications";
const LAST_SYNC_KEY = "jeeva_admin_notifications_last_sync";

export class LocalNotificationStore {
  /**
   * Save notifications to local storage.
   */
  static saveNotifications(newNotifications: Notification[]): void {
    try {
      const current = this.getAllNotifications();

      const notificationMap = new Map(current.map((n) => [n.id, n]));

      newNotifications.forEach((n) => {
        notificationMap.set(n.id, n);
      });

      const updated = Array.from(notificationMap.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save local notifications:", error);
    }
  }

  /**
   * Get all notifications from local storage
   */
  static getAllNotifications(): Notification[] {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error("Failed to get local notifications:", error);
      return [];
    }
  }

  /**
   * Get paginated notifications
   */
  static getNotifications(limit = 50, offset = 0): Notification[] {
    const all = this.getAllNotifications();
    return all.slice(offset, offset + limit);
  }

  static getLastSyncedAt(): string | null {
    return localStorage.getItem(LAST_SYNC_KEY);
  }

  static updateLastSyncedAt(timestamp: string): void {
    localStorage.setItem(LAST_SYNC_KEY, timestamp);
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
  }
}
