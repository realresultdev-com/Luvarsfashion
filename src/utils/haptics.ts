import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

export const nativeFeedback = {
  // Light tap feedback for buttons, navigation tabs, and chips
  lightTap: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch (_) {}
  },

  // Medium feedback for toggles, video play/pause, add to cart
  mediumTap: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (navigator.vibrate) {
        navigator.vibrate(25);
      }
    } catch (_) {}
  },

  // Success feedback for purchase, clearing cache, login
  success: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (navigator.vibrate) {
        navigator.vibrate([15, 30, 20]);
      }
    } catch (_) {}
  },
};
