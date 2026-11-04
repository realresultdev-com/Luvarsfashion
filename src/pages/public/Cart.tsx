import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { CheckCircle2, Trash2 } from "lucide-react";
import { getProductUrl } from "../../utils/urlSecurity";

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount, totalCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-8 sm:p-10 rounded-2xl text-center space-y-4 max-w-md mx-auto my-12 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold text-[#191142]">
          Your cart is empty
        </h2>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#191142] hover:bg-[#0ea9df] text-white text-xs font-semibold transition-all"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-28 lg:pb-12">
      {/* Left items column (8 cols) */}
      <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#191142]">Shopping Cart</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalCount} item{totalCount === 1 ? "" : "s"} selected
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Price</span>
        </div>

        {/* Items list */}
        <div className="divide-y divide-gray-100">
          {items.map((item) => {
            const cleanName =
              item.color && item.name.includes(`(${item.color})`)
                ? item.name.replace(`(${item.color})`, "").trim()
                : item.name;

            return (
              <div key={`${item.productId}-${item.color || "default"}`} className="py-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex gap-3 items-start flex-1 min-w-0">
                  {/* Product Thumbnail */}
                  <Link
                    to={getProductUrl(item.productId)}
                    className="w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 border border-gray-100 rounded-xl shrink-0 p-1.5 flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={item.image || "/logo-transparent.png"}
                      alt={cleanName}
                      className="max-h-full max-w-full object-contain"
                    />
                  </Link>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={getProductUrl(item.productId)}
                      className="text-xs sm:text-sm font-bold text-[#191142] hover:text-[#0ea9df] line-clamp-2 transition-colors leading-snug"
                    >
                      {cleanName}
                    </Link>

                    {item.color && (
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold text-gray-800 bg-gray-100 border border-gray-200/90 px-2 py-0.5 rounded-md">
                          {item.color}
                        </span>
                      </div>
                    )}

                  <p className="text-xs font-semibold text-emerald-700 mt-1">In stock</p>
                  <p className="text-[11px] text-gray-500">
                    100-Night Sleep Trial & Free Doorstep Delivery
                  </p>

                  {/* Price on mobile screen */}
                  <div className="sm:hidden mt-2">
                    <span className="text-sm font-bold text-[#191142]">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-gray-400 ml-1.5">
                        (₹{item.price.toLocaleString("en-IN")} each)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions row: Qty select, Delete */}
              <div className="flex sm:flex-col justify-between sm:justify-between items-center sm:items-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                {/* Price on desktop */}
                <div className="hidden sm:block text-right">
                  <span className="text-base sm:text-lg font-bold text-[#191142]">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 border border-gray-300 rounded-lg bg-gray-50 px-2 py-1">
                    <label htmlFor={`qty-${item.productId}-${item.color || ""}`} className="text-[11px] text-gray-500 font-medium">
                      Qty:
                    </label>
                    <select
                      id={`qty-${item.productId}-${item.color || ""}`}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, Number(e.target.value), item.color)}
                      className="bg-transparent text-xs font-bold text-[#191142] focus:outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId, item.color)}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>

        {/* Subtotal bottom bar */}
        <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
          <button
            onClick={clearCart}
            className="text-xs text-gray-500 hover:text-red-600 hover:underline cursor-pointer"
          >
            Clear Cart
          </button>
          <span className="text-sm sm:text-base text-gray-700 font-medium">
            Subtotal ({totalCount} item{totalCount === 1 ? "" : "s"}):{" "}
            <span className="font-extrabold text-[#191142] text-base sm:text-lg">
              ₹{totalAmount.toLocaleString("en-IN")}
            </span>
          </span>
        </div>
      </div>

      {/* Right Column: Checkout Summary Box on Desktop (4 cols) */}
      <div className="hidden lg:block lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-4 sticky top-24">
        {/* Clean Human Delivery Status */}
        <div className="flex items-start gap-2 text-xs text-gray-600 pb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Your order qualifies for <strong className="text-emerald-700 font-semibold">FREE Delivery</strong> and 100-Night Trial.
          </span>
        </div>

        <div className="text-sm text-gray-700 space-y-1.5 pt-2 border-t border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-500">Items Subtotal</span>
            <span className="font-semibold text-gray-900">₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Delivery</span>
            <span className="font-semibold text-emerald-700">FREE</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-2.5 mt-2">
            <span>Total</span>
            <span>₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <Link
          to="/checkout"
          className="block w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-center font-semibold text-xs text-white shadow-2xs transition-colors cursor-pointer"
        >
          Proceed to Buy ({totalCount} {totalCount === 1 ? "item" : "items"})
        </Link>
      </div>
    </div>
  );
}
