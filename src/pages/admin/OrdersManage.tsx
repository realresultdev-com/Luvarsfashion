import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { orderService } from "../../services/order.service";
import Loader from "../../components/common/Loader";
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Navigation,
  MapPin,
  XCircle,
  ShoppingBag,
  Search,
  RefreshCw,
  Check,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  User,
  CreditCard,
  Calendar,
  AlertCircle,
  Table as TableIcon,
  Layers,
} from "lucide-react";

export interface OrderItem {
  id?: string;
  name?: string;
  productId: string;
  quantity: number;
  price: number;
  image?: string | null;
  images?: string[];
}

export interface AdminOrder {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentId?: string;
  razorpayOrderId?: string;
  items?: OrderItem[];
}

// Order fulfillment lifecycle stages
export const FULFILLMENT_STEPS = [
  { id: "PAID", label: "Paid", icon: Clock, color: "blue" },
  { id: "PACKING", label: "Packing", icon: Package, color: "amber" },
  { id: "DISPATCHED", label: "Dispatched", icon: Truck, color: "indigo" },
  { id: "ON_THE_WAY", label: "On the Way", icon: Navigation, color: "purple" },
  { id: "ARRIVING_TODAY", label: "Out for Delivery", icon: MapPin, color: "sky" },
  { id: "DELIVERED", label: "Delivered", icon: CheckCircle2, color: "emerald" },
];

