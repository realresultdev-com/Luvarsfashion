import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { orderService } from "../../services/order.service";
import { paymentService } from "../../services/payment.service";
import { Lock, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
  });

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storageKey = `buddy_addresses_${user?.id || "guest"}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const list = JSON.parse(saved);
        const def = list.find((a: any) => a.isDefault) || list[0];
        if (def) {
          setShippingAddress({
            fullName: def.name,
            email: user?.email || "",
            phone: def.phone || "",
            street: def.addressLine,
            city: def.city,
            state: def.state,
            pincode: def.pincode,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white border border-gray-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Sign in to Checkout</h2>
        <p className="text-xs text-gray-600">Please sign in to proceed with your address and payment.</p>
        <Link
          to="/login?redirect=/checkout"
          className="inline-block py-2.5 px-6 rounded-lg bg-[#0ea9df] hover:bg-[#0c93c4] font-bold text-xs text-white shadow-sm transition-colors"
        >
          Sign in to your account
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white border border-gray-200 p-8 shadow-sm rounded-xl">
        <p className="text-gray-800 text-sm">Your cart is empty.</p>
        <Link
          to="/"
          className="inline-block py-2.5 px-6 rounded-lg bg-[#0ea9df] hover:bg-[#0c93c4] font-bold text-xs text-white shadow-sm transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // 1. Create order on Cloudflare D1 with entered mobile number and shipping address
      const orderRes = await orderService.createFromCart(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress
      );
      const order = orderRes.data;

      // 2. Create Razorpay order on edge
      const paymentOrderRes = await paymentService.createOrder(order.totalAmount);
      const razorpayOrder = paymentOrderRes.data;

      const razorpayKeyId =
        import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mockkey123";

      if (typeof window.Razorpay !== "undefined" && !razorpayKeyId.includes("mock")) {
        const options = {
          key: razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || "INR",
          name: "Buddy Mattress",
          description: `Sleep Comfort & Mattress Order #${order.id.slice(0, 8)}`,
          order_id: razorpayOrder.id,
          handler: async function (response: any) {
            try {
              await paymentService.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order.id,
              });
              clearCart();
              navigate(`/order-success?orderId=${order.id}`);
            } catch (err: any) {
              setError("Payment verification failed on server: " + (err.message || "Unknown error"));
              setProcessing(false);
            }
          },
          prefill: {
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            contact: shippingAddress.phone,
          },
          theme: {
            color: "#febd69",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Mock payment flow
        setTimeout(async () => {
          try {
            await paymentService.verify({
              razorpay_order_id: razorpayOrder.id || `order_mock_${Date.now()}`,
              razorpay_payment_id: `pay_mock_${Date.now()}`,
              razorpay_signature: "mock_signature_verified",
              orderId: order.id,
            });
            clearCart();
            navigate(`/order-success?orderId=${order.id}`);
          } catch (err: any) {
            setError(err.response?.data?.message || "Verification failed");
            setProcessing(false);
          }
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to initiate payment");
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28 lg:pb-16 px-2 sm:px-4">
      {/* Checkout Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <Link to="/" className="flex items-center">
          <img
            src="/logo-transparent.png"
            alt="Buddy Mattress"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: 3 Accordion Steps (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Step 1: Address */}
          <div className="bg-white border border-gray-200 p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#191142] flex items-center justify-between border-b border-gray-100 pb-3">
              <span>1. Delivery Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#191142] mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] border border-gray-300 rounded-xl text-xs bg-white text-[#191142] focus:border-[#0ea9df] focus:ring-2 focus:ring-[#0ea9df]/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#191142] mb-1.5">Mobile number</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] border border-gray-300 rounded-xl text-xs bg-white text-[#191142] focus:border-[#0ea9df] focus:ring-2 focus:ring-[#0ea9df]/20 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#191142] mb-1.5">Flat, House no., Building, Street</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] border border-gray-300 rounded-xl text-xs bg-white text-[#191142] focus:border-[#0ea9df] focus:ring-2 focus:ring-[#0ea9df]/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#191142] mb-1.5">Town / City</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] border border-gray-300 rounded-xl text-xs bg-white text-[#191142] focus:border-[#0ea9df] focus:ring-2 focus:ring-[#0ea9df]/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#191142] mb-1.5">Pincode</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] border border-gray-300 rounded-xl text-xs bg-white text-[#191142] focus:border-[#0ea9df] focus:ring-2 focus:ring-[#0ea9df]/20 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment */}
          <div className="bg-white border border-gray-200 p-5 sm:p-6 rounded-2xl shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#191142] border-b border-gray-100 pb-3">
              2. Payment Method
            </h2>
            <div className="border border-cyan-200 bg-cyan-50/50 p-4 rounded-xl text-xs space-y-1">
              <span className="font-bold text-[#191142] block">
                Razorpay Official Gateway (All Payment Options)
              </span>
              <p className="text-gray-600">
                Supports UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, and Wallets.
              </p>
            </div>
          </div>

          {/* Step 3: Items review */}
          <div className="bg-white border border-gray-200 p-5 sm:p-6 rounded-2xl shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#191142] border-b border-gray-100 pb-3">
              3. Review Items and Delivery
            </h2>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.productId} className="py-2.5 flex justify-between items-center text-xs">
                  <span className="text-[#191142] font-medium truncate max-w-[200px] sm:max-w-md">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-bold text-[#191142] shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary Sticky on Desktop (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-200 p-5 sm:p-6 rounded-2xl shadow-xs space-y-4 lg:sticky lg:top-24">
          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 px-4 rounded-xl bg-[#0ea9df] hover:bg-[#0c93c4] font-bold text-xs text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            {processing ? "Processing Order..." : `Place Order & Pay ₹${totalAmount.toLocaleString("en-IN")}`}
          </button>

          {/* Mandatory DPDP & Consumer Protection Act Consent */}
          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            By placing this order, you agree to Buddy Mattress's{" "}
            <Link to="/terms" target="_blank" className="text-[#0ea9df] hover:underline font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" target="_blank" className="text-[#0ea9df] hover:underline font-medium">
              Privacy Policy
            </Link>
            .
          </p>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Order Summary</h3>
            <div className="flex justify-between text-gray-600">
              <span>Items Total:</span>
              <span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-700">
              <span>Express Delivery:</span>
              <span className="font-bold">FREE</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-black text-[#191142]">
              <span>Order Total:</span>
              <span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Checkout Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div>
              <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">
                Total Payable
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-bold text-gray-600">₹</span>
                <span className="text-lg font-black text-[#191142]">
                  {totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="py-2.5 px-6 rounded-xl bg-[#0ea9df] hover:bg-[#0c93c4] text-white text-xs font-bold shadow-xs transition-all text-center shrink-0 cursor-pointer"
            >
              {processing ? "Processing..." : "Place Order & Pay"}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-1">
            By paying, you agree to our <Link to="/terms" className="underline">Terms</Link> & <Link to="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
