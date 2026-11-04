import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../types/product.types";
import { getProductUrl } from "../../utils/urlSecurity";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface TrendingSliderProps {
  products: Product[];
}

export default function TrendingSlider({ products }: TrendingSliderProps) {
  const validProducts = Array.isArray(products) ? products : [];
  const trendingProducts = validProducts.filter((p) => p && p.is_trending);
  const n = trendingProducts.length;

  // With cloning for infinite loop:
  // Index 0: clone of last item
  // Index 1 to n: actual items (index 1 is item 0, index n is item n - 1)
  // Index n + 1: clone of first item
  const [currentIndex, setCurrentIndex] = useState(n > 1 ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isJumping = useRef(false);

  // Extended items with clones for smooth continuous loop
  const extendedProducts = useMemo(() => {
    if (n <= 1) return trendingProducts;
    return [trendingProducts[n - 1], ...trendingProducts, trendingProducts[0]];
  }, [trendingProducts, n]);

  // Handle seamless wrap when animation finishes
  const handleTransitionEnd = () => {
    if (n <= 1) return;

    if (currentIndex === n + 1) {
      // Reached clone of first item -> jump silently to actual first item (index 1)
      setIsTransitioning(false);
      setCurrentIndex(1);
      isJumping.current = true;
    } else if (currentIndex === 0) {
      // Reached clone of last item -> jump silently to actual last item (index n)
      setIsTransitioning(false);
      setCurrentIndex(n);
      isJumping.current = true;
    }
  };

  // Re-enable transition after silent jump
  useEffect(() => {
    if (isJumping.current) {
      const raf = requestAnimationFrame(() => {
        setIsTransitioning(true);
        isJumping.current = false;
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (n <= 1 || isJumping.current) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev >= n + 1 ? prev : prev + 1));
  };

  const handlePrev = () => {
    if (n <= 1 || isJumping.current) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev <= 0 ? prev : prev - 1));
  };

  const handleDotClick = (dotIdx: number) => {
    if (isJumping.current) return;
    setIsTransitioning(true);
    setCurrentIndex(dotIdx + 1);
  };

  // Auto-play timer with smooth continuous forward glide
  useEffect(() => {
    if (n <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev >= n + 1 ? prev : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [n, isPaused]);

  if (trendingProducts.length === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
  };

  // Current active dot index (0 to n - 1)
  const activeDot = n > 0 ? (currentIndex - 1 + n) % n : 0;

  return (
    <div className="w-full relative select-none mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            Trending Deals
          </h2>
        </div>

        {/* Desktop Navigation Arrows */}
        {trendingProducts.length > 1 && (
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors cursor-pointer shadow-2xs"
              aria-label="Previous trending slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors cursor-pointer shadow-2xs"
              aria-label="Next trending slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Slider Window */}
      <div
        className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xs"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          onTransitionEnd={handleTransitionEnd}
          className="flex will-change-transform"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transitionProperty: "transform",
            transitionDuration: isTransitioning ? "650ms" : "0ms",
            transitionTimingFunction: isTransitioning ? "cubic-bezier(0.25, 1, 0.5, 1)" : "none",
          }}
        >
          {extendedProducts.map((product, idx) => {
            const img = product.images?.[0] || "/logo-transparent.png";
            const mrp =
              product.original_price && product.original_price > product.price
                ? product.original_price
                : product.originalMRP && product.originalMRP > product.price
                ? product.originalMRP
                : null;
            const discount =
              mrp && mrp > product.price
                ? product.discount_percent || product.discountPercent || Math.round(((mrp - product.price) / mrp) * 100)
                : product.discount_percent || product.discountPercent || 0;
            const savings = mrp && mrp > product.price ? mrp - product.price : 0;

            return (
              <div
                key={`${product.id}-slide-${idx}`}
                className="w-full shrink-0 relative overflow-hidden"
              >
                <div className="p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 bg-white">
                  {/* Left Column: Product Info */}
                  <div className="w-full md:w-1/2 lg:w-7/12 space-y-4 text-center md:text-left flex flex-col items-center md:items-start justify-center">
                    {(Boolean(discount > 0) || Boolean(product.offer_badge_value)) && (
                      <span className="text-[11px] font-extrabold text-white bg-[#0ea5e9] border border-[#0ea5e9] px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                        {product.offer_badge_value || "Featured Offer"}
                      </span>
                    )}

                    <div>
                      <Link
                        to={getProductUrl(product.id)}
                        className="hover:underline block"
                      >
                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    {/* Price Block */}
                    <div className="space-y-1 pt-1">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {discount > 0 && (
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      {Boolean(mrp && mrp > product.price) && (
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-500">
                          <span>
                            M.R.P.: <span className="line-through">₹{mrp!.toLocaleString("en-IN")}</span>
                          </span>
                          {savings > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-gray-700 font-medium">
                                Save ₹{savings.toLocaleString("en-IN")}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Link
                        to={getProductUrl(product.id)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-semibold bg-black text-white hover:bg-gray-800 transition-colors shadow-2xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Product Image */}
                  <div className="w-full md:w-1/2 lg:w-5/12 h-64 sm:h-80 shrink-0 flex items-center justify-center">
                    <Link
                      to={getProductUrl(product.id)}
                      className="w-full h-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center group"
                    >
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Navigation Arrows */}
        {n > 1 && (
          <div className="sm:hidden absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-md bg-black/60 text-white flex items-center justify-center pointer-events-auto cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded-md bg-black/60 text-white flex items-center justify-center pointer-events-auto cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      {n > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {trendingProducts.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => handleDotClick(dotIdx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeDot === dotIdx
                  ? "w-5 bg-black"
                  : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
