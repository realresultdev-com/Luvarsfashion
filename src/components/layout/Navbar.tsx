import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";
import { categoryService } from "../../services/category.service";
import { getCategoryUrl } from "../../utils/urlSecurity";
import type { Category } from "../../types/product.types";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  User,
  LogIn,
  Check,
  Globe,
  MapPin,
  LayoutGrid,
  Bell,
} from "lucide-react";
import SearchBar from "./SearchBar";
import LuvarsLogo from "../common/LuvarsLogo";
import { formatCategoryName } from "../../utils/fashionMapping";
import NotificationCenterModal from "../common/NotificationCenterModal";
import { notificationService } from "../../services/notification.service";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  const refreshUnreadCount = async () => {
    if (user?.role === "ADMIN") {
      try {
        const data = await notificationService.getNotifications();
        setUnreadNotifs(data.unreadCount);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    refreshUnreadCount();
    const unsub = notificationService.subscribe(() => {
      setUnreadNotifs((prev) => prev + 1);
    });
    return unsub;
  }, [user]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => {
        if (Array.isArray(res?.data)) setCategories(res.data);
      })
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    setAccountDropdown(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="w-full select-none sticky top-0 z-50 shadow-md bg-gradient-to-b from-[#0b1728] via-[#0f172a] to-[#0f172a] pt-[env(safe-area-inset-top,0px)]">
      {/* 1. Main Header Bar (Amazon App Style Midnight Navy Theme) */}
      <div className="border-b border-slate-800/80 px-3 sm:px-6 py-2 flex items-center justify-between gap-2.5 sm:gap-6 min-h-[56px] md:h-[66px]">
        {/* Left: Mobile Hamburger & Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-800 text-slate-100 transition-colors cursor-pointer active:scale-95"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-100" /> : <Menu className="w-5 h-5 text-slate-100" />}
          </button>

          <Link to="/" className="flex items-center p-0.5 rounded-lg hover:opacity-90 transition-opacity shrink-0">
            <LuvarsLogo />
          </Link>
        </div>

        {/* Desktop Search Bar (Expands dynamically based on screen size) */}
        <div className="hidden md:flex flex-1 max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-2 sm:mx-6">
          <SearchBar />
        </div>

        {/* Right Action Icons: (Notification Bell -> User Profile -> Language -> Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Admin Order Push Notification Bell */}
          {user?.role === "ADMIN" && (
            <button
              type="button"
              onClick={() => setNotifModalOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-xl text-slate-200 hover:text-amber-400 hover:bg-slate-800/60 transition-colors"
              title="Order Push Notifications"
              aria-label="Order notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-bold text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {unreadNotifs > 9 ? "9+" : unreadNotifs}
                </span>
              )}
            </button>
          )}

          {/* 1. User Profile / Sign In (Visible on both mobile & desktop) */}
          {!user ? (
            <Link
              to="/login"
              className="flex items-center gap-1 h-8 sm:h-9 px-2 hover:text-[#38bdf8] text-slate-100 text-xs font-semibold transition-colors shrink-0 rounded-lg hover:bg-slate-800/50"
            >
              <User className="w-4 h-4 text-[#38bdf8]" />
              <span className="hidden sm:inline">{t("signIn")}</span>
            </Link>
          ) : (
            <div
              className="relative shrink-0"
              onMouseEnter={() => setAccountDropdown(true)}
              onMouseLeave={() => setAccountDropdown(false)}
            >
              <button
                type="button"
                onClick={() => setAccountDropdown((prev) => !prev)}
                className="flex items-center gap-1.5 h-8 sm:h-9 px-1.5 sm:px-2 text-xs font-semibold text-slate-100 hover:text-[#38bdf8] transition-colors cursor-pointer rounded-lg hover:bg-slate-800/50"
                aria-label="User profile"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.email}
                    className="w-6 h-6 sm:w-7 sm:h-7 object-cover shrink-0 rounded-full border border-[#38bdf8]/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-[#38bdf8] border border-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline-block max-w-[90px] lg:max-w-[120px] truncate capitalize font-semibold">
                  {user.name || user.email.split("@")[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </button>

              {accountDropdown && (
                <div className="absolute right-0 top-full pt-1 z-50 w-52 animate-in fade-in-50 duration-75">
                  <div className="bg-slate-900 text-slate-100 rounded-md shadow-xl border border-slate-700 py-1.5 text-xs">
                    {/* User Header */}
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white truncate capitalize">
                        {user.name || user.email.split("@")[0]}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate" title={user.email}>
                        {user.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <Link
                      to="/profile"
                      onClick={() => setAccountDropdown(false)}
                      className="block px-3 py-1.5 text-slate-200 hover:bg-slate-800 hover:text-[#38bdf8] font-medium transition-colors"
                    >
                      {t("yourProfile")}
                    </Link>

                    {user?.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        onClick={() => setAccountDropdown(false)}
                        className="block px-3 py-1.5 text-[#38bdf8] font-bold hover:bg-slate-800 transition-colors"
                      >
                        {t("sellerCentral")}
                      </Link>
                    )}

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-1.5 text-rose-400 hover:bg-rose-950/40 font-medium transition-colors cursor-pointer"
                      >
                        {t("signOut")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Language Switcher (Desktop) */}
          <div
            className="relative hidden sm:flex items-center gap-1.5 h-9 px-2 cursor-pointer transition-colors text-xs font-semibold text-slate-100 hover:text-[#38bdf8] shrink-0"
            onMouseEnter={() => setLangDropdown(true)}
            onMouseLeave={() => setLangDropdown(false)}
          >
            <Globe className="w-4 h-4 text-[#38bdf8]" />
            <span>{language === "ta" ? "தமிழ்" : "EN"}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />

            {langDropdown && (
              <div className="absolute top-full right-0 pt-1 z-50 w-40 animate-in fade-in-50 duration-75">
                <div className="bg-slate-900 text-slate-100 rounded-md shadow-xl border border-slate-700 py-1 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                    {t("selectLanguage")}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage("en");
                      setLangDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors text-left cursor-pointer ${
                      language === "en" ? "text-[#38bdf8] bg-slate-800/80 font-bold" : "text-slate-200"
                    }`}
                  >
                    <span>English - EN</span>
                    {language === "en" && <Check className="w-3.5 h-3.5 text-[#38bdf8]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage("ta");
                      setLangDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors text-left cursor-pointer ${
                      language === "ta" ? "text-[#38bdf8] bg-slate-800/80 font-bold" : "text-slate-200"
                    }`}
                  >
                    <span>தமிழ் - TA</span>
                    {language === "ta" && <Check className="w-3.5 h-3.5 text-[#38bdf8]" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Shopping Cart Anchor Link */}
          <Link
            to="/cart"
            className="flex items-center justify-center h-8 sm:h-9 px-2 sm:px-2.5 text-slate-100 hover:text-[#38bdf8] transition-colors shrink-0 group cursor-pointer rounded-lg hover:bg-slate-800/50"
            aria-label="Shopping Cart"
          >
            <div className="relative flex items-center">
              <ShoppingCart className="w-5 h-5 text-slate-100 group-hover:text-[#38bdf8] transition-colors" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#0ea9df] text-white font-extrabold text-[10px] min-w-[17px] h-4 rounded-full flex items-center justify-center px-1 leading-none shadow-sm">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* 2. Dedicated Full-Width Search Bar for Mobile Viewports (< md) */}
      <div className="md:hidden px-3 py-2 bg-[#0f172a] border-b border-slate-800/80 w-full max-w-full">
        <SearchBar isMobile onSearchComplete={() => setMobileMenuOpen(false)} />
      </div>

      {/* 3. Subnav Bar (Amazon App Style Pill Categories Row) */}
      <div className="bg-[#0b1322] border-b border-slate-800/60 px-3 sm:px-6 py-1.5 flex items-center text-xs text-slate-200 overflow-x-auto scrollbar-none h-[42px] w-full max-w-full">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 font-medium text-xs">
          <Link
            to="/shop"
            className={`py-1 px-3.5 rounded-full transition-all whitespace-nowrap text-xs font-semibold ${
              location.pathname === "/shop" && !location.search
                ? "bg-[#0ea9df] text-white shadow-xs"
                : "bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 border border-slate-700/50"
            }`}
          >
            All
          </Link>
          {Array.isArray(categories) && categories.map((cat) => {
            const catUrl = getCategoryUrl(cat.id);
            const isActive = location.pathname === catUrl;
            return (
              <Link
                key={cat.id}
                to={catUrl}
                className={`py-1 px-3.5 rounded-full transition-all whitespace-nowrap text-xs font-medium ${
                  isActive
                    ? "bg-[#0ea9df] text-white font-semibold shadow-xs"
                    : "bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 border border-slate-700/50"
                }`}
              >
                {formatCategoryName(cat.name)}
              </Link>
            );
          })}
          <Link
            to="/about"
            className={`py-1 px-3.5 rounded-full transition-all whitespace-nowrap text-xs font-medium ${
              location.pathname === "/about"
                ? "bg-[#0ea9df] text-white font-semibold shadow-xs"
                : "bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 border border-slate-700/50"
            }`}
          >
            About Us
          </Link>
        </div>
      </div>

      {/* 4. Enhanced Mobile Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu Content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#0f172a] text-slate-100 z-50 shadow-2xl flex flex-col justify-between overflow-y-auto border-r border-slate-800">
            <div className="p-5 space-y-4">
              {/* Top Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <LuvarsLogo isWhite={true} />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Greeting Box */}
              {user ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-full bg-slate-900 text-[#38bdf8] border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || user.email}
                        className="w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      user.email.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate capitalize">
                      {user.name || user.email.split("@")[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate" title={user.email}>
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-200">Welcome to Luvars Fashion</p>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 px-4 rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold shadow-xs"
                  >
                    {t("signIn")}
                  </Link>
                </div>
              )}

              {/* Quick Language Toggle in Mobile Drawer */}
              <div className="flex items-center justify-between py-2 px-2 rounded-lg bg-slate-800/60 border border-slate-700 text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#38bdf8]" /> Language:
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                      language === "en" ? "bg-[#0ea5e9] text-white" : "bg-slate-700 text-slate-300 border border-slate-600"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("ta")}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
                      language === "ta" ? "bg-[#0ea5e9] text-white" : "bg-slate-700 text-slate-300 border border-slate-600"
                    }`}
                  >
                    தமிழ்
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 text-xs font-semibold text-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                  Navigation
                </p>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-2 rounded-lg hover:bg-slate-800 hover:text-[#38bdf8]"
                >
                  Home
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-2 rounded-lg hover:bg-slate-800 hover:text-[#38bdf8] font-bold text-[#38bdf8]"
                >
                  Shop All Products
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-2 rounded-lg hover:bg-slate-800 hover:text-[#38bdf8]"
                >
                  About Luvars Fashion
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-800 hover:text-[#38bdf8]"
                >
                  <span>{t("shoppingCart")}</span>
                  {totalCount > 0 && (
                    <span className="bg-[#0ea5e9] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {totalCount}
                    </span>
                  )}
                </Link>
                <Link
                  to={user ? "/profile" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-2 rounded-lg hover:bg-slate-800 hover:text-[#38bdf8]"
                >
                  {t("yourProfile")}
                </Link>
                <Link
                  to={user ? "/orders" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-2 rounded-lg hover:bg-slate-800 hover:text-[#38bdf8]"
                >
                  Returns & Orders
                </Link>
                <Link
                  to={user ? "/addresses" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-2 rounded-lg hover:bg-slate-800 hover:text-[#38bdf8]"
                >
                  {t("savedAddresses")}
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 px-2 rounded-lg text-[#38bdf8] font-bold hover:bg-slate-800"
                  >
                    Admin Console
                  </Link>
                )}
              </div>

              {/* Categories Section */}
              <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Categories
                </p>
                {Array.isArray(categories) && categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={getCategoryUrl(cat.id)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 px-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-[#38bdf8]"
                  >
                    {formatCategoryName(cat.name)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Logout button at bottom of drawer if logged in */}
            {user && (
              <div className="p-4 border-t border-slate-800 bg-slate-900">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-lg border border-rose-800/60 bg-rose-950/40 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 text-center cursor-pointer"
                >
                  {t("signOut")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* iOS-Style Real-time Order Notification Center Modal */}
      <NotificationCenterModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        onUpdateBadge={refreshUnreadCount}
      />
    </header>
  );
}
