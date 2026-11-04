import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <div className="bg-white min-h-screen text-gray-800 py-10 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: September 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-sm leading-relaxed text-gray-700">
          <p>
            At Luvars Fashion, we are committed to delivering your order accurately, in good condition, and always on time. We provide free doorstep delivery for all products to over 19,000 postal codes across India with no minimum order value or hidden handling fees.
          </p>

          <section className="space-y-3 pt-2">
            <h2 className="text-base font-semibold text-gray-900">
              1. Order Dispatch & Processing
            </h2>
            <p>
              All orders are processed, packed, and dispatched directly from our manufacturing facility in Paramathi Velur (Namakkal, Tamil Nadu) within <strong>24 to 48 hours</strong> of order confirmation. Orders placed on Sundays or public holidays are processed on the subsequent working day.
            </p>
          </section>

          <section className="space-y-3 pt-2">
            <h2 className="text-base font-semibold text-gray-900">
              2. Estimated Delivery Timelines
            </h2>
            <p>
              Once your shipment has been dispatched, estimated transit times vary depending on the destination:
            </p>

            <div className="overflow-x-auto my-3 border border-gray-200 rounded">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-gray-200">Destination Region</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">Estimated Transit Time</th>
                    <th className="py-2.5 px-3">Delivery Partner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  <tr>
                    <td className="py-2.5 px-3 font-medium border-r border-gray-200">Tamil Nadu & South India</td>
                    <td className="py-2.5 px-3 border-r border-gray-200">2 – 4 business days</td>
                    <td className="py-2.5 px-3 text-gray-500">Direct factory logistics</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="py-2.5 px-3 font-medium border-r border-gray-200">Metro Cities (Bengaluru, Chennai, Mumbai, Delhi, Hyderabad)</td>
                    <td className="py-2.5 px-3 border-r border-gray-200">3 – 5 business days</td>
                    <td className="py-2.5 px-3 text-gray-500">Surface & express courier</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium border-r border-gray-200">Rest of India (Tier 2 & Tier 3 Cities)</td>
                    <td className="py-2.5 px-3 border-r border-gray-200">4 – 7 business days</td>
                    <td className="py-2.5 px-3 text-gray-500">Verified national cargo network</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="py-2.5 px-3 font-medium border-r border-gray-200">Special Regions (J&K, North-Eastern States, Island Territories)</td>
                    <td className="py-2.5 px-3 border-r border-gray-200">7 – 10 business days</td>
                    <td className="py-2.5 px-3 text-gray-500">Regional logistics network</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 italic">
              * Delivery times are indicative and may occasionally vary due to local transport restrictions, weather anomalies, or remote postal accessibility.
            </p>
          </section>

          <section className="space-y-3 pt-2">
            <h2 className="text-base font-semibold text-gray-900">
              3. Protective Garment Packaging
            </h2>
            <p>
              Every Luvars Fashion order is neatly folded, poly-packed in waterproof sealed bags, and encased in tamper-evident outer courier shipping flyers to ensure your clothes arrive fresh, clean, and in pristine condition.
            </p>
          </section>

          <section className="space-y-3 pt-2">
            <h2 className="text-base font-semibold text-gray-900">
              4. Order Tracking
            </h2>
            <p>
              As soon as your consignment is handed over to our courier partner, you will receive an automated dispatch notification via SMS, WhatsApp, and email containing the Air Waybill (AWB) number and direct tracking link to monitor your shipment in real time.
            </p>
          </section>

          <section className="space-y-3 pt-2">
            <h2 className="text-base font-semibold text-gray-900">
              5. Damaged Shipments & Insurance
            </h2>
            <p>
              Every shipment is 100% insured against transit damage or loss. If the external carton appears severely damaged or tampered with upon arrival, please take a photograph and write a note on the delivery receipt before accepting, or contact our support team within 48 hours at <a href="mailto:support@luvarsfashion.com" className="underline text-gray-900 hover:text-sky-600">support@luvarsfashion.com</a>. We will dispatch an immediate replacement at no cost.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-gray-200 text-xs sm:text-sm text-gray-700">
            <h2 className="text-base font-semibold text-gray-900">
              6. Factory & Dispatch Office
            </h2>
            <p>
              <strong>Luvars Fashion Private Limited</strong><br />
              Near RTO Office, Paramathi, Paramathi Velur, Namakkal District, Tamil Nadu – 637207, India.<br />
              Customer Support Helpline: <a href="tel:+919443300000" className="underline text-gray-900">+91 94433 00000</a> (Mon – Sat, 9:30 AM to 6:30 PM)<br />
              Email: <a href="mailto:support@luvarsfashion.com" className="underline text-gray-900">support@luvarsfashion.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
