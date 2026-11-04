import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  ShoppingBag,
  Users,
  Video,
  ArrowLeft,
  X,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { path: "/admin", label: "Dashboard", shortLabel: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/products", label: "Products List", shortLabel: "Products", icon: Package },
  { path: "/admin/products/new", label: "Add a Product", shortLabel: "Add Product", icon: PlusCircle },
  { path: "/admin/categories", label: "Categories", shortLabel: "Categories", icon: FolderTree },
  { path: "/admin/hero-videos", label: "Hero Videos", shortLabel: "Hero Videos", icon: Video },
  { path: "/admin/orders", label: "Manage Orders", shortLabel: "Orders", icon: ShoppingBag },
  { path: "/admin/users", label: "Users List", shortLabel: "Users", icon: Users },
];

interface AdminSidebarProps {
  onClose?: () => void;
  className?: string;
}

export default function AdminSidebar({ onClose, className = "" }: AdminSidebarProps) {
  return (
    <aside className={`w-64 shrink-0 border-r border-gray-200 bg-white p-4 flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between px-3 py-2.5 mb-6 rounded-lg bg-black text-white shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logo-white.png" alt="Luvars Fashion" className="h-5 w-auto object-contain shrink-0" />
            <span className="text-[11px] font-semibold tracking-wider uppercase border-l border-white/20 pl-2 truncate">
              Admin
            </span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-black text-white shadow-2xs"
                      : "text-gray-600 hover:bg-gray-100 hover:text-black"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>
    </aside>
  );
}

