import { useState, useEffect } from "react";
import { adminService, DashboardStats } from "../../services/admin.service";
import Loader from "../../components/common/Loader";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  Plus,
  FolderTree,
  ArrowRight,
  TrendingUp,
  Bell,
  Send,
  Loader2,
} from "lucide-react";
import { notificationService } from "../../services/notification.service";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const handleSimulatePush = async () => {
    setSimulating(true);
    try {
      await notificationService.triggerTestOrder();
    } catch (err) {
      console.error("Failed to simulate push:", err);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: DollarSign,
      link: "/admin/orders",
      linkLabel: "View orders",
    },
    {
      title: "Orders",
      value: (stats?.orderCount || 0).toString(),
      icon: ShoppingBag,
      link: "/admin/orders",
      linkLabel: "Manage orders",
    },
    {
      title: "Products",
      value: (stats?.productCount || 0).toString(),
      icon: Package,
      link: "/admin/products",
      linkLabel: "View catalog",
    },
    {
      title: "Registered Users",
      value: (stats?.userCount || 0).toString(),
      icon: Users,
      link: "/admin/users",
      linkLabel: "Manage users",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Overview of store performance and quick access to management tools.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    {card.title}
                  </span>
                  <Icon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 hover:text-gray-900 font-medium">
                <span>{card.linkLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Real-time Order Push Notifications Center Card */}
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0">
            <Bell className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">Real-Time Order Push Notifications</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Instant Apple iOS-style push notification banner & Android device alerts when any customer places or pays for an order.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSimulatePush}
            disabled={simulating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 active:scale-95 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Simulate Customer Order Alert</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            to="/admin/products/new"
            className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-gray-400 text-xs font-semibold text-gray-900 flex items-center gap-2.5 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 text-gray-700 shrink-0" />
            <span className="truncate">Add Product</span>
          </Link>

          <Link
            to="/admin/products"
            className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-gray-400 text-xs font-semibold text-gray-900 flex items-center gap-2.5 transition-colors shadow-2xs"
          >
            <Package className="w-4 h-4 text-gray-700 shrink-0" />
            <span className="truncate">Products</span>
          </Link>

          <Link
            to="/admin/orders"
            className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-gray-400 text-xs font-semibold text-gray-900 flex items-center gap-2.5 transition-colors shadow-2xs"
          >
            <ShoppingBag className="w-4 h-4 text-gray-700 shrink-0" />
            <span className="truncate">Orders</span>
          </Link>

          <Link
            to="/admin/users"
            className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-gray-400 text-xs font-semibold text-gray-900 flex items-center gap-2.5 transition-colors shadow-2xs"
          >
            <Users className="w-4 h-4 text-gray-700 shrink-0" />
            <span className="truncate">Users</span>
          </Link>

          <Link
            to="/admin/categories"
            className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-gray-400 text-xs font-semibold text-gray-900 flex items-center gap-2.5 transition-colors shadow-2xs"
          >
            <FolderTree className="w-4 h-4 text-gray-700 shrink-0" />
            <span className="truncate">Categories</span>
          </Link>
        </div>
      </div>

      {/* Overview Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Management Summary */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-700" />
              <span>Store Overview</span>
            </h3>
            <span className="text-xs text-gray-500 font-medium">Live Stats</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-600">Active Products in Catalog</span>
              <span className="font-semibold text-gray-900">{stats?.productCount || 0}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-600">Registered Customer Accounts</span>
              <span className="font-semibold text-gray-900">{stats?.userCount || 0}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-gray-600">Completed Store Orders</span>
              <span className="font-semibold text-gray-900">{stats?.orderCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Links Summary */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-4 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
              Admin Quick Tips
            </h3>
            <p className="text-xs text-gray-600 mt-3 leading-relaxed">
              Use the sidebar or quick action buttons to manage your inventory, adjust pricing, upload product photos, or update user permissions.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <Link
              to="/admin/products/new"
              className="font-semibold text-gray-900 hover:underline flex items-center gap-1"
            >
              <span>Create new product</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/"
              className="text-gray-500 hover:text-gray-900 font-medium"
            >
              View storefront →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
