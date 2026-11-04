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
            Cancellation & Refund Policy
          </h1>
          <p className="text-xs text-gray-500">
            Last updated: September 2026
          </p>
        </div>

        {/* Introduction */}
        <p className="text-sm text-gray-700 leading-relaxed">
          Every Buddy Mattress comes with a genuine 100-Night Risk-Free Sleep Trial. If you are not completely satisfied with your sleep experience, we will arrange a free doorstep pickup and refund your purchase in full with no hidden restocking deductions.
        </p>

        {/* Policy Details */}
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">
              1. 100-Night Home Trial Guidelines
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600">
              <li>
                <strong>Trial Duration:</strong> The 100-night trial begins from the date of verified delivery at your shipping address.
              </li>
              <li>
                <strong>30-Night Adjustment Period:</strong> Sleep ergonomics show that your body requires 3 to 4 weeks to adjust to a new orthopedic mattress. We request that you sleep on the mattress for at least 30 nights before initiating a trial return.
              </li>
              <li>
                <strong>Condition:</strong> The mattress must be returned in clean, sanitary condition without burns, liquid stains, pet damage, cuts, or physical tears.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">
              2. How to Request a Return
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              To start a return request:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-gray-600">
              <li>
                Email us at <a href="mailto:support@buddymattress.in" className="text-gray-900 font-medium underline hover:text-sky-600">support@buddymattress.in</a> or call our customer helpline at <a href="tel:+919443300000" className="text-gray-900 font-medium underline hover:text-sky-600">+91 94433 00000</a> with your Order ID and photos of the mattress.
              </li>
              <li>
                Our team will review your request within 24 to 48 hours and coordinate a doorstep reverse pickup with our logistics partner.
              </li>
              <li>
                The courier team will inspect and package the mattress at your address at zero shipping cost to you.
              </li>
            </ol>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">
              3. Refund Processing & Timelines
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Once the return is collected and verified, your refund is initiated immediately. The amount is credited back to your original payment method (Bank Account, UPI, or Credit/Debit Card) via Razorpay within 5 to 7 business days, in accordance with standard banking procedures.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">
              4. Order Cancellation
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Orders can be cancelled before dispatch directly from your account or by contacting customer support. There are no cancellation fees for orders cancelled prior to shipping, and a full refund will be processed immediately.
            </p>
          </section>

          {/* Section 5: Contact */}
          <section className="space-y-2 pt-4 border-t border-gray-200">
            <h2 className="text-base font-bold text-gray-900">
              5. Customer Support
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              For any questions regarding returns or refunds, please reach out to:
            </p>
            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
              Email: <a href="mailto:support@buddymattress.in" className="text-gray-900 font-medium underline hover:text-sky-600">support@buddymattress.in</a><br />
              Helpline: <a href="tel:+919443300000" className="text-gray-900 font-medium underline hover:text-sky-600">+91 94433 00000</a> (Mon – Sat: 9:30 AM to 6:30 PM IST)<br />
              Address: Buddy Mattress, Paramathi Velur, Namakkal, Tamil Nadu, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
