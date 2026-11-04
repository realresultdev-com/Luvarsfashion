import { useState, useEffect } from "react";
import { orderService } from "../../services/order.service";
import type { Order } from "../../types/order.types";
import Loader from "../../components/common/Loader";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, ShieldCheck } from "lucide-react";
import { getProductUrl } from "../../utils/urlSecurity";
import { useAuth } from "../../hooks/useAuth";

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Orders");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.myOrders();
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loader text="Loading your orders..." />;

  const filteredOrders = orders
    .filter((order) => {
      if (activeTab === "Not Yet Shipped") {
        return order.status === "PAID" || order.status === "PENDING" || order.status === "PACKING";
      }
      if (activeTab === "Cancelled") {
        return order.status === "CANCELLED";
      }
      return true;
    })
    .filter((order) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(term) ||
        order.items?.some((item: any) => item.name?.toLowerCase().includes(term))
      );
    });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <Link to="/profile" className="hover:text-slate-900 transition-colors">
            Account
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Your Orders</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Orders</h1>

          {/* Search */}
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search all orders"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Admin Notice Bar */}
      {user?.role === "ADMIN" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-900">Administrator Store Management</p>
              <p className="text-[11px] text-amber-700">
                You are viewing personal customer orders. To view all customer orders and live store transactions:
              </p>
            </div>
          </div>
          <Link
            to="/admin/orders"
            className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold shrink-0 text-center transition-colors shadow-2xs"
          >
            Manage All Orders →
          </Link>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-medium text-slate-600 gap-8 overflow-x-auto scrollbar-none">
        {["Orders", "Not Yet Shipped", "Cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">
              {searchTerm ? "No matching orders found" : "No orders placed yet"}
            </h3>
            <p className="text-xs text-slate-500">
              {searchTerm
                ? "Try searching with a different order ID or keyword."
                : "When you purchase items, your order history will show up here."}
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig: Record<string, { label: string; color: string }> = {
              PAID: { label: "Order Placed", color: "bg-blue-50 text-blue-700 border-blue-200" },
              PACKING: { label: "Preparing to Ship", color: "bg-amber-50 text-amber-800 border-amber-200" },
              DISPATCHED: { label: "Shipped", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
              SHIPPED: { label: "Shipped", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
              ON_THE_WAY: { label: "In Transit", color: "bg-purple-50 text-purple-700 border-purple-200" },
              ARRIVING_TODAY: { label: "Out for Delivery", color: "bg-sky-50 text-sky-700 border-sky-200" },
              DELIVERED: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              PENDING: { label: "Payment Pending", color: "bg-slate-100 text-slate-700 border-slate-200" },
              CANCELLED: { label: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200" },
            };
            const currentStatus = statusConfig[order.status] || {
              label: order.status,
              color: "bg-slate-100 text-slate-700 border-slate-200",
            };

            return (
              <div key={order.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                {/* Header info bar */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                    <div>
                      <span className="text-[10px] uppercase font-medium text-slate-400 block">Order Placed</span>
                      <span className="font-medium text-slate-800">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-medium text-slate-400 block">Total</span>
                      <span className="font-semibold text-slate-900">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-medium text-slate-400 block">Status</span>
                      <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded border ${currentStatus.color}`}>
                        {currentStatus.label}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-medium text-slate-400 block">
                      Order #{order.id}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 sm:p-5 divide-y divide-slate-100">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.images?.[0] || "/logo-transparent.png"}
                          alt={item.name || "Product image"}
                          className="w-16 h-16 object-contain p-1 rounded border border-slate-200 bg-white shrink-0"
                        />
                        <div>
                          <Link
                            to={getProductUrl(item.productId)}
                            className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-cyan-600 transition-colors line-clamp-1"
                          >
                            {item.name || `Product #${item.productId.slice(0, 8)}`}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Link
                          to={getProductUrl(item.productId)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                        >
                          Buy Again
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
