import { Link } from "react-router-dom";
import { Edit3 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import type { Product, ProductColorVariant } from "../../types/product.types";
import ColorSwatches from "../common/ColorSwatches";
import RatingBadge from "../common/RatingBadge";

interface ProductInfoProps {
  product: Product;
  className?: string;
  selectedVariant?: ProductColorVariant | null;
  onSelectVariant?: (variant: ProductColorVariant) => void;
}

export default function ProductInfo({
  product,
  className = "",
  selectedVariant,
  onSelectVariant,
}: ProductInfoProps) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isAdmin = user?.role === "ADMIN";

  const hasMRP = Boolean(
    (product.original_price && product.original_price > product.price) ||
    (product.originalMRP && product.originalMRP > product.price)
  );
  const originalMRP = product.original_price ?? product.originalMRP ?? product.price;
  const discountPercent = hasMRP ? Math.round(((originalMRP - product.price) / originalMRP) * 100) : 0;

  return (
    <div className={`space-y-3.5 text-xs select-none pt-1 sm:pt-10 ${className}`}>
      {/* 1. Admin Edit Button */}
      {isAdmin && (
        <div className="flex items-center justify-end">
          <Link
            to={`/admin/products/${product.id}/edit`}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#191142] hover:bg-[#0ea9df] text-white text-[11px] font-bold transition-colors"
            title="Edit in Admin Page"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </Link>
        </div>
      )}

      {/* 2. Product Title & Top-Right Rating Alignment */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-200 pb-2.5">
        <h1 className="text-[20px] sm:text-[22px] leading-[28px] font-medium text-[#0f1111] tracking-tight flex-1">
          {product.name}
        </h1>

        {/* Rating in top-right area (No box, Brand Cyan star #0ea9df, normal color number) */}
        {(Boolean(product.rating) || Boolean(product.review_count)) && (
          <a href="#reviews" className="shrink-0 sm:pt-1">
            <RatingBadge
              rating={product.rating}
              reviewCount={product.review_count}
              size="md"
            />
          </a>
        )}
      </div>

      {/* 4. Price Block (Dynamic from API) */}
      <div className="space-y-1.5 border-b border-gray-200 pb-3">
        <div className="flex items-baseline gap-2">
          {hasMRP && discountPercent > 0 && (
            <span className="text-2xl font-light text-[#cc0c39]">-{discountPercent}%</span>
          )}
          <div className="flex items-baseline text-[#0f1111]">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* M.R.P and Taxes */}
        <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
          {hasMRP && (
            <span>M.R.P.: <span className="line-through">₹{originalMRP.toLocaleString("en-IN")}</span></span>
          )}
          <span className="text-gray-700 font-medium">Inclusive of all taxes</span>
        </div>
      </div>

      {/* Color Selection Swatches (Only if color variants exist in API) */}
      {product.color_variants && product.color_variants.length > 0 && (
        <div className="py-2 border-b border-gray-200 space-y-2">
          <ColorSwatches
            variants={product.color_variants}
            selectedVariant={selectedVariant}
            onSelect={onSelectVariant}
            size="md"
            showLabel={true}
          />
        </div>
      )}

      {/* 6. About this item (Rendered ONLY if product.description exists in API) */}
      {product.description && product.description.trim().length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-[14px] text-[#0f1111]">{t("aboutThisItem")}</h3>
          <ul className="space-y-1.5 text-xs text-[#0f1111] list-disc pl-4 leading-relaxed">
            {product.description
              .split("\n")
              .filter((line) => line.trim().length > 0)
              .map((bullet, idx) => (
                <li key={idx} className="pl-0.5">
                  {bullet.replace(/^[•\-\*]\s*/, "")}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* 7. Product Specifications (Borderless 2-column layout matching Amazon) */}
      {product.about && Array.isArray(product.about) && product.about.length > 0 && (
        <div className="space-y-1.5 pt-2 border-b border-gray-200 pb-3">
          <table className="w-full text-xs text-left">
            <tbody>
              {product.about.map((item: any, idx) => {
                const isObj = item && typeof item === "object" && !Array.isArray(item);
                const keyStr = isObj ? item.key || "Feature" : "Feature";
                const valStr = isObj ? item.value || "" : String(item);
                return (
                  <tr key={idx}>
                    <td className="py-1 pr-4 font-bold text-[#0f1111] w-36 sm:w-44 align-top">
                      {keyStr}
                    </td>
                    <td className="py-1 text-[#0f1111] font-normal align-top">
                      {valStr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* End of ProductInfo */}
    </div>
  );
}
