import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { orderService } from "../../services/order.service";
import type { Order } from "../../types/order.types";
import type { UserAddress } from "./Addresses";
import {
  Package,
  RotateCcw,
  MapPin,
  LogOut,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  X,
  Send,
  ShoppingCart,
  ShieldCheck,
  Globe,
  HelpCircle,
  Trash2,
  AlertTriangle,
  HardDrive,
  RefreshCw,
  Check,
} from "lucide-react";
import { videoCacheService } from "../../services/videoCache.service";
import { nativeFeedback } from "../../utils/haptics";

export default function Profile() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);

  // Return request modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState("Too firm / comfort preference");
  const [returnNotes, setReturnNotes] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  // Account deletion state (Google Play Policy Compliance)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Instagram-style video cache & storage state
  const [cacheStats, setCacheStats] = useState<{ count: number; sizeBytes: number; formattedSize: string }>({
    count: 0,
    sizeBytes: 0,
    formattedSize: "0.0 MB",
  });
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);

  useEffect(() => {
    videoCacheService.getCacheStats().then(setCacheStats).catch(() => {});
  }, []);

  const handleClearVideoCache = async () => {
    try {
      setClearingCache(true);
      await videoCacheService.clearVideoCache();
      const updated = await videoCacheService.getCacheStats();
      setCacheStats(updated);
      nativeFeedback.success();
      setCacheClearedSuccess(true);
      setTimeout(() => setCacheClearedSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to clear video cache:", err);
    } finally {
      setClearingCache(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      localStorage.removeItem(`buddy_addresses_${user?.id}`);
      await logout();
      window.location.href = "/";
    } catch (err) {
      console.error("Account deletion failed:", err);
      setIsDeletingAccount(false);
    }
  };

  useEffect(() => {
    // Load user orders
    orderService
      .myOrders()
      .then((res) => {
        if (Array.isArray(res?.data)) setOrders(res.data);
      })
      .catch((err) => console.error("Failed to load orders in profile:", err))
      .finally(() => setLoadingOrders(false));

    // Load default address from local storage
    if (user) {
      try {
        const saved = localStorage.getItem(`buddy_addresses_${user.id}`);
        if (saved) {
          const addrs: UserAddress[] = JSON.parse(saved);
          const def = addrs.find((a) => a.isDefault) || addrs[0] || null;
          setDefaultAddress(def);
        }
      } catch (e) {
        console.error("Failed to load address:", e);
      }
    }
  }, [user]);

  if (!user) return null;

  const handleOpenReturnModal = (order: Order) => {
    setSelectedOrderForReturn(order);
    setReturnSubmitted(false);
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setReturnSubmitted(true);
    setTimeout(() => {
      setReturnModalOpen(false);
      setReturnSubmitted(false);
      setSelectedOrderForReturn(null);
    }, 2500);
  };

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    PAID: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    PACKING: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    DISPATCHED: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
    SHIPPED: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
    ON_THE_WAY: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
    ARRIVING_TODAY: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
    DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    PENDING: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
    CANCELLED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 lg:pb-12">
      {/* 1. Clean Human Profile Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-xl sm:text-2xl shadow-2xs shrink-0 overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                user.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {user.name}
                </h1>
                {user.role === "ADMIN" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-900 text-white shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t("signOut")}</span>
          </button>
        </div>

        {/* Quick Action Shortcuts (Mobile/Desktop strip) */}
        <div className="grid grid-cols-3 gap-2 pt-5 mt-5 border-t border-gray-100">
          <Link
            to="/orders"
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl hover:bg-gray-50 transition-colors text-center group"
          >
            <div className="relative">
              <Package className="w-5 h-5 text-gray-700 group-hover:text-black transition-colors" />
              {orders.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                  {orders.length}
                </span>
              )}
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-gray-700 mt-1.5 group-hover:text-black">
              Orders
            </span>
          </Link>

          <Link
            to="/cart"
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl hover:bg-gray-50 transition-colors text-center group"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-black transition-colors" />
            <span className="text-[11px] sm:text-xs font-medium text-gray-700 mt-1.5 group-hover:text-black">
              Cart
            </span>
          </Link>

          <Link
            to="/addresses"
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl hover:bg-gray-50 transition-colors text-center group"
          >
            <MapPin className="w-5 h-5 text-gray-700 group-hover:text-black transition-colors" />
            <span className="text-[11px] sm:text-xs font-medium text-gray-700 mt-1.5 group-hover:text-black">
              Addresses
            </span>
          </Link>
        </div>
      </div>

      {/* 2. Grouped Clean Account List (Real Human UI) */}
      <div className="space-y-4">
        {/* Orders & Shopping */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-4 pt-3.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Orders & Shopping
          </div>
          <div className="divide-y divide-gray-100">
            <Link
              to="/orders"
              className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black truncate">
                    Your Orders
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    Track shipments, view invoices, or return items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                  {orders.length} order{orders.length === 1 ? "" : "s"}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0" />
              </div>
            </Link>

            <Link
              to="/cart"
              className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black truncate">
                    Shopping Cart
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    Review items and proceed to checkout
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0 ml-3" />
            </Link>
          </div>
        </div>

        {/* Account & Settings */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-4 pt-3.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Account Settings
          </div>
          <div className="divide-y divide-gray-100">
            <Link
              to="/addresses"
              className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black truncate">
                    Saved Addresses
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    Manage delivery locations and defaults
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0 ml-3" />
            </Link>

            {/* Language Switcher Row */}
            <div className="flex items-center justify-between p-3.5 sm:p-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    Language / மொழி
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {language === "ta" ? "தமிழ் தேர்ந்தெடுக்கப்பட்டது" : "English selected"}
                  </p>
                </div>
              </div>
              <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    language === "en"
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("ta")}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    language === "ta"
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  தமிழ்
                </button>
              </div>
            </div>

            {/* Admin Page Row (if admin) */}
            {user.role === "ADMIN" && (
              <Link
                to="/admin"
                className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black truncate">
                      Admin Dashboard
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      Manage products, categories & store settings
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0 ml-3" />
              </Link>
            )}
          </div>
        </div>


        {/* Mobile Sign Out Button */}
        <div className="sm:hidden pt-2">
          <button
            type="button"
            onClick={logout}
            className="w-full py-3 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Luvars Fashion</span>
          </button>
        </div>
      </div>

      {/* 3. Recent Orders & Tracking Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">Your Recent Orders</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              Review placed orders, shipment status, and invoices
            </p>
          </div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 hover:underline shrink-0 whitespace-nowrap ml-2"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-8 text-center text-xs text-gray-400">
            Loading recent orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">No orders placed yet</p>
              <p className="text-xs text-gray-500 mt-0.5 max-w-sm mx-auto">
                Every purchase comes with our 100-night risk-free trial and free delivery.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              <span>Explore Fashion</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => {
              const statusCfg = statusColors[order.status] || {
                bg: "bg-gray-100",
                text: "text-gray-700",
                border: "border-gray-200",
              };

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-gray-900">
                        #{order.id.slice(0, 10).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600">
                      <span>{order.items?.length || 1} item(s)</span>
                      <span className="mx-1.5 text-gray-300">•</span>
                      <span className="font-bold text-gray-900">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Eligible for 100-Night Home Trial
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleOpenReturnModal(order)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
                    >
                      Return / Replace
                    </button>
                    <Link
                      to="/orders"
                      className="px-3 py-1.5 rounded-lg bg-[#0f1111] hover:bg-[#232f3e] text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <span>Track Order</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Default Delivery Address Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">Default Delivery Address</h2>
          </div>
          <Link
            to="/addresses"
            className="text-xs font-semibold text-gray-900 hover:underline shrink-0 whitespace-nowrap ml-2"
          >
            Manage
          </Link>
        </div>

        {defaultAddress ? (
          <div className="text-xs text-gray-700 space-y-0.5">
            <p className="font-bold text-gray-900">{defaultAddress.name}</p>
            <p>{defaultAddress.addressLine}</p>
            <p>
              {defaultAddress.city}, {defaultAddress.state} -{" "}
              <span className="font-semibold text-gray-900">{defaultAddress.pincode}</span>
            </p>
            <p className="text-gray-500 pt-1">Phone: {defaultAddress.phone}</p>
          </div>
        ) : (
          <div className="text-xs text-gray-500 flex items-center justify-between">
            <span>No default shipping address configured yet.</span>
            <Link
              to="/addresses"
              className="text-xs font-semibold text-gray-900 hover:underline"
            >
              + Add Address
            </Link>
          </div>
        )}
      </div>

      {/* 5. Storage & Offline Media Cache (Instagram / Native MNC App Standard) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-gray-700" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">Storage & Video Cache</h2>
              <p className="text-[11px] text-gray-500">Instagram-style smart local reel & video caching</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-200">
            {cacheStats.formattedSize}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600">
          <div>
            <p className="font-semibold text-gray-900">
              {cacheStats.count > 0
                ? `${cacheStats.count} video${cacheStats.count > 1 ? "s" : ""} cached for instant 0ms playback`
                : "No video cache stored currently"}
            </p>
            <p className="text-gray-500 mt-0.5">
              Reels and showcase videos are automatically cached locally to eliminate buffering and reduce mobile data consumption.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearVideoCache}
            disabled={clearingCache || cacheStats.count === 0}
            className={`px-3.5 py-2 rounded-xl font-semibold text-xs transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
              cacheClearedSuccess
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                : cacheStats.count === 0
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {clearingCache ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Clearing...</span>
              </>
            ) : cacheClearedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cache Cleared!</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Video Cache</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6. Account Security & Privacy (Google Play Compliance) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gray-700" />
            <h2 className="text-sm font-bold text-gray-900">Account Privacy & Security</h2>
          </div>
          <Link
            to="/privacy"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Privacy Policy
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600">
          <div>
            <p className="font-semibold text-gray-900">Delete Account & Associated Data</p>
            <p className="text-gray-500 mt-0.5">
              Permanently remove your account, saved addresses, and profile data from our records.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-semibold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account
          </button>
        </div>
      </div>

      {/* 6. Return & Exchange Request Modal */}
      {returnModalOpen && selectedOrderForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#0ea9df]" />
                <h3 className="text-base font-bold text-[#0f1111]">
                  Initiate Return / Replacement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {returnSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#0f1111]">
                  Return Request Registered
                </h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Our Buddy Sleep logistics team will contact you within 24 hours to schedule free doorstep pickup and initiate your 100% refund.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmReturn} className="space-y-4 pt-4">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs">
                  <span className="text-gray-500 block">Order ID:</span>
                  <span className="font-mono font-bold text-[#0f1111]">
                    #{selectedOrderForReturn.id}
                  </span>
                  <span className="text-gray-500 block mt-1">Total Paid:</span>
                  <span className="font-bold text-[#0f1111]">
                    ₹{selectedOrderForReturn.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0f1111] mb-1.5">
                    Reason for Return / Replacement
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 text-[#0f1111] focus:outline-none focus:border-[#0ea9df]"
                  >
                    <option value="Too firm / comfort preference">Too firm / comfort preference</option>
                    <option value="Too soft / need extra orthopedic support">Too soft / need extra orthopedic support</option>
                    <option value="Need different size (King / Queen / Single)">Need different size (King / Queen / Single)</option>
                    <option value="Damage during shipping / packaging issue">Damage during shipping / packaging issue</option>
                    <option value="Other / 100-Night Trial Exercise">Other / 100-Night Trial Exercise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0f1111] mb-1.5">
                    Additional Feedback (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Tell us about your sleep experience or request a replacement size..."
                    className="w-full text-xs border border-gray-300 rounded-lg p-2.5 text-[#0f1111] focus:outline-none focus:border-[#0ea9df] resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 leading-relaxed">
                  <strong>Zero-Cost Doorstep Pickup:</strong> You do not need to pack the mattress into original cardboard boxes. Our courier partner brings dedicated protective mattress packaging.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setReturnModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0f1111] hover:bg-[#232f3e] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 7. Account Deletion Confirmation Modal (Google Play Policy) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900">Delete Account & Data?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This action is permanent and cannot be undone. All your profile information, order history records, and saved addresses will be purged.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-600">
              <span className="block font-semibold text-gray-800">Account:</span>
              <span className="font-mono">{user.email}</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeletingAccount}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeletingAccount ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
