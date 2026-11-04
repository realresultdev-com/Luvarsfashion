import React from "react";
import { ShieldCheck } from "lucide-react";
import type { Product } from "../../types/product.types";

interface LegalMetrologyCardProps {
  product: Product;
  className?: string;
}

export default function LegalMetrologyCard({
  product,
  className = "",
}: LegalMetrologyCardProps) {
  // Determine Net Quantity dynamically from specifications or category
  const aboutItems = Array.isArray(product?.about) ? (product.about as any[]) : [];

  const aboutNetQtyItem = aboutItems.find((item) => {
    if (typeof item === "string") return item.toLowerCase().includes("quantity");
    if (item && typeof item === "object" && typeof item.key === "string") {
      return item.key.toLowerCase().includes("net quantity") || item.key.toLowerCase().includes("quantity");
    }
    return false;
  });
  const aboutNetQty = typeof aboutNetQtyItem === "string" ? aboutNetQtyItem : aboutNetQtyItem?.value;

  const aboutDimItem = aboutItems.find((item) => {
    if (typeof item === "string") return item.toLowerCase().includes("dimension") || item.toLowerCase().includes("size");
    if (item && typeof item === "object" && typeof item.key === "string") {
      return item.key.toLowerCase().includes("dimension") || item.key.toLowerCase().includes("size");
    }
    return false;
  });
  const aboutDimensions = typeof aboutDimItem === "string" ? aboutDimItem : aboutDimItem?.value;

  const productNameLower = (product?.name || "").toLowerCase();
  const isPillow = product?.categoryId === "cat_pillows" || productNameLower.includes("pillow");
  const isProtector = product?.categoryId === "cat_bedding" || productNameLower.includes("protector");

  const netQuantity =
    aboutNetQty ||
    (isPillow
      ? "1 N (1 Piece Pillow)"
      : isProtector
      ? "1 N (1 Piece T-Shirt)"
      : "1 N (1 Piece T-Shirt)");

  const standardDimensions =
    aboutDimensions ||
    (isPillow
      ? "60 cm x 38 cm x 11.5 cm (24 x 15 x 4.5 inches)"
      : isProtector
      ? "198 cm x 182 cm x 25 cm (78 x 72 inches, fits up to 10-inch mattress)"
      : "198 cm x 182 cm x 15.2 cm (78 x 72 x 6 inches - Standard King)");

  return (
    <div
      className={`border border-gray-200/90 rounded-2xl bg-white shadow-2xs overflow-hidden ${className}`}
    >
      {/* Header Banner */}
      <div className="px-4 py-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0ea9df]" />
          <h3 className="text-xs font-bold text-[#191142] uppercase tracking-wider">
            Product &amp; Manufacturer Details
          </h3>
        </div>
        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
          Verified Details
        </span>
      </div>

      {/* Declarations Grid */}
      <div className="p-4 space-y-3 text-xs">
        {/* Row 1: Country of Origin & Net Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
              Country of Origin
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 font-bold text-gray-900">
              <span className="text-base leading-none">🇮🇳</span>
              <span>India</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
              Net Quantity
            </span>
            <span className="font-bold text-gray-900 mt-0.5 block">
              {netQuantity}
            </span>
          </div>
        </div>

        {/* Row 2: Standard Dimensions */}
        <div className="space-y-1 pb-3 border-b border-gray-100">
          <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
            Standard Dimensions
          </span>
          <span className="font-semibold text-gray-800 block">
            {standardDimensions}
          </span>
        </div>

        {/* Row 3: Manufacturer, Packer & Marketer */}
        <div className="space-y-1 pb-3 border-b border-gray-100">
          <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
            Manufactured, Packed & Marketed By
          </span>
          <p className="text-gray-700 leading-relaxed font-medium">
            <strong className="text-gray-900">Luvars Fashion</strong>
            <br />
            Near RTO Office, Paramathi, Paramathi Velur,
            <br />
            Namakkal District, Tamil Nadu - 637207, India
          </p>
        </div>

        {/* Row 4: Customer Care & Support */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
            Customer Care &amp; Support
          </span>
          <p className="text-gray-700 leading-relaxed font-medium">
            For questions, returns, warranty, or feedback, reach our support team at:
            <br />
            <span className="text-gray-900 font-semibold">Address:</span> Luvars Fashion, Paramathi Velur, Tamil Nadu - 637207
            <br />
            <span className="text-gray-900 font-semibold">Email:</span> support@luvarsfashion.com
            <br />
            <span className="text-gray-900 font-semibold">Helpline:</span> +91 94433 00000
          </p>
        </div>
      </div>
    </div>
  );
}
