import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import AdminSidebar, { ADMIN_NAV_ITEMS } from "./AdminSidebar";
import LuvarsLogo from "../common/LuvarsLogo";
import { Menu, X, ArrowLeft, Store, ShieldCheck, Bell } from "lucide-react";
import NotificationCenterModal from "../common/NotificationCenterModal";
import { notificationService } from "../../services/notification.service";

export default function AdminLayout() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const location = useLocation();
  const tabsRef = useRef<HTMLDivElement>(null);

  const refreshUnread = async () => {
    try {
      const data = await notificationService.getNotifications();
      setUnreadNotifs(data.unreadCount);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshUnread();
    const unsub = notificationService.subscribe(() => {
      setUnreadNotifs((prev) => prev + 1);
    });
    return unsub;
  }, []);

  // Auto-scroll active tab pill into view on mobile
  useEffect(() => {
    if (tabsRef.current) {
      const activeEl = tabsRef.current.querySelector<HTMLElement>("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [location.pathname]);

  // Find active item title for mobile header
  const currentItem =
    ADMIN_NAV_ITEMS.find((item) =>
      item.path === "/admin"
        ? location.pathname === "/admin"
        : location.pathname.startsWith(item.path)
    ) || ADMIN_NAV_ITEMS[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col lg:flex-row border-t border-gray-200">
      {/* 1. Desktop Sidebar (hidden on mobile/tablet) */}
      <AdminSidebar className="hidden lg:flex min-h-[calc(100vh-4rem)]" />

      {/* 2. Mobile & Tablet Native App Bar & Scrollable Tabs (hidden on desktop) */}
      <div className="lg:hidden w-full bg-white shrink-0 sticky top-0 z-30 shadow-2xs">
        {/* Native Top App Bar */}
        <div className="bg-black text-white px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <LuvarsLogo isWhite={true} className="scale-90 origin-left" />
            <span className="text-[10px] font-semibold tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded border border-white/20 shrink-0">
              Admin
            </span>
            <span className="text-xs text-gray-300 truncate font-medium border-l border-white/20 pl-2 hidden sm:inline">
              {currentItem.label}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Notification Bell Button */}
            <button
              type="button"
              onClick={() => setNotifModalOpen(true)}
              className="relative p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Order Notifications"
              aria-label="Order notifications"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs > 9 ? "9+" : unreadNotifs}
                </span>
              )}
            </button>

            <Link
              to="/"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
              title="Return to Store"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Open admin navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Native Horizontal Pill Navigation Bar */}
        <div
          ref={tabsRef}
          className="overflow-x-auto no-scrollbar py-2 px-3 bg-white border-b border-gray-200 flex items-center gap-1.5"
          role="tablist"
          aria-label="Admin Page Sections"
        >
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                data-active={isActive ? "true" : "false"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-black text-white shadow-2xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black border border-gray-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-gray-500"}`} />
                <span className="whitespace-nowrap">{item.shortLabel}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* 3. Mobile Slide-out Drawer Sheet */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <AdminSidebar
              onClose={() => setMobileDrawerOpen(false)}
              className="w-full h-full border-r-0"
            />
          </div>
        </div>
      )}

      {/* 4. Main Responsive Content Area (100% width on mobile, full responsiveness) */}
      <main className="flex-1 w-full min-w-0 bg-white overflow-y-auto p-3 sm:p-4 md:p-6 pb-28 lg:pb-8">
        <Outlet />
      </main>

      {/* iOS-Style Real-time Order Notification Center Modal */}
      <NotificationCenterModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        onUpdateBadge={refreshUnread}
      />
    </div>
  );
}

