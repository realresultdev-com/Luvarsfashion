import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Check, ChevronDown, ChevronUp, Lock, PhoneCall, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { productService } from "../../services/product.service";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { decryptId } from "../../utils/urlSecurity";
import type { Product, ProductColorVariant } from "../../types/product.types";
import Loader from "../../components/common/Loader";
import ProductBreadcrumbs from "../../components/product/ProductBreadcrumbs";
import ProductGallery from "../../components/product/ProductGallery";
import ProductInfo from "../../components/product/ProductInfo";
import ProductReviewsSection from "../../components/product/ProductReviewsSection";
import ProductStatutorySection from "../../components/product/ProductStatutorySection";

export default function ProductDetail() {
  const { id: urlParamId } = useParams<{ id: string }>();
  const id = decryptId(urlParamId || "");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductColorVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getById(id);
        if (isMounted) {
          const p = res.data;
          setProduct(p);
          if (p.color_variants && p.color_variants.length > 0) {
            setSelectedVariant(p.color_variants[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <Loader text="Loading product details..." />;

  if (!product) {
    return (
      <div className="bg-white p-12 text-center border border-gray-200 rounded-xl max-w-lg mx-auto my-12 space-y-3">
        <h2 className="text-lg font-bold text-[#191142]">Product not found</h2>
        <p className="text-xs text-gray-500">The product you are looking for might have been moved or removed.</p>
        <Link to="/" className="inline-block text-xs font-bold text-white bg-[#0ea9df] hover:bg-[#0c93c4] px-4 py-2 rounded-lg transition-colors">
          Return to Store
        </Link>
      </div>
    );
  }

  const activeImage =
    selectedVariant?.image ||
    (product.images && product.images.length > 0
      ? product.images[0]
      : "/logo-transparent.png");

  const inStock = product.stock > 0;
  const maxQty = Math.min(10, Math.max(1, product.stock));

  const handleAddToCart = (qty: number) => {
    if (!user) {
      navigate(`/register?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    addItem({
      productId: product.id,
      name: selectedVariant?.name ? `${product.name} (${selectedVariant.name})` : product.name,
      price: product.price,
      quantity: qty,
      image: activeImage,
      color: selectedVariant?.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = (qty: number) => {
    if (!user) {
      navigate(`/register?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    addItem({
      productId: product.id,
      name: selectedVariant?.name ? `${product.name} (${selectedVariant.name})` : product.name,
      price: product.price,
      quantity: qty,
      image: activeImage,
      color: selectedVariant?.name,
    });
    navigate("/checkout");
  };

  return (
    <div className="w-full max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8 py-1.5 space-y-3 pb-8 lg:pb-12 relative bg-white">
      {/* Amazon-Style Sticky Top Bar on Scroll (Desktop) */}
      {showStickyBar && (
        <div className="hidden lg:flex fixed top-[60px] md:top-[68px] left-0 right-0 z-40 bg-white border-b border-gray-200 px-6 py-2 shadow-xs transition-all animate-in slide-in-from-top duration-200 items-center justify-between">
          <div className="max-w-[1480px] mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={activeImage}
                alt={product.name}
                className="w-10 h-10 object-contain rounded border border-gray-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0f1111] truncate">{product.name}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span className="text-amber-500 font-bold">★ {product.rating || 4.5}</span>
                  <span>({product.review_count || 128} ratings)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-baseline gap-0.5 text-[#0f1111]">
                <span className="text-xs font-semibold">₹</span>
                <span className="text-lg font-bold">{product.price.toLocaleString("en-IN")}</span>
              </div>
              <button
                type="button"
                onClick={() => handleAddToCart(quantity)}
                className="py-1.5 px-4 rounded-md bg-black hover:bg-gray-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                {added ? "Added!" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <ProductBreadcrumbs
        categoryName={product.category?.name}
        categoryId={product.categoryId}
        productName={product.name}
      />

      {/* Responsive 2-Column Grid: Left Sticky Gallery + Actions (~42%), Right Content (~58%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start relative">
        {/* Left Column: Image Gallery & Action Buttons Below Images (5 cols - Sticky) */}
        <div className="lg:col-span-5 w-full min-w-0 lg:sticky lg:top-20 self-start z-40 space-y-2.5">
          <ProductGallery
            images={
              selectedVariant?.images && selectedVariant.images.length > 0
                ? selectedVariant.images
                : product.images
            }
            productName={product.name}
            featuredImage={selectedVariant?.image}
          />

          {/* Both Action Buttons & Quantity Selector Directly Below Images */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <label htmlFor="detail-quantity" className="font-semibold text-gray-900">
                  Quantity:
                </label>
                <select
                  id="detail-quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border border-gray-300 rounded-md bg-white hover:bg-gray-50 px-3 py-1.5 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
                >
                  {Array.from({ length: maxQty }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {inStock ? (
                <span className="text-xs font-bold text-emerald-700">In stock</span>
              ) : (
                <span className="text-xs font-bold text-rose-700">Currently unavailable</span>
              )}
            </div>

            {inStock && (
              <div className="grid grid-cols-2 gap-3">
                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={() => handleAddToCart(quantity)}
                  className="w-full py-2.5 px-4 rounded-md font-semibold text-xs sm:text-sm bg-black hover:bg-gray-800 active:bg-gray-900 text-white shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-white" /> Added!
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </button>

                {/* Buy Now */}
                <button
                  type="button"
                  onClick={() => handleBuyNow(quantity)}
                  className="w-full py-2.5 px-4 rounded-md font-semibold text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 border border-gray-300 shadow-2xs transition-colors cursor-pointer"
                >
                  Buy Now
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Product Details, Statutory & Reviews (7 cols - Scrolls) */}
        <div className="lg:col-span-7 w-full min-w-0 space-y-8">
          <ProductInfo
            product={product}
            selectedVariant={selectedVariant}
            onSelectVariant={(v) => setSelectedVariant(v)}
          />

          {/* Mandatory Statutory Information / Legal Metrology Declarations */}
          <ProductStatutorySection product={product} />

          {/* Trust Badges Strip (Moved right above Review Section) */}
          <div className="py-3.5 border-y border-gray-200 grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs text-gray-700">
            <div className="flex flex-col items-center gap-1.5 p-1 hover:text-black cursor-pointer">
              <Truck className="w-5 h-5 text-gray-800" />
              <span className="text-gray-700 leading-tight font-medium">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1 hover:text-black cursor-pointer">
              <RotateCcw className="w-5 h-5 text-gray-800" />
              <span className="text-gray-700 leading-tight font-medium">10 days Replacement</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1 hover:text-black cursor-pointer">
              <ShieldCheck className="w-5 h-5 text-gray-800" />
              <span className="text-gray-700 leading-tight font-medium">10 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1 hover:text-black cursor-pointer">
              <PhoneCall className="w-5 h-5 text-gray-800" />
              <span className="text-gray-700 leading-tight font-medium">Helpline Support</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-1 hover:text-black cursor-pointer">
              <Lock className="w-5 h-5 text-gray-800" />
              <span className="text-gray-700 leading-tight font-medium">Secure transaction</span>
            </div>
          </div>

          {/* Customer Ratings & Verified Buyer Reviews */}
          <ProductReviewsSection product={product} />
        </div>
      </div>
    </div>
  );
}
