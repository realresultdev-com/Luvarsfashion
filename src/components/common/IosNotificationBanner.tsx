import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PackageCheck, ChevronRight, X } from "lucide-react";
import { notificationService, AppNotification, ParsedNotificationData } from "../../services/notification.service";

interface ActiveBanner {
  notification: AppNotification;
  data: ParsedNotificationData;
  id: string;
}

export default function IosNotificationBanner() {
  const [activeBanner, setActiveBanner] = useState<ActiveBanner | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to notification events
    const unsubscribe = notificationService.subscribe((notification, data) => {
      // Clear existing timer
      if (autoDismissTimer.current) {
        clearTimeout(autoDismissTimer.current);
      }

      setIsExiting(false);
      setDragOffset(0);
      setActiveBanner({ notification, data, id: notification.id });

      // Auto dismiss after 8 seconds
      autoDismissTimer.current = setTimeout(() => {
        dismissBanner();
      }, 8000);
    });

    return () => {
      unsubscribe();
      if (autoDismissTimer.current) {
        clearTimeout(autoDismissTimer.current);
      }
    };
  }, []);

  const dismissBanner = () => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveBanner(null);
      setIsExiting(false);
      setDragOffset(0);
    }, 350);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff < 0) {
      // Swiping up
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset < -40) {
      dismissBanner();
    } else {
      setDragOffset(0);
    }
    touchStartY.current = null;
  };

  const handleViewOrder = () => {
    dismissBanner();
    navigate("/admin/orders");
  };

  if (!activeBanner) return null;

  const { notification, data } = activeBanner;
  const cleanMessage = (msg: string) => {
    if (!msg) return "";
    return msg.replace(/\s{2,}/g, " ").trim();
  };

  const displayAmount =
    data.formattedAmount ||
    (data.totalAmount ? `₹${Number(data.totalAmount).toLocaleString("en-IN")}` : null);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[99999] pointer-events-none flex justify-center px-3 sm:px-4"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.6rem)",
      }}
    >
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: dragOffset === 0 ? "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease" : "none",
        }}
        className={`pointer-events-auto w-full max-w-md select-none transform transition-all duration-350 ease-out ${
          isExiting ? "opacity-0 -translate-y-8 scale-95" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Amazon-Style Order Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl border border-amber-200/70 p-4 transition-all ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              {/* Amazon-Style Order Placed Icon */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF9900] to-[#E68000] flex items-center justify-center text-white shadow-sm shrink-0">
                <PackageCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-gray-900">
                  Luvars Fashion
                </span>
                <span className="text-[10px] text-gray-300">•</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 uppercase tracking-wider">
                  Order Placed
                </span>
                <span className="text-[10px] text-gray-300">•</span>
                <span className="text-[11px] text-gray-500 font-medium">Just now</span>
              </div>
            </div>

            <button
              onClick={dismissBanner}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Content */}
          <div className="pl-1 pr-1">
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate flex items-center gap-2">
              <span>{notification.title}</span>
            </h4>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
              {cleanMessage(notification.message)}
            </p>

            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-[11px] text-gray-700 font-medium truncate max-w-[140px]">
                  {data.customerName || "Customer order"}
                </div>
                {displayAmount && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {displayAmount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={dismissBanner}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleViewOrder}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#191142] hover:bg-[#251a5c] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                >
                  <span>View Order</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

