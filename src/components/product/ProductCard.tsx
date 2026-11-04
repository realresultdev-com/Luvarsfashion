import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Edit2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";
import { getProductUrl } from "../../utils/urlSecurity";
import { formatFashionTitle } from "../../utils/fashionMapping";
import type { Product, ProductColorVariant } from "../../types/product.types";
import RatingBadge from "../common/RatingBadge";
import PriceTag from "../common/PriceTag";
import ColorSwatches from "../common/ColorSwatches";

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const [selectedVariant, setSelectedVariant] = useState<ProductColorVariant | null>(
    product.color_variants && product.color_variants.length > 0 ? product.color_variants[0] : null
  );

  const displayedImage =
    selectedVariant?.image ||
    (product.images && product.images.length > 0
      ? product.images[0]
      : "/logo-transparent.png");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      const redirectUrl = window.location.pathname + window.location.search;
      navigate(`/register?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    addItem({
      productId: product.id,
      name: selectedVariant?.name ? `${formatFashionTitle(product.name)} (${selectedVariant.name})` : product.name,
      price: product.price,
      quantity: 1,
      image: displayedImage,
      color: selectedVariant?.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-lg p-3 flex flex-col justify-between hover:border-gray-300 hover:shadow-2xs transition-all relative group h-full">
      {/* Admin Edit Icon */}
      {isAdmin && (
        <Link
          to={`/admin/products/${product.id}/edit`}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-1 rounded bg-black/80 hover:bg-black text-white text-[10px] font-semibold transition-colors shadow-2xs"
          title="Edit Product"
        >
          <Edit2 className="w-3 h-3" />
          <span>Edit</span>
        </Link>
      )}

      <div>
        {/* Product Image */}
        <Link
          to={getProductUrl(product.id)}
          className="block aspect-square w-full overflow-hidden bg-gray-50 p-2 mb-2.5 flex items-center justify-center rounded-md relative border border-gray-100"
        >
          {Boolean(product.offer_badge_value) && (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#0ea5e9] text-white border border-[#0ea5e9] shadow-2xs uppercase tracking-wider">
                {product.offer_badge_value}
              </span>
            </div>
          )}

          <img
            src={displayedImage}
            alt={formatFashionTitle(product.name)}
            className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-200"
            loading="lazy"
          />
        </Link>

        {/* Color Swatches */}
        {product.color_variants && product.color_variants.length > 0 && (
          <div className="mb-2">
            <ColorSwatches
              variants={product.color_variants}
              selectedVariant={selectedVariant}
              onSelect={(v) => setSelectedVariant(v)}
              onHover={(v) => setSelectedVariant(v)}
              size="sm"
            />
          </div>
        )}

        {/* Title */}
        <Link to={getProductUrl(product.id)}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-black line-clamp-2 leading-snug min-h-[32px] sm:min-h-[36px]">
            {formatFashionTitle(product.name)}
          </h3>
        </Link>

        {/* Rating */}
        {Boolean(product.rating && (product.review_count ?? 0) > 0) && (
          <div className="mt-1.5 flex items-center">
            <RatingBadge
              rating={product.rating}
              reviewCount={product.review_count}
              size="xs"
            />
          </div>
        )}

        {/* Price */}
        <div className="mt-2">
          <PriceTag
            price={product.price}
            originalMRP={product.original_price ?? product.originalMRP}
            discountPercent={product.discount_percent ?? product.discountPercent}
            size="sm"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-3 pt-2">
        {product.stock <= 0 ? (
          <button
            disabled
            className="w-full py-2 px-3 rounded-md text-xs font-medium bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          >
            {t("currentlyUnavailable")}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2 px-3 rounded-md text-xs font-semibold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
              added
                ? "bg-emerald-700 text-white"
                : "bg-black hover:bg-gray-800 text-white"
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> {t("addedToCart")}
              </>
            ) : (
              t("addToCart")
            )}
          </button>
        )}
      </div>
    </div>
  );
}
