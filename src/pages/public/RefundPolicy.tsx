import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="bg-white min-h-screen text-gray-900 py-10 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Breadcrumb */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-2 border-b border-gray-200 pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Cancellation & Return Policy
          </h1>
          <p className="text-xs text-gray-500">
            Last updated: September 2026 | Effective for all customers of Luvars Fashion
          </p>
        </div>

        {/* Introduction */}
        <p className="text-sm text-gray-700 leading-relaxed">
          At <strong>Luvars Fashion</strong>, we want you to love what you wear. If you are not completely satisfied with your purchase, we offer a hassle-free <strong>15-Day Easy Return & Exchange Policy</strong>. We arrange zero-cost doorstep reverse pickup and full refund with no hidden restocking deductions.
        </p>

        {/* Policy Details */}
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">
              1. 15-Day Easy Return & Exchange Guidelines
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600">
              <li>
                <strong>Eligibility Window:</strong> You can initiate a return or size exchange within 15 days from the date of verified doorstep delivery.
              </li>
              <li>
                <strong>Garment Condition:</strong> Items must be returned in their original condition—unworn, unwashed, unaltered, with original brand tags and poly-pack packaging intact.
              </li>
              <li>
                <strong>Size Exchanges:</strong> If a t-shirt or shirt does not fit as expected, you can request an instant size replacement at zero additional shipping fee.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">
              2. How to Request a Return or Exchange
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Returning your order is quick and straightforward:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-gray-600">
              <li>
                Go to <strong>Your Orders</strong> in your account, or email us at <a href="mailto:support@luvarsfashion.com" className="text-gray-900 font-medium underline hover:text-sky-600">support@luvarsfashion.com</a> with your Order ID.
              </li>
              <li>
                Select whether you would like a refund or a replacement size.
              </li>
              <li>
                Our courier partner will pick up the package directly from your doorstep within 24 to 48 hours at zero cost to you.
              </li>
            </ol>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">
              3. Refund Processing & Timelines
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Once the return package is received and verified by our quality control team, your refund is credited back to your original payment method (Bank Account, UPI, or Credit/Debit Card) via Razorpay within 3 to 5 business days.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">
              4. Order Cancellation
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Orders can be cancelled anytime before dispatch directly from your account page or by contacting customer support. Full refunds for cancelled orders are initiated immediately.
            </p>
          </section>

          {/* Section 5: Contact */}
          <section className="space-y-2 pt-4 border-t border-gray-200">
            <h2 className="text-base font-bold text-gray-900">
              5. Customer Care
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Need assistance with an exchange or return? Email us at{" "}
              <a href="mailto:support@luvarsfashion.com" className="text-gray-900 font-medium underline hover:text-sky-600">
                support@luvarsfashion.com
              </a>{" "}
              or call <a href="tel:+919443300000" className="text-gray-900 font-medium underline hover:text-sky-600">+91 94433 00000</a> (Mon – Sat, 9:30 AM – 6:30 PM IST).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
