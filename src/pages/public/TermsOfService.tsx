import { Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="bg-white min-h-screen text-gray-900 py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Breadcrumb */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#007185] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-1.5 border-b border-gray-200 pb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-gray-500">
            Last updated: September 2026 | Governing contract between Buddy Mattress and Customer
          </p>
        </div>

        {/* Introduction */}
        <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-2">
          <p>
            Welcome to <strong>Buddy Mattress</strong>. These Terms of Service (&quot;Terms&quot;) govern your use of our website, digital store, and purchase of mattresses, orthopedic pillows, and sleep accessories manufactured and marketed by <strong>Buddy Mattress</strong>, Paramathi Velur, Tamil Nadu, India.
          </p>
          <p>
            By accessing our store, registering an account, or placing an order, you agree to be bound by these Terms and our Privacy Policy.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed pt-2">
          {/* 1. Eligibility & Accounts */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">
              1. Eligibility & Account Security
            </h2>
            <p>
              To make a purchase, you must be at least 18 years of age and capable of entering into legally binding contracts under the Indian Contract Act, 1872. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.
            </p>
          </section>

          {/* 2. Pricing & Payments */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">
              2. Pricing, GST & Payment Terms
            </h2>
            <p>
              All prices displayed on the store are stated in Indian Rupees (₹ INR) and are <strong>inclusive of Goods and Services Tax (GST)</strong> and doorstep delivery charges unless explicitly specified. Payment is processed securely via Razorpay with support for UPI, Debit/Credit Cards, and NetBanking.
            </p>
          </section>

          {/* 3. 100-Night Trial */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">
              3. 100-Night Risk-Free Trial
            </h2>
            <p>
              Eligible mattresses include a 100-Night Trial calculated from the date of doorstep delivery. We recommend sleeping on your mattress for at least 30 nights to allow your spine to adjust. If you are not satisfied within 100 nights, contact us at <a href="mailto:support@buddymattress.in" className="text-[#007185] hover:underline font-medium">support@buddymattress.in</a> for return pickup and a 100% refund. The mattress must be in hygienic condition without burns, stains, or physical tears.
            </p>
          </section>

          {/* 4. 10-Year Warranty */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">
              4. 10-Year Warranty Terms
            </h2>
            <p>
              Buddy Mattresses are warranted against manufacturing defects and visible body indentations/sagging greater than 1 inch (25 mm) not resulting from an improper bed base. The warranty excludes normal softening of foam, fabric tears, burns, liquid spills, or accidental damage.
            </p>
          </section>

          {/* 5. Governing Law */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">
              5. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. In the event of any legal dispute, claims shall be subject to the exclusive jurisdiction of the competent courts in <strong>Namakkal / Chennai, Tamil Nadu, India</strong>.
            </p>
          </section>

          {/* 6. Contact & Grievances */}
          <section className="space-y-2 pt-2">
            <h2 className="text-base font-bold text-gray-900">
              6. Contact Information & Customer Grievances
            </h2>
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50/50 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <Building2 className="w-4 h-4 text-gray-700" />
                <span>Buddy Mattress</span>
              </div>
              <p className="text-gray-700">
                <strong>Address:</strong> Near RTO Office, Paramathi, Paramathi Velur, Namakkal District, Tamil Nadu - 637207, India
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong>{" "}
                <a href="mailto:support@buddymattress.in" className="text-[#007185] hover:underline font-medium">
                  support@buddymattress.in
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Helpline:</strong>{" "}
                <a href="tel:+919443300000" className="text-[#007185] hover:underline font-medium">
                  +91 94433 00000
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