export const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  PENDING: { label: "Payment Pending", bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", icon: Clock },
  PAID: { label: "Paid", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Clock },
  PACKING: { label: "Packing", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300", icon: Package },
  DISPATCHED: { label: "Dispatched", bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-300", icon: Truck },
  SHIPPED: { label: "Dispatched", bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-300", icon: Truck },
  ON_THE_WAY: { label: "On the Way", bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-300", icon: Navigation },
  ARRIVING_TODAY: { label: "Out for Delivery", bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-300", icon: MapPin },
  DELIVERED: { label: "Delivered", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle },
};

export default function OrdersManage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedOrderId = searchParams.get("orderId");

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<{ id: string; msg: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters & Views for List Mode
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const loadOrders = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await orderService.allOrders();
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.orders) ? res.data.orders : []);
      setOrders(list);
    } catch (err) {
      console.error("Failed to load all orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      const statusName = STATUS_CONFIG[newStatus]?.label || newStatus;
      setSuccessToast({
        id: orderId,
        msg: `Order status updated to "${statusName}" successfully!`,
      });

      setTimeout(() => {
        setSuccessToast(null);
      }, 3500);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const copyOrderId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find currently selected order for the update screen
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Open status update page
  const openStatusUpdatePage = (orderId: string) => {
    setSearchParams({ orderId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Close status update page / back to all orders
  const closeStatusUpdatePage = () => {
    setSearchParams({});
  };

  // Status index for fulfillment pipeline
  const getStepIndex = (status: string): number => {
    if (status === "SHIPPED") status = "DISPATCHED";
    if (status === "PENDING") return 0;
    const idx = FULFILLMENT_STEPS.findIndex((s) => s.id === status);
    return idx === -1 ? 0 : idx;
  };

  // Counts by status
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: Array.isArray(orders) ? orders.length : 0 };
    if (Array.isArray(orders)) {
      orders.forEach((o) => {
        let st = o.status;
        if (st === "SHIPPED") st = "DISPATCHED";
        c[st] = (c[st] || 0) + 1;
      });
    }
    return c;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((o) => {
      let st = o.status;
      if (st === "SHIPPED") st = "DISPATCHED";
      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "PAID"
          ? st === "PAID" || st === "PENDING"
          : st === statusFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.userName || "").toLowerCase().includes(q) ||
        (o.userEmail || "").toLowerCase().includes(q) ||
        o.items?.some((it) => (it.name || "").toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  if (loading) return <Loader text="Loading customer orders..." />;

  // =========================================================================
  // VIEW 2: DEDICATED ORDER STATUS UPDATE PAGE
  // =========================================================================
  if (selectedOrder) {
    const currentStatus = selectedOrder.status === "SHIPPED" ? "DISPATCHED" : selectedOrder.status;
    const statusMeta = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;
    const currentStepIdx = getStepIndex(currentStatus);
    const isCancelled = currentStatus === "CANCELLED";
    const isUpdating = updatingId === selectedOrder.id;

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <button
            type="button"
            onClick={closeStatusUpdatePage}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-[#191142] shadow-2xs transition-colors cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadOrders(false)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh Order</span>
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {successToast && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast.msg}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-700 hover:text-emerald-900 text-sm px-1 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Order Identification Banner Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Order ID:
                </span>
                <span className="font-mono font-black text-base text-[#191142]">
                  #{selectedOrder.id}
                </span>
                <button
                  type="button"
                  onClick={() => copyOrderId(selectedOrder.id)}
                  className="p-1 text-gray-400 hover:text-[#0ea9df] rounded transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedId === selectedOrder.id && (
                  <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                    Copied!
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Placed on{" "}
                {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border} shadow-2xs`}
              >
                <statusMeta.icon className="w-4 h-4" />
                <span>{statusMeta.label}</span>
              </span>

              <div className="text-right pl-3 border-l border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Amount</span>
                <span className="text-xl font-black text-[#191142]">
                  ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Current Status Callout */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${statusMeta.bg} ${statusMeta.border}`}>
            <div className="flex items-center gap-2.5">
              <span className={`p-1.5 rounded-lg bg-white/80 ${statusMeta.text}`}>
                <statusMeta.icon className="w-4 h-4" />
              </span>
              <h4 className={`text-xs font-bold ${statusMeta.text}`}>
                Status: {statusMeta.label}
              </h4>
            </div>

            {isUpdating && (
              <span className="text-xs font-bold text-[#0ea9df] flex items-center gap-1.5 animate-pulse shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Updating...
              </span>
            )}
          </div>
        </div>

        {/* Status Update Control Section: Interactive Pipeline Stepper */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-[#191142] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0ea9df]" />
              <span>Fulfillment Status</span>
            </h2>
          </div>

          {/* Stepper Line & Steps */}
          {!isCancelled ? (
            <div className="py-2">
              <div className="overflow-x-auto scrollbar-none py-2 -mx-1 px-1">
                <div className="relative flex items-center justify-between min-w-[500px] sm:min-w-0 sm:w-full">
                  {/* Connecting Track */}
                  <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200 -z-0 rounded-full">
                    <div
                      className="h-full bg-[#191142] transition-all duration-300 rounded-full"
                      style={{
                        width: `${(currentStepIdx / (FULFILLMENT_STEPS.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Steps */}
                  {FULFILLMENT_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const StepIcon = step.icon;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => handleStatusChange(selectedOrder.id, step.id)}
                        disabled={isUpdating}
                        className="group relative z-10 flex flex-col items-center focus:outline-none cursor-pointer"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                            isCurrent
                              ? "bg-[#191142] border-[#0ea9df] text-white ring-4 ring-[#0ea9df]/20 scale-105 shadow-sm"
                              : isCompleted
                              ? "bg-[#0ea9df] border-[#0ea9df] text-white shadow-2xs"
                              : "bg-white border-gray-300 text-gray-400 group-hover:border-gray-400 group-hover:text-gray-600"
                          }`}
                        >
                          {isCompleted && !isCurrent ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <StepIcon className="w-4 h-4" />
                          )}
                        </div>

                        <span
                          className={`text-xs font-bold mt-1.5 transition-colors ${
                            isCurrent
                              ? "text-[#191142]"
                              : isCompleted
                              ? "text-[#0ea9df]"
                              : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        >
                          {step.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-600" />
                Cancelled
              </span>
              <button
                type="button"
                onClick={() => handleStatusChange(selectedOrder.id, "PAID")}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Re-activate Order
              </button>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="pt-3 border-t border-gray-100 space-y-2.5">
            <span className="text-xs font-bold text-gray-500 block">
              Quick Actions:
            </span>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleStatusChange(selectedOrder.id, "PAID")}
                disabled={isUpdating || currentStatus === "PAID"}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  currentStatus === "PAID"
                    ? "bg-blue-100 text-blue-900 border border-blue-300"
                    : "bg-white hover:bg-blue-50 text-gray-700 border border-gray-200 hover:border-blue-300"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Mark Paid / Placed</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(selectedOrder.id, "PACKING")}
                disabled={isUpdating || currentStatus === "PACKING"}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  currentStatus === "PACKING"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-white hover:bg-amber-50 text-gray-700 border border-gray-200 hover:border-amber-300"
                }`}
              >
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span>Mark Packing</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(selectedOrder.id, "DISPATCHED")}
                disabled={isUpdating || currentStatus === "DISPATCHED"}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  currentStatus === "DISPATCHED"
                    ? "bg-indigo-100 text-indigo-900 border border-indigo-300"
                    : "bg-white hover:bg-indigo-50 text-gray-700 border border-gray-200 hover:border-indigo-300"
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mark Dispatched</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(selectedOrder.id, "ON_THE_WAY")}
                disabled={isUpdating || currentStatus === "ON_THE_WAY"}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  currentStatus === "ON_THE_WAY"
                    ? "bg-purple-100 text-purple-900 border border-purple-300"
                    : "bg-white hover:bg-purple-50 text-gray-700 border border-gray-200 hover:border-purple-300"
                }`}
              >
                <Navigation className="w-3.5 h-3.5 text-purple-600" />
                <span>Mark On the Way</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(selectedOrder.id, "ARRIVING_TODAY")}
                disabled={isUpdating || currentStatus === "ARRIVING_TODAY"}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  currentStatus === "ARRIVING_TODAY"
                    ? "bg-sky-100 text-sky-900 border border-sky-300"
                    : "bg-white hover:bg-sky-50 text-gray-700 border border-gray-200 hover:border-sky-300"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>Mark Arriving Today</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(selectedOrder.id, "DELIVERED")}
                disabled={isUpdating || currentStatus === "DELIVERED"}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  currentStatus === "DELIVERED"
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-white hover:bg-emerald-50 text-gray-700 border border-gray-200 hover:border-emerald-300"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark Delivered</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(selectedOrder.id, "CANCELLED")}
                disabled={isUpdating || currentStatus === "CANCELLED"}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  currentStatus === "CANCELLED"
                    ? "bg-red-100 text-red-900 border border-red-300"
                    : "bg-white hover:bg-red-50 text-gray-700 border border-gray-200 hover:border-red-300"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Cancel Order</span>
              </button>

              {/* Dropdown for custom status */}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[11px] text-gray-400 font-semibold">Manual Select:</span>
                <select
                  value={selectedOrder.status}
                  disabled={isUpdating}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#0ea9df] cursor-pointer shadow-2xs"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="PACKING">PACKING</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="ON_THE_WAY">ON_THE_WAY</option>
                  <option value="ARRIVING_TODAY">ARRIVING_TODAY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Purchased Items & Buyer Information */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Ordered Items List */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#191142] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#0ea9df]" />
                <span>Ordered Items ({selectedOrder.items?.length || 0})</span>
              </h3>
              <span className="text-xs font-semibold text-gray-500">
                Total Qty: {selectedOrder.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1}
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#191142] truncate">
                          {item.name || `Product #${item.productId.slice(0, 10)}`}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Qty: <span className="font-semibold text-gray-800">{item.quantity}</span> × ₹{(item.price || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-[#191142]">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">No item records found.</p>
              )}
            </div>

            {/* Price Summary */}
            <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping &amp; Delivery</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST &amp; Taxes</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between font-black text-[#191142] text-sm pt-2 border-t border-gray-100">
                <span>Total Paid</span>
                <span>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Customer & Payment Metadata */}
          <div className="lg:col-span-5 space-y-6">
            {/* Customer Information Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3.5">
              <h3 className="text-sm font-bold text-[#191142] flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <User className="w-4 h-4 text-[#0ea9df]" />
                <span>Customer Profile</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Customer Name</span>
                  <p className="font-bold text-gray-900">{selectedOrder.userName || "Customer"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Email Address</span>
                  <a
                    href={`mailto:${selectedOrder.userEmail}`}
                    className="font-semibold text-[#0ea9df] hover:underline"
                  >
                    {selectedOrder.userEmail}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Account ID</span>
                  <p className="font-mono text-[11px] text-gray-500">{selectedOrder.userId}</p>
                </div>
              </div>
            </div>

            {/* Payment & Security Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3.5">
              <h3 className="text-sm font-bold text-[#191142] flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment &amp; Transaction</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Payment Gateway</span>
                  <p className="font-bold text-gray-900">Razorpay Secure Checkout</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Payment Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-green-600" /> Verified &amp; Paid
                  </span>
                </div>
                {selectedOrder.paymentId && (
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Transaction / Payment ID</span>
                    <p className="font-mono text-[11px] text-gray-700 break-all">{selectedOrder.paymentId}</p>
                  </div>
                )}
                {selectedOrder.razorpayOrderId && (
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Gateway Order ID</span>
                    <p className="font-mono text-[11px] text-gray-700 break-all">{selectedOrder.razorpayOrderId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: ALL ORDERS FIRST (Clean, Scannable Ledger)
  // =========================================================================
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#191142] tracking-tight flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6 text-[#0ea9df]" />
              <span>Orders</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#191142] text-white">
              {orders.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-[#191142] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#191142] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadOrders(false)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Filter Cards / Tabs */}
      <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-2 overflow-x-auto scrollbar-none pb-1.5 sm:pb-0 -mx-1 px-1">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`shrink-0 w-28 sm:w-auto p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === "ALL"
              ? "border-[#191142] bg-[#191142] text-white shadow-sm"
              : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          }`}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">All Orders</div>
          <div className="text-lg font-extrabold mt-0.5">{counts.ALL || 0}</div>
        </button>

        {FULFILLMENT_STEPS.map((step) => {
          const count = counts[step.id] || 0;
          const isSelected = statusFilter === step.id;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setStatusFilter(step.id)}
              className={`shrink-0 w-28 sm:w-auto p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-[#0ea9df] bg-[#0ea9df] text-white shadow-sm"
                  : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 truncate">
                  {step.label}
                </span>
                <Icon className="w-3 h-3 opacity-70 shrink-0" />
              </div>
              <div className="text-lg font-extrabold mt-0.5">{count}</div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setStatusFilter("CANCELLED")}
          className={`shrink-0 w-28 sm:w-auto p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === "CANCELLED"
              ? "border-red-600 bg-red-600 text-white shadow-sm"
              : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Cancelled</span>
            <XCircle className="w-3 h-3 opacity-70 shrink-0" />
          </div>
          <div className="text-lg font-extrabold mt-0.5">{counts.CANCELLED || 0}</div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
        <Search className="w-4 h-4 text-gray-400 shrink-0 ml-1.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order ID, Buyer name, email, or item name..."
          className="flex-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 cursor-pointer font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-300" />
          <p className="text-base font-bold text-gray-800">No orders match the current filter</p>
          <p className="text-xs text-gray-500">
            {searchQuery || statusFilter !== "ALL"
              ? "Try resetting filters or search terms."
              : "No customer orders have been placed yet."}
          </p>
          {(searchQuery || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setSearchQuery("");
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#191142] text-white text-xs font-bold hover:bg-[#0ea9df] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "cards" ? (
        /* CLEAN ORDERS CARDS LIST */
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const currentStatus = order.status === "SHIPPED" ? "DISPATCHED" : order.status;
            const statusMeta = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;
            const totalItemsCount = order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1;

            return (
              <div
                key={order.id}
                onClick={() => openStatusUpdatePage(order.id)}
                className="bg-white border border-gray-200 hover:border-[#0ea9df] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  {/* Left: ID, Customer, Date */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-[#191142] group-hover:text-[#0ea9df] transition-colors">
                        #{order.id.slice(0, 18)}...
                      </span>

                      <button
                        type="button"
                        onClick={(e) => copyOrderId(order.id, e)}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                        title="Copy full Order ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                      >
                        <statusMeta.icon className="w-3 h-3" />
                        <span>{statusMeta.label}</span>
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="font-bold text-gray-900">{order.userName || "Customer"}</span>
                      <span>•</span>
                      <span>{order.userEmail}</span>
                      <span>•</span>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amount & Direct Action Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <div className="text-base sm:text-lg font-black text-[#191142]">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        {totalItemsCount} Item{totalItemsCount > 1 ? "s" : ""}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openStatusUpdatePage(order.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#191142] group-hover:bg-[#0ea9df] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <span>Update Status</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items Summary Row */}
                {order.items && order.items.length > 0 && (
                  <div className="pt-2.5 flex items-center justify-between gap-2 flex-wrap text-xs text-gray-600">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-gray-400">Items:</span>
                      {order.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-gray-50 border border-gray-200/80 text-[11px] font-medium text-gray-700"
                        >
                          {item.name || `Item #${item.productId.slice(0, 8)}`} (×{item.quantity})
                        </span>
                      ))}
                    </div>

                    <span className="text-[11px] text-[#0ea9df] font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Click to manage fulfillment &rarr;
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-gray-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3.5">Order / Buyer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Placed On</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filteredOrders.map((order) => {
                  const currentStatus = order.status === "SHIPPED" ? "DISPATCHED" : order.status;
                  const statusMeta = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => openStatusUpdatePage(order.id)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5">
                        <p className="font-mono font-bold text-[#191142]">
                          #{order.id.slice(0, 16)}...
                        </p>
                        <p className="font-bold text-gray-900 mt-0.5">
                          {order.userName || "Customer"}
                        </p>
                        <p className="text-[11px] text-gray-400">{order.userEmail}</p>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5 max-w-[220px]">
                          {order.items?.map((item, i) => (
                            <div key={i} className="text-gray-700 truncate text-[11px]">
                              • <span className="font-medium">{item.name || item.productId.slice(0, 8)}</span> (×{item.quantity})
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 font-black text-[#191142] text-sm">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </td>

                      <td className="p-3.5 text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                        >
                          <statusMeta.icon className="w-3 h-3" />
                          <span>{statusMeta.label}</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openStatusUpdatePage(order.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#191142] hover:bg-[#0ea9df] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
