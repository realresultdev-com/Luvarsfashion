import { useState, useEffect } from "react";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import type { Product, Category } from "../../types/product.types";
import {
  Truck,
  RotateCcw,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import TrendingSlider from "../../components/product/TrendingSlider";
import CategorySection from "../../components/product/CategorySection";
import HeroVideoBanner from "../../components/home/HeroVideoBanner";
import { useLanguage } from "../../context/LanguageContext";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
        ]);
        setProducts(Array.isArray(prodRes?.data) ? prodRes.data : []);
        setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
      } catch (err) {
        console.error("Failed to fetch home page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Consolidate categories from categories API + any unique category present on products
  const displayCategories = (() => {
    const map = new Map<string, Category>();

    if (Array.isArray(categories)) {
      categories.forEach((cat) => {
        if (cat?.name) map.set(cat.name.trim().toLowerCase(), cat);
      });
    }

    if (Array.isArray(products)) {
      products.forEach((p) => {
        const catName = p?.category?.name;
        if (catName && !map.has(catName.trim().toLowerCase())) {
          map.set(catName.trim().toLowerCase(), {
            id: p.categoryId || catName,
            name: catName,
          });
        }
      });
    }

    return Array.from(map.values());
  })();

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* 0. Hero Video Ads Banner (Top section directly below header) */}
      <HeroVideoBanner />

      {/* 1. Trending Deals (Top hero slider) */}
      <TrendingSlider products={products} />

      {/* 2. Products Displayed by Category Sections */}
      {loading ? (
        <div className="space-y-8 my-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="h-7 bg-gray-200 rounded w-48"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-64 bg-gray-100 rounded-lg border border-gray-200"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        displayCategories.map((category) => {
          const categoryProducts = (Array.isArray(products) ? products : []).filter(
            (p) =>
              p.categoryId === category.id ||
              (p.category &&
                p.category.name.trim().toLowerCase() === category.name.trim().toLowerCase())
          );

          return (
            <CategorySection
              key={category.id || category.name}
              category={category}
              products={categoryProducts}
            />
          );
        })
      )}

      {/* 3. Guarantees Strip - Clean Unboxed Layout */}
      <div className="border-y border-gray-200 py-8 px-4 bg-white grid grid-cols-1 sm:grid-cols-3 gap-8 text-center my-8">
        <div className="flex flex-col items-center space-y-2">
          <Truck className="w-6 h-6 text-gray-900 mb-0.5" />
          <h4 className="font-bold text-sm text-gray-900 tracking-tight">
            {language === "ta" ? "இலவச டெலிவரி & அன்பாக்சிங்" : "Free Delivery & Easy Returns"}
          </h4>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            {language === "ta"
              ? "பாதுகாப்பான பேக்கேஜிங்குடன் உங்கள் வீட்டு வாசலில் இலவச டெலிவரி."
              : "Shop online and get your fashion delivered fast, right to your doorstep across India."}
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 sm:border-x sm:border-gray-200 px-4">
          <RotateCcw className="w-6 h-6 text-gray-900 mb-0.5" />
          <h4 className="font-bold text-sm text-gray-900 tracking-tight">
            {language === "ta" ? "100-இரவு வீட்டு சோதனை" : "15-Day Easy Return Policy"}
          </h4>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            {language === "ta"
              ? "உங்கள் வீட்டில் நிம்மதியாக தூங்கி பாருங்கள். திருப்தி இல்லை என்றால் 100% முழு பணம் திரும்பப் பெறலாம்."
              : "Not satisfied with your purchase? Return within 15 days for a full refund, no questions asked."}
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <Award className="w-6 h-6 text-gray-900 mb-0.5" />
          <h4 className="font-bold text-sm text-gray-900 tracking-tight">
            {language === "ta" ? "10-ஆண்டு முழு உத்தரவாதம்" : "Quality Assured"}
          </h4>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            {language === "ta"
              ? "உயர்தர நீடித்த மீள் திறன் கொண்ட ஃபோம் பொருட்களால் உருவாக்கப்பட்டது."
              : "Every piece crafted with premium fabric and stitching for lasting comfort and style."}
          </p>
        </div>
      </div>

      {/* 4. Brand Hero Banner - T-Shirt Fashion Showcase */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 text-white p-6 sm:p-10 md:p-12 my-8">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-[#0ea5e9]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Text Content */}
          <div className="w-full lg:max-w-xl space-y-4">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="px-5 py-2.5 rounded-md bg-white text-gray-900 hover:bg-gray-100 font-semibold text-xs transition-colors inline-block"
              >
                {t("shopMattresses")}
              </Link>
              <span className="px-4 py-2.5 rounded-md border border-gray-700 text-gray-300 font-medium text-xs flex items-center">
                {t("warrantyButton")}
              </span>
            </div>
          </div>

          {/* Right Side: Normal Indian Sleeping Pillow in 3D Floating Showcase (No Box Background) */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col items-center justify-center relative py-4 lg:py-0">
            <Link
              to="/shop"
              aria-label="Explore Luvars Fashion Collection"
              className="relative group flex flex-col items-center cursor-pointer select-none"
            >
              {/* 3D Levitating / Floating Transparent Pillow */}
              <div className="animate-float-pillow relative z-10 transition-transform duration-500 group-hover:scale-105">
                <img
                  src="/hero-tshirt.png"
                  alt="Luvars Fashion T-Shirt"
                  className="w-72 sm:w-80 md:w-96 lg:w-[380px] xl:w-[420px] h-auto object-contain pointer-events-none drop-shadow-[0_25px_30px_rgba(0,0,0,0.65)]"
                />
              </div>

              {/* Dynamic Ground Ambient Floating Shadow */}
              <div className="w-52 sm:w-64 h-6 bg-black/70 blur-xl rounded-full animate-float-shadow -mt-4 relative z-0" />

              {/* Clean Editorial Caption */}
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-sky-400 transition-colors font-medium">
                <span>Explore Our Latest Collection</span>
                <span className="text-xs transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
