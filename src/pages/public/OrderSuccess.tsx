import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="bg-white border border-gray-300 rounded-lg p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-8 h-8 text-[#007600] shrink-0 mt-0.5" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#007600]">
              Order placed, thank you!
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Confirmation will be sent to your registered email address.
            </p>
          </div>
        </div>

        {orderId && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs">
            <span className="text-gray-500 font-medium">Order Reference: </span>
            <span className="font-mono font-bold text-gray-900">{orderId}</span>
          </div>
        )}

        <div className="space-y-1 text-xs text-gray-700">
          <p className="font-bold">Guaranteed Delivery within 2 to 4 Business Days</p>
          <p className="text-gray-500">Shipped with Buddy Express Insured Doorstep Delivery</p>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="py-2 px-5 rounded-full bg-amazon-btnYellow hover:bg-amazon-btnYellowHover border border-[#a88734] font-medium text-xs text-gray-900 shadow-sm"
          >
            Review or edit your order
          </Link>
          <Link
            to="/"
            className="py-2 px-5 rounded-full border border-gray-300 hover:bg-gray-50 font-medium text-xs text-gray-900 shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
