import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import type { Product, Category } from "../../types/product.types";
import ProductCard from "../../components/product/ProductCard";
import {
  SlidersHorizontal,
  ChevronRight,
  X,
  Search,
  Check,
  RotateCcw,
  ArrowUpDown,
  Star,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States synced with URL SearchParams
  const categoryParam = searchParams.get("category") || "All";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "newest";
  const priceRangeParam = searchParams.get("priceRange") || "all";
  const inStockParam = searchParams.get("inStock") === "true";
  const dealsOnlyParam = searchParams.get("dealsOnly") === "true";

  // Mobile Filter Drawer State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParam);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getAll(undefined, true),
          categoryService.getAll(true),
        ]);
        setProducts(Array.isArray(prodRes?.data) ? prodRes.data : []);
        setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
      } catch (err) {
        console.error("Failed to load shop products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateParam = (key: string, value: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!value || value === "All" || value === "all" || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setSearchInput("");
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Category Filter
      if (categoryParam !== "All") {
        const matchesCatId = p.categoryId === categoryParam;
        const matchesCatName =
          p.category?.name?.toLowerCase() === categoryParam.toLowerCase();
        if (!matchesCatId && !matchesCatName) return false;
      }

      // 2. Keyword Search
      if (searchParam.trim() !== "") {
        const term = searchParam.toLowerCase();
        const inName = p.name?.toLowerCase().includes(term);
        const inDesc = p.description?.toLowerCase().includes(term);
        const inCat = p.category?.name?.toLowerCase().includes(term);
        if (!inName && !inDesc && !inCat) return false;
      }

      // 3. Price Range Filter
      if (priceRangeParam === "under-2000" && p.price >= 2000) return false;
      if (
        priceRangeParam === "2000-10000" &&
        (p.price < 2000 || p.price > 10000)
      )
        return false;
      if (
        priceRangeParam === "10000-20000" &&
        (p.price < 10000 || p.price > 20000)
      )
        return false;
      if (priceRangeParam === "above-20000" && p.price <= 20000) return false;

      // 4. In Stock Filter
      if (inStockParam && (p.stock === 0 || p.stock === undefined)) return false;

      // 5. Deals Only Filter
      if (dealsOnlyParam && !p.offer_badge_value && !p.is_trending) return false;

      return true;
    });
  }, [
    products,
    categoryParam,
    searchParam,
    priceRangeParam,
    inStockParam,
    dealsOnlyParam,
  ]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortParam) {
      case "price-low":
        return list.sort((a, b) => a.price - b.price);
      case "price-high":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "newest":
      default:
        return list;
    }
  }, [filteredProducts, sortParam]);

  // Count active filters
  const activeFilterCount =
    (categoryParam !== "All" ? 1 : 0) +
    (searchParam ? 1 : 0) +
    (priceRangeParam !== "all" ? 1 : 0) +
    (inStockParam ? 1 : 0) +
    (dealsOnlyParam ? 1 : 0);

  return (
    <div className="space-y-6 pb-16 max-w-full">
      {/* 1. Breadcrumbs & Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
        <nav className="text-xs text-gray-500 flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
          <Link to="/" className="hover:text-[#0ea9df] hover:underline font-medium">
            Luvars Fashion
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[#191142] font-bold">Shop</span>
          {categoryParam !== "All" && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-[#0ea9df] font-semibold">
                {categories.find((c) => c.id === categoryParam)?.name || categoryParam}
              </span>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#191142] tracking-tight">
              {categoryParam === "All"
                ? "Shop All Fashion"
                : categories.find((c) => c.id === categoryParam)?.name || "Shop Collection"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing{" "}
              <strong className="text-gray-900 font-bold">
                {sortedProducts.length}
              </strong>{" "}
              fashion products
              {searchParam ? ` for "${searchParam}"` : ""}
            </p>
          </div>

          {/* Quick Search & Sort Bar */}
          <div className="flex items-center gap-2.5">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center"
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-40 sm:w-56 pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-[#0ea9df] focus:ring-2 focus:ring-[#0ea9df]/20 outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateParam("search", null);
                  }}
                  className="absolute right-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {/* Mobile Filter Trigger */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0ea9df]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0ea9df] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          <button
            onClick={() => updateParam("category", "All")}
            className={`px-4 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              categoryParam === "All"
                ? "bg-[#0ea9df] text-white border-[#0ea9df] shadow-xs"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-[#191142]"
            }`}
          >
            All Styles
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam("category", cat.id)}
              className={`px-4 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                categoryParam === cat.id
                  ? "bg-[#0ea9df] text-white border-[#0ea9df] shadow-xs"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-[#191142]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block md:col-span-1 space-y-5 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs h-fit sticky top-24">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-[#191142] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#0ea9df]" />
              Filter Products
            </h2>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-semibold text-[#0ea9df] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Department / Category */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Department
            </p>
            <div className="space-y-1">
              <button
                onClick={() => updateParam("category", "All")}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  categoryParam === "All"
                    ? "bg-cyan-50 text-[#0ea9df] font-bold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>All Departments</span>
                {categoryParam === "All" && <Check className="w-3.5 h-3.5 text-[#0ea9df]" />}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam("category", cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    categoryParam === cat.id
                      ? "bg-cyan-50 text-[#0ea9df] font-bold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{cat.name}</span>
                  {categoryParam === cat.id && <Check className="w-3.5 h-3.5 text-[#0ea9df]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Price Range
            </p>
            <div className="space-y-1 text-xs">
              {[
                { id: "all", label: "All Prices" },
                { id: "under-2000", label: "Under ₹2,000" },
                { id: "2000-10000", label: "₹2,000 - ₹10,000" },
                { id: "10000-20000", label: "₹10,000 - ₹20,000" },
                { id: "above-20000", label: "Above ₹20,000" },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => updateParam("priceRange", range.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    priceRangeParam === range.id
                      ? "bg-cyan-50 text-[#0ea9df] font-bold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{range.label}</span>
                  {priceRangeParam === range.id && (
                    <Check className="w-3.5 h-3.5 text-[#0ea9df]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Showcase Grid */}
        <div className="md:col-span-3 space-y-4">
          {/* Controls Bar: Sort + Active Filter Tags */}
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 font-medium">Sort by:</span>
              <select
                value={sortParam}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 outline-none focus:border-[#0ea9df] cursor-pointer"
              >
                <option value="newest">Featured & Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
              </select>

              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap ml-2">
                  {categoryParam !== "All" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
                      {categories.find((c) => c.id === categoryParam)?.name || categoryParam}
                      <button
                        onClick={() => updateParam("category", "All")}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchParam && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
                      "{searchParam}"
                      <button
                        onClick={() => {
                          setSearchInput("");
                          updateParam("search", null);
                        }}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {priceRangeParam !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
                      Price filtered
                      <button
                        onClick={() => updateParam("priceRange", null)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {inStockParam && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
                      In Stock
                      <button
                        onClick={() => updateParam("inStock", null)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {dealsOnlyParam && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[11px] font-semibold">
                      Deals Only
                      <button
                        onClick={() => updateParam("dealsOnly", null)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={handleClearFilters}
                    className="text-[11px] text-[#0ea9df] hover:underline font-bold ml-1 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            <span className="text-gray-400 text-[11px]">
              {sortedProducts.length} Results
            </span>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 p-3 rounded-xl space-y-2 animate-pulse"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg" />
                  <div className="h-3.5 bg-gray-100 w-3/4 rounded" />
                  <div className="h-3 bg-gray-100 w-1/2 rounded" />
                  <div className="h-8 bg-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-base font-bold text-[#191142]">
                No matching products found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                We couldn't find any products matching your selected filters. Try
                broadening your search or clearing the active filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 py-2 px-5 rounded-full bg-[#0ea9df] hover:bg-[#0c93c4] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Mobile Filter Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Sliding Bottom Sheet */}
          <div className="relative z-10 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0ea9df]" />
                <h3 className="text-sm font-bold text-[#191142]">Filter & Refine</h3>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#0ea9df] text-white text-[11px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Department */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-900 uppercase">Department</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateParam("category", "All")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      categoryParam === "All"
                        ? "bg-[#0ea9df] text-white border-[#0ea9df]"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam("category", cat.id)}
                      className={`p-2.5 rounded-xl border text-center font-bold truncate transition-all ${
                        categoryParam === cat.id
                          ? "bg-[#0ea9df] text-white border-[#0ea9df]"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-900 uppercase">Price</p>
                <div className="space-y-1.5">
                  {[
                    { id: "all", label: "All Prices" },
                    { id: "under-2000", label: "Under ₹2,000" },
                    { id: "2000-10000", label: "₹2,000 - ₹10,000" },
                    { id: "10000-20000", label: "₹10,000 - ₹20,000" },
                    { id: "above-20000", label: "Above ₹20,000" },
                  ].map((range) => (
                    <button
                      key={range.id}
                      onClick={() => updateParam("priceRange", range.id)}
                      className={`w-full text-left p-2.5 rounded-xl border font-bold flex items-center justify-between transition-all ${
                        priceRangeParam === range.id
                          ? "bg-cyan-50 border-[#0ea9df] text-[#0ea9df]"
                          : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      <span>{range.label}</span>
                      {priceRangeParam === range.id && (
                        <Check className="w-4 h-4 text-[#0ea9df]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-4 bg-[#0ea9df] hover:bg-[#0c93c4] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Show {sortedProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
