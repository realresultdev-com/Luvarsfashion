import { LocalNotifications } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { Haptics, NotificationType } from "@capacitor/haptics";
import { playIosChime } from "../utils/sound";
import { api } from "./api";

export interface AppNotification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  data: string | null;
  is_read: number;
  created_at: string;
}

export interface ParsedNotificationData {
  orderId?: string;
  shortOrderId?: string;
  totalAmount?: number | string;
  formattedAmount?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  city?: string;
  itemsCount?: number | string;
  firstItemName?: string;
  productSummary?: string;
  isTest?: boolean;
  createdAt?: string;
}

type NotificationListener = (notif: AppNotification, parsedData: ParsedNotificationData) => void;

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;
  private hasInitializedSync = false;
  private lastSeenNotifId: string | null = localStorage.getItem("last_seen_notif_id");
  private processedNotifIds: Set<string> = new Set();

  constructor() {
    try {
      const cached = sessionStorage.getItem("processed_notif_ids");
      if (cached) {
        JSON.parse(cached).forEach((id: string) => this.processedNotifIds.add(id));
      }
    } catch {}
  }

  private isDuplicate(id?: string, orderId?: string): boolean {
    if (id && this.processedNotifIds.has(id)) return true;
    if (orderId && this.processedNotifIds.has(`order-${orderId}`)) return true;
    return false;
  }

  private markProcessed(id?: string, orderId?: string): void {
    if (id) this.processedNotifIds.add(id);
    if (orderId) this.processedNotifIds.add(`order-${orderId}`);
    try {
      const arr = Array.from(this.processedNotifIds).slice(-100);
      sessionStorage.setItem("processed_notif_ids", JSON.stringify(arr));
    } catch {}
  }

  /**
   * Initialize native channels and action listeners
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (Capacitor.isNativePlatform()) {
      try {
        // 1. Local Notifications Permissions & Channel
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== "granted") {
          await LocalNotifications.requestPermissions();
        }

        // Create high-priority Android channel for Order notifications with Amazon amber color #FF9900
        await LocalNotifications.createChannel({
          id: "orders_channel",
          name: "Order Notifications",
          description: "Instant high-priority alerts when customer places an order",
          importance: 5, // High / Heads-up
          visibility: 1, // Public on lock screen
          vibration: true,
          lights: true,
          lightColor: "#FF9900",
        });

        try {
          await PushNotifications.createChannel({
            id: "orders_channel",
            name: "Order Notifications",
            description: "Instant high-priority alerts when customer places an order",
            importance: 5,
            visibility: 1,
            vibration: true,
            lights: true,
            lightColor: "#FF9900",
          });
        } catch (e) {
          console.warn("PushNotifications.createChannel fallback:", e);
        }

        // Listen for user tap on local notification
        LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
          const extra = action.notification?.extra || {};
          if (extra.notifId || extra.orderId) {
            this.markProcessed(extra.notifId, extra.orderId);
          }
          const userStr = localStorage.getItem("user");
          let isAdmin = false;
          try {
            if (userStr) {
              const u = JSON.parse(userStr);
              isAdmin = u.role === "ADMIN";
            }
          } catch {}
          window.location.href = isAdmin ? `/admin/orders` : `/user/orders`;
        });

        // 2. Firebase Cloud Messaging (FCM) Remote Push Notifications
        const pushPerm = await PushNotifications.checkPermissions();
        if (pushPerm.receive !== "granted") {
          await PushNotifications.requestPermissions();
        }

        // Register device with FCM / APNs
        await PushNotifications.register();

        // Listen for device FCM registration token
        PushNotifications.addListener("registration", async (token) => {
          console.log("Device FCM registration token received:", token.value);
          localStorage.setItem("fcm_device_token", token.value);
          await this.syncDeviceToken(token.value);
        });

        PushNotifications.addListener("registrationError", (err) => {
          console.warn("FCM registration error:", err);
        });

        // Listen for remote push notifications received while app is in foreground
        PushNotifications.addListener("pushNotificationReceived", async (notification) => {
          console.log("FCM push notification received in foreground:", notification);
          const data = (notification.data || {}) as Record<string, string>;
          const orderId = data.orderId || notification.id;
          const notifId = notification.id || (orderId ? `fcm-${orderId}` : `fcm-${Date.now()}`);

          // Deduplicate if already processed
          if (this.isDuplicate(notifId, orderId)) {
            console.log("[NotificationService] Ignoring duplicate FCM push:", notifId);
            return;
          }
          this.markProcessed(notifId, orderId);

          const formattedAmount = data.formattedAmount || (data.totalAmount ? `₹${Number(data.totalAmount).toLocaleString("en-IN")}` : "");
          const shortOrderId = data.shortOrderId || (orderId ? orderId.slice(-6).toUpperCase() : "");
          const title = notification.title || (formattedAmount ? `📦 Order Placed: ${formattedAmount} • #${shortOrderId}` : `📦 Order Placed #${shortOrderId}`);
          const message = notification.body || (data.customerName ? `${data.customerName} placed an order for ${data.productSummary || data.firstItemName || 'Luvars Fashion'}` : "New order placed by customer");

          const notifItem: AppNotification = {
            id: notifId,
            user_id: null,
            title,
            message,
            type: data.type || "ORDER_CREATED",
            data: JSON.stringify(data),
            is_read: 0,
            created_at: data.createdAt || new Date().toISOString(),
          };

          // Show in-app banner with chime & haptic (skip system tray since app is active in foreground)
          await this.triggerAlert(notifItem, { skipSystemTray: true });
        });

        // Listen for user tap on native system tray push notification
        PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
          console.log("User tapped FCM push notification:", action);
          const data = (action.notification?.data || {}) as Record<string, string>;
          if (data.orderId || action.notification?.id) {
            this.markProcessed(action.notification?.id, data.orderId);
          }
          const userStr = localStorage.getItem("user");
          let isAdmin = false;
          try {
            if (userStr) {
              const u = JSON.parse(userStr);
              isAdmin = u.role === "ADMIN";
            }
          } catch {}
          window.location.href = isAdmin ? `/admin/orders` : `/user/orders`;
        });

        // Immediately sync existing token if already stored on device
        const existingToken = localStorage.getItem("fcm_device_token");
        if (existingToken) {
          await this.syncDeviceToken(existingToken);
        }
      } catch (err) {
        console.warn("Native Push/LocalNotifications setup skipped or failed:", err);
      }
    }
  }

  /**
   * Subscribe to incoming notifications
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Trigger in-app + native device push notification alert
   */
  async triggerAlert(notif: AppNotification, options: { skipSystemTray?: boolean; force?: boolean } = {}): Promise<void> {
    let parsedData: ParsedNotificationData = {};
    try {
      if (notif.data) {
        parsedData = JSON.parse(notif.data);
      }
    } catch {
      parsedData = {};
    }

    // Deduplication check
    if (!options.force && this.isDuplicate(notif.id, parsedData.orderId)) {
      console.log("[NotificationService] Deduplicated alert for:", notif.id, parsedData.orderId);
      return;
    }
    this.markProcessed(notif.id, parsedData.orderId);

    // 1. Play crystal-clear synthesized chime
    playIosChime();

    // 2. Trigger high-end haptic feedback
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      // Haptics not available on non-mobile browsers
    }

    // 3. Emit to in-app Banner component
    Array.from(this.listeners).forEach((listener) => listener(notif, parsedData));

    // 4. Schedule Native Android System Notification ONLY if explicitly needed and not skipped
    // (FCM handles system tray notifications when app is in background/closed)
    if (Capacitor.isNativePlatform() && !options.skipSystemTray) {
      try {
        const uniqueKey = parsedData.orderId || notif.id;
        const numId = Math.abs(
          uniqueKey.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
        ) % 1000000;

        await LocalNotifications.schedule({
          notifications: [
            {
              id: numId,
              title: notif.title,
              body: notif.message,
              channelId: "orders_channel",
              smallIcon: "ic_stat_order_placed",
              largeIcon: "ic_order_large",
              iconColor: "#FF9900",
              // CRITICAL: Disable exact alarm so Android never opens the "Alarms & Reminders" settings screen
              // @ts-ignore
              isExactNotification: false,
              // @ts-ignore
              isExactMandatory: false,
              extra: {
                notifId: notif.id,
                orderId: parsedData.orderId,
              },
            },
          ],
        });
      } catch (err) {
        console.error("Failed to post native Android notification:", err);
      }
    }
  }

  /**
   * Start polling for notifications when an admin user is logged in
   */
  startAdminPolling(): void {
    this.stopAdminPolling();

    // Ensure FCM token is synced to database for admin
    this.syncDeviceToken();

    // Perform initial synchronization without firing alerts
    this.checkNewNotifications({ isInitialSync: true });

    // Poll every 6 seconds for in-app updates while window is active
    this.pollingInterval = setInterval(() => {
      if (!document.hidden) {
        this.checkNewNotifications({ isInitialSync: false });
      }
    }, 6000);
  }

  /**
   * Stop polling
   */
  stopAdminPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Check for new notifications from server
   */
  async checkNewNotifications(options: { isInitialSync?: boolean } = {}): Promise<AppNotification[]> {
    try {
      const res = await api.get("/notifications");
      const notifs: AppNotification[] = Array.isArray(res.data?.notifications) ? res.data.notifications : [];

      if (!notifs.length) return [];

      const latestNotif = notifs[0];

      // On initial app launch / startup sync, mark existing notifications as seen/processed
      // NEVER trigger alerts on app open for past notifications that FCM already delivered!
      if (options.isInitialSync || !this.hasInitializedSync || !this.lastSeenNotifId) {
        this.hasInitializedSync = true;
        this.lastSeenNotifId = latestNotif.id;
        localStorage.setItem("last_seen_notif_id", latestNotif.id);
        notifs.forEach((n) => {
          let p: ParsedNotificationData = {};
          try { if (n.data) p = JSON.parse(n.data); } catch {}
          this.markProcessed(n.id, p.orderId);
        });
        return notifs;
      }

      // Check if there are notifications newer than lastSeenNotifId
      const newItems: AppNotification[] = [];
      for (const item of notifs) {
        if (item.id === this.lastSeenNotifId) break;
        let p: ParsedNotificationData = {};
        try { if (item.data) p = JSON.parse(item.data); } catch {}
        if (!this.isDuplicate(item.id, p.orderId)) {
          newItems.push(item);
        }
      }

      if (newItems.length > 0) {
        this.lastSeenNotifId = latestNotif.id;
        localStorage.setItem("last_seen_notif_id", latestNotif.id);

        // Alert for each new notification in-app only (skip system tray to avoid duplicating FCM)
        for (const notif of newItems) {
          await this.triggerAlert(notif, { skipSystemTray: true });
        }
      }

      return notifs;
    } catch {
      // Ignore network errors during polling
      return [];
    }
  }

  /**
   * Send a test order notification to test the push notification and in-app banner
   */
  async triggerTestOrder(): Promise<AppNotification | null> {
    try {
      const res = await api.post("/admin/notifications/test");
      if (res.data?.notification) {
        const notif: AppNotification = res.data.notification;
        // On explicit user click of "Test Push Alert", trigger with force: true
        await this.triggerAlert(notif, { force: true, skipSystemTray: false });
        return notif;
      }
      return null;
    } catch (err) {
      console.error("Failed to trigger test order notification:", err);
      throw err;
    }
  }

  /**
   * Fetch notification list
   */
  async getNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
    const res = await api.get("/notifications");
    return {
      notifications: Array.isArray(res.data?.notifications) ? res.data.notifications : [],
      unreadCount: res.data.unreadCount || 0,
    };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  }

  /**
   * Mark all as read
   */
  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    await api.post("/notifications/mark-all-read");
  }

  /**
   * Sync native FCM device token to backend for instant push notifications
   * Works for both authenticated users and newly installed guest devices
   */
  async syncDeviceToken(customToken?: string): Promise<void> {
    const token = customToken || localStorage.getItem("fcm_device_token");
    if (!token) return;

    try {
      await api.post("/notifications/fcm-token", {
        token,
        platform: Capacitor.getPlatform() || "android",
      });
      console.log("FCM device token synced with backend for instant push notifications");
    } catch (err) {
      console.warn("Failed to sync FCM device token:", err);
    }
  }

  /**
   * Unbind user on logout while preserving device notification capabilities
   */
  async removeDeviceToken(): Promise<void> {
    const token = localStorage.getItem("fcm_device_token");
    if (!token) return;
    try {
      await api.delete("/notifications/fcm-token", { data: { token } });
    } catch (err) {
      console.warn("Failed to remove FCM device token:", err);
    }
  }
}

export const notificationService = new NotificationService();

