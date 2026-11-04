import { useState } from "react";
import { Check, Lock, MapPin } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import type { Product } from "../../types/product.types";

interface ProductBuyBoxProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
  onBuyNow: (quantity: number) => void;
  isAdding?: boolean;
  className?: string;
}

export default function ProductBuyBox({
  product,
  onAddToCart,
  onBuyNow,
  isAdding = false,
  className = "",
}: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const { t } = useLanguage();
  const inStock = product.stock > 0;
  const maxQty = Math.min(10, Math.max(1, product.stock));



  return (
    <div
      className={`border border-[#d5d9d9] rounded-[8px] p-3.5 bg-white text-xs space-y-3 shadow-2xs select-none ${className}`}
    >
      {/* 1. Price (Dynamic from API) */}
      <div className="space-y-0.5">
        <div className="flex items-baseline text-[#0f1111]">
          <span className="text-xs font-semibold self-start pt-1">₹</span>
          <span className="text-2xl font-medium tracking-tight">
            {product.price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-semibold self-start pt-1">00</span>
        </div>
      </div>



      {/* 3. Stock State (Dynamic from product.stock) */}
      <div>
        {inStock ? (
          <p className="text-[17px] font-medium text-[#007600] leading-tight">
            {t("inStock")}
          </p>
        ) : (
          <p className="text-[17px] font-medium text-[#b12704] leading-tight">{t("currentlyUnavailable")}</p>
        )}
      </div>

      {/* Actions */}
      {inStock && (
        <div className="space-y-2.5">
          {/* Quantity selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="buybox-quantity" className="font-medium text-gray-800">
              Quantity:
            </label>
            <select
              id="buybox-quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border border-[#d5d9d9] rounded-[8px] bg-[#f0f2f2] hover:bg-[#e3e6e6] px-2.5 py-1 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-[#007185] cursor-pointer shadow-2xs"
            >
              {Array.from({ length: maxQty }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Add to Cart: Application Theme Cyan Button (#0ea9df) */}
          <button
            type="button"
            onClick={() => onAddToCart(quantity)}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#0ea9df] hover:bg-[#0c93c4] active:bg-[#0a82ae] text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isAdding ? (
              <>
                <Check className="w-4 h-4 text-white" /> {t("addedToCart")}
              </>
            ) : (
              t("addToCart")
            )}
          </button>

          {/* Buy Now: Application Theme Navy Button (#191142) */}
          <button
            type="button"
            onClick={() => onBuyNow(quantity)}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#191142] hover:bg-[#281c62] active:bg-[#120b33] text-white shadow-xs transition-colors cursor-pointer"
          >
            {t("buyNow")}
          </button>

          {/* Seller / Fulfillment Details Table */}
          <div className="pt-2 border-t border-gray-200 space-y-1 text-[11px] text-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Ships from</span>
              <span className="font-normal text-[#0f1111] truncate">Buddy Mattress</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Sold by</span>
              <span className="font-normal text-[#007185] hover:underline cursor-pointer truncate">
                Buddy Mattress Store
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Packaging</span>
              <span className="font-normal text-gray-700">Ships in product packaging</span>
            </div>
          </div>
        </div>
      )}

      {/* Security & Guarantee Footer */}
      <div className="flex items-center gap-1.5 text-[#007185] hover:underline text-[11px] pt-1 cursor-pointer border-t border-gray-200">
        <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <span>Secure transaction</span>
      </div>
    </div>
  );
}
