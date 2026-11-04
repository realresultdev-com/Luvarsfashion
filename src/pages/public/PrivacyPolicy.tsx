import { Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-500">
            Last updated: September 2026 | Effective for all users & customers of Luvars Fashion
          </p>
        </div>

        {/* Introduction */}
        <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3">
          <p>
            At <strong>Luvars Fashion</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we value your trust and are committed to protecting your personal data in accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Information Technology Act, 2000</strong> of India.
          </p>
          <p>
            This Privacy Policy describes how we collect, use, and process your personal information when you visit our store, purchase t-shirts, shirts, casual apparel, and fashion accessories, or contact customer support.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed pt-2">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">
              1. Personal Data We Collect
            </h2>
            <p>
              We collect personal data that you voluntarily provide when creating an account, placing an order, or interacting with customer support:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-700">
              <li>
                <strong>Contact Information:</strong> Full name, telephone number, and email address (collected during registration or Google OAuth sign-in).
              </li>
              <li>
                <strong>Shipping & Billing Details:</strong> Physical doorstep address, city, state, PIN code, and landmark for order fulfillment.
              </li>
              <li>
                <strong>Transaction & Invoicing Data:</strong> Payment transaction references, items ordered, order value, and statutory GST tax invoices.
              </li>
              <li>
                <strong>Technical Identifiers:</strong> IP address, browser type, and device parameters used to prevent fraud and secure your session.
              </li>
            </ul>
            <p className="text-xs text-gray-500 pt-1">
              <em>Note: We never store your full payment card details or banking passwords on our servers. All payments are processed through RBI-authorized payment aggregators.</em>
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">
              2. Third-Party Data Processors
            </h2>
            <p>
              We share relevant personal data only with trusted service providers necessary to fulfill your orders:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-700">
              <li>
                <strong>Razorpay Software Private Limited:</strong> Secure payment processing and tokenization under PCI-DSS Level 1 guidelines.
              </li>
              <li>
                <strong>Cloudflare, Inc.:</strong> Encrypted cloud database infrastructure, media hosting, and Web Application Firewall protection.
              </li>
              <li>
                <strong>Courier & Logistics Partners:</strong> Delivery carriers (e.g. Delhivery, BlueDart) receive your delivery address and phone number to perform doorstep shipping.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">
              3. Your Statutory Rights under DPDP Act, 2023
            </h2>
            <p>
              As a Data Principal under Indian law, you have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-gray-700">
              <li>Right to request a summary of your personal data processed by us.</li>
              <li>Right to correct or update obsolete or inaccurate personal information.</li>
              <li>Right to request erasure of your data, except where retention is legally required for GST and accounting compliance.</li>
              <li>Right to readily available grievance redressal.</li>
            </ul>
            <p className="text-xs text-gray-600 pt-1">
              To exercise any of these rights, email us at <a href="mailto:support@luvarsfashion.com" className="text-[#007185] font-semibold hover:underline">support@luvarsfashion.com</a>. We will process requests within 30 days.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2 pt-2">
            <h2 className="text-base font-bold text-gray-900">
              4. Grievance Officer & Contact Information
            </h2>
            <p className="text-xs text-gray-700">
              In accordance with the Consumer Protection (E-Commerce) Rules, 2020, the details of our Grievance Officer and office address are as follows:
            </p>

            <div className="border border-gray-200 rounded-md p-4 bg-gray-50/50 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <Building2 className="w-4 h-4 text-gray-700" />
                <span>Luvars Fashion</span>
              </div>
              <p className="text-gray-700">
                <strong>Address:</strong> Near RTO Office, Paramathi, Paramathi Velur, Namakkal District, Tamil Nadu - 637207, India
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong>{" "}
                <a href="mailto:support@luvarsfashion.com" className="text-[#007185] hover:underline font-medium">
                  support@luvarsfashion.com
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Helpline:</strong>{" "}
                <a href="tel:+919443300000" className="text-[#007185] hover:underline font-medium">
                  +91 94433 00000
                </a>{" "}
                (Mon – Sat: 9:30 AM – 6:30 PM IST)
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
