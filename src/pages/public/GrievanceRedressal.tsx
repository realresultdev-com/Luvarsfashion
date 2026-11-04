import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function GrievanceRedressal() {
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
            Grievance Redressal Mechanism
          </h1>
          <p className="text-xs text-gray-500">
            In compliance with the Consumer Protection (E-Commerce) Rules, 2020 & Information Technology Act, 2000
          </p>
        </div>

        {/* Introduction */}
        <p className="text-sm text-gray-700 leading-relaxed">
          Buddy Mattress is committed to transparent, fair, and prompt resolution of customer grievances. In accordance with Rule 4(4) of the Consumer Protection (E-Commerce) Rules, 2020, the details of our designated Grievance & Nodal Officer are provided below.
        </p>

        {/* Officer Details - Clean Table / Definition Layout */}
        <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              Designated Grievance & Nodal Officer
            </h2>
          </div>
          <div className="divide-y divide-gray-200 text-xs sm:text-sm">
            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-gray-500 font-medium">Officer Name</span>
              <span className="sm:col-span-2 font-semibold text-gray-900">K. Senthil Kumar</span>
            </div>
            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-gray-500 font-medium">Designation</span>
              <span className="sm:col-span-2 text-gray-800">Head of Customer Redressal & Legal Compliance</span>
            </div>
            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-gray-500 font-medium">Helpline</span>
              <span className="sm:col-span-2 text-gray-900">
                <a href="tel:+919443300000" className="font-medium underline hover:text-sky-600">
                  +91 94433 00000
                </a>{" "}
                <span className="text-gray-500 text-xs">(Mon – Sat: 9:30 AM to 6:30 PM IST)</span>
              </span>
            </div>
            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-gray-500 font-medium">Email</span>
              <span className="sm:col-span-2">
                <a href="mailto:support@buddymattress.in" className="text-gray-900 font-medium underline hover:text-sky-600">
                  support@buddymattress.in
                </a>
              </span>
            </div>
            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <span className="text-gray-500 font-medium">Registered Address</span>
              <span className="sm:col-span-2 text-gray-800 leading-relaxed">
                Buddy Mattress, Near RTO Office, Paramathi, Paramathi Velur, Namakkal District, Tamil Nadu - 637207, India.
              </span>
            </div>
          </div>
        </div>

        {/* Policy Details */}
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          {/* Resolution Timelines */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">
              Statutory Resolution Timelines
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600">
              <li>
                <strong>Acknowledgment:</strong> Every complaint received is formally acknowledged with a unique ticket reference number within <strong>48 hours</strong> of receipt.
              </li>
              <li>
                <strong>Resolution:</strong> All consumer grievances are investigated and resolved within <strong>30 days</strong> from the date of receipt, in accordance with statutory guidelines.
              </li>
            </ul>
          </section>

          {/* Procedure */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">
              How to Submit a Grievance
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-gray-600">
              <li>
                <strong>Initial Contact:</strong> Send an email to <a href="mailto:support@buddymattress.in" className="text-gray-900 font-medium underline hover:text-sky-600">support@buddymattress.in</a> or call our helpline at <a href="tel:+919443300000" className="text-gray-900 font-medium underline hover:text-sky-600">+91 94433 00000</a>. Please include your Order ID and contact details.
              </li>
              <li>
                <strong>Support Desk Review:</strong> Our customer support desk will acknowledge your ticket and attempt immediate resolution within 48 hours.
              </li>
              <li>
                <strong>Grievance Officer Escalation:</strong> If your issue is not resolved within 7 business days, you may request direct escalation to the Grievance Officer using the postal address or official email above.
              </li>
            </ol>
          </section>

          {/* National Consumer Helpline */}
          <section className="space-y-2 pt-4 border-t border-gray-200 text-xs sm:text-sm text-gray-600">
            <h2 className="text-base font-bold text-gray-900">
              National Consumer Helpline (NCH)
            </h2>
            <p>
              Consumers in India may also seek guidance or lodge consumer complaints through the Department of Consumer Affairs via the National Consumer Helpline at Toll-Free: <strong>1915</strong> or online at{" "}
              <a href="https://consumerhelpline.gov.in" target="_blank" rel="noreferrer" className="text-gray-900 underline hover:text-sky-600 font-medium">
                consumerhelpline.gov.in
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
