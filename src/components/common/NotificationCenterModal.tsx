import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Send, X, PackageCheck, Loader2 } from "lucide-react";
import { notificationService, AppNotification } from "../../services/notification.service";

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateBadge?: () => void;
}

export default function NotificationCenterModal({
  isOpen,
  onClose,
  onUpdateBadge,
}: NotificationCenterModalProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      onUpdateBadge?.();
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      onUpdateBadge?.();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleSendTestNotification = async () => {
    setSendingTest(true);
    try {
      await notificationService.triggerTestOrder();
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to trigger test notification:", err);
    } finally {
      setSendingTest(false);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.is_read) {
      notificationService.markAsRead(notif.id).catch(console.error);
    }
    onClose();
    navigate("/admin/orders");
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const cleanMessage = (msg: string) => {
    if (!msg) return "";
    return msg.replace(/\s{2,}/g, " ").trim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Standard Clean Human Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-[#191142] shrink-0">
              <Bell className="w-5 h-5 text-[#191142]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#191142] text-base tracking-tight">
                  Order Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Customer order alerts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 font-semibold text-[#0ea9df] hover:text-[#0b8cb9] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>

          <button
            onClick={handleSendTestNotification}
            disabled={sendingTest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
          >
            {sendingTest ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-gray-500" />
                <span>Send test alert</span>
              </>
            )}
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 px-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                <Bell className="w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-800 text-sm">No notifications yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                When customers place orders, real-time alerts will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              let parsed: any = {};
              try {
                if (notif.data) parsed = JSON.parse(notif.data);
              } catch {
                parsed = {};
              }

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    notif.is_read
                      ? "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                      : "bg-white border-[#0ea9df]/40 shadow-xs ring-1 ring-[#0ea9df]/10"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.is_read
                        ? "bg-gray-100 text-gray-500"
                        : "bg-gradient-to-br from-[#FF9900]/20 to-[#FF9900]/10 text-[#D97706] border border-amber-200/80"
                    }`}
                  >
                    <PackageCheck className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                        {notif.title}
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#FF9900] shrink-0" />
                        )}
                      </h4>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {new Date(notif.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {cleanMessage(notif.message)}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] text-gray-500">
                      {(parsed.formattedAmount || parsed.totalAmount) && (
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {parsed.formattedAmount || `₹${Number(parsed.totalAmount).toLocaleString("en-IN")}`}
                        </span>
                      )}
                      {parsed.customerName && (
                        <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                          {parsed.customerName}
                        </span>
                      )}
                      {(parsed.productSummary || parsed.firstItemName) && (
                        <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                          {parsed.productSummary || parsed.firstItemName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>
            {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

