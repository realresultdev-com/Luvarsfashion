import React from "react";

interface PriceTagProps {
  price: number;
  originalMRP?: number | null;
  discountPercent?: number | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showDiscount?: boolean;
  showInclusiveText?: boolean;
  className?: string;
}

export default function PriceTag({
  price,
  originalMRP: providedMRP,
  discountPercent: providedDiscount,
  size = "md",
  showDiscount = true,
  showInclusiveText = true,
  className = "",
}: PriceTagProps) {
  // Only use genuine originalMRP if provided and greater than price; NEVER fabricate fake markup
  const originalMRP =
    providedMRP !== undefined && providedMRP !== null && Number(providedMRP) > price
      ? Number(providedMRP)
      : null;

  // Only calculate or show discount if genuine originalMRP > price or genuine positive discount provided
  const discountPercent =
    originalMRP && originalMRP > price
      ? providedDiscount !== undefined && providedDiscount !== null && Number(providedDiscount) > 0
        ? Number(providedDiscount)
        : Math.round(((originalMRP - price) / originalMRP) * 100)
      : providedDiscount !== undefined && providedDiscount !== null && Number(providedDiscount) > 0
      ? Number(providedDiscount)
      : 0;

  const sizeStyles = {
    xs: { symbol: "text-[11px]", main: "text-base font-bold", mrp: "text-[10px]", discount: "text-[11px]" },
    sm: { symbol: "text-xs", main: "text-lg sm:text-xl font-bold", mrp: "text-xs", discount: "text-xs" },
    md: { symbol: "text-sm", main: "text-2xl font-black", mrp: "text-xs", discount: "text-xs sm:text-sm" },
    lg: { symbol: "text-base mt-0.5", main: "text-3xl font-extrabold", mrp: "text-sm", discount: "text-sm" },
    xl: { symbol: "text-lg mt-1", main: "text-4xl font-black", mrp: "text-base", discount: "text-base" },
  }[size];

  const isLarge = size === "lg" || size === "xl";
  const savings = originalMRP && originalMRP > price ? originalMRP - price : 0;

  return (
    <div className={`space-y-1 ${className}`}>
      {isLarge ? (
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-start text-[#191142]">
              <span className={`${sizeStyles.symbol} font-bold text-[#191142] mr-0.5 leading-none pt-0.5`}>
                ₹
              </span>
              <span className={`${sizeStyles.main} font-black tracking-tight leading-none text-[#191142]`}>
                {price.toLocaleString("en-IN")}
              </span>
            </div>
            {showDiscount && discountPercent > 0 && (
              <span className="text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wide">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {originalMRP && originalMRP > price && (
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
              <span>
                M.R.P.:{" "}
                <span className="line-through text-gray-400">
                  ₹{originalMRP.toLocaleString("en-IN")}
                </span>
              </span>
              {savings > 0 && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-emerald-700 font-semibold">
                    You Save: ₹{savings.toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <div className="flex items-start text-[#191142]">
            <span className={`${sizeStyles.symbol} font-bold text-[#191142] mr-0.5 leading-none`}>
              ₹
            </span>
            <span className={`${sizeStyles.main} tracking-tight leading-none text-[#191142]`}>
              {price.toLocaleString("en-IN")}
            </span>
          </div>

          {originalMRP && originalMRP > price && (
            <div className={`${sizeStyles.mrp} text-gray-400 font-normal whitespace-nowrap`}>
              <span className="line-through">
                ₹{originalMRP.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {showDiscount && discountPercent > 0 && (
            <span className={`${sizeStyles.discount} font-bold text-emerald-600 whitespace-nowrap`}>
              {discountPercent}% off
            </span>
          )}
        </div>
      )}

      {showInclusiveText && (
        <p className="text-[11px] text-gray-500 font-normal">Inclusive of all taxes</p>
      )}
    </div>
  );
}
