import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  Clock,
  ArrowRight,
  Star,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchCatalog } from "../../store/productSlice";
import {
  loadRecentSearches,
  saveSearchQuery,
  removeSearchRecord,
  clearAllSearches,
} from "../../store/searchSlice";
import { getProductUrl } from "../../utils/urlSecurity";
import type { Product } from "../../types/product.types";

interface SearchBarProps {
  isMobile?: boolean;
  onSearchComplete?: () => void;
  className?: string;
}

export default function SearchBar({
  isMobile = false,
  onSearchComplete,
  className = "",
}: SearchBarProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const products = useAppSelector((state) => state.catalog.products);
  const recentSearches = useAppSelector((state) => state.search.recentSearches);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoggedIn = Boolean(user);

  // Clear search field value when user does anything different from the search result page (e.g. returning to home page)
  useEffect(() => {
    const isSearchPage =
      location.pathname === "/shop" && Boolean(searchParams.get("search"));
    if (isSearchPage) {
      setQuery(searchParams.get("search") || "");
      const cat = searchParams.get("category");
      if (cat) {
        setSelectedCategory(cat);
      }
    } else {
      setQuery("");
      setSelectedCategory("All");
    }
    setIsOpen(false);
  }, [location.pathname, location.search]);

  // Extract unique categories for dropdown
  const categoriesList = React.useMemo(() => {
    const names = new Set<string>();
    if (Array.isArray(products)) {
      products.forEach((p) => {
        if (p?.category?.name) names.add(p.category.name);
      });
    }
    return Array.from(names);
  }, [products]);

  // Lazy load searches ONLY when user focuses/clicks the search bar
  const handleFocus = () => {
    setIsOpen(true);
    dispatch(loadRecentSearches(isLoggedIn));
  };

  // Load catalog into Redux once on initial mount (in-memory search)
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchCatalog());
    }
  }, [dispatch, products.length]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter products in-memory from Redux
  const trimmedQuery = query.trim().toLowerCase();
  const matchingProducts = React.useMemo(() => {
    if (!trimmedQuery) return [];
    return products
      .filter((p) => {
        const name = (p.name || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const cat = (p.category?.name || "").toLowerCase();
        const matchesCategory =
          selectedCategory === "All" || cat === selectedCategory.toLowerCase();
        const matchesText =
          name.includes(trimmedQuery) ||
          desc.includes(trimmedQuery) ||
          cat.includes(trimmedQuery);
        return matchesCategory && matchesText;
      })
      .sort((a, b) => {
        const aNameStarts = (a.name || "").toLowerCase().startsWith(trimmedQuery) ? 1 : 0;
        const bNameStarts = (b.name || "").toLowerCase().startsWith(trimmedQuery) ? 1 : 0;
        if (aNameStarts !== bNameStarts) return bNameStarts - aNameStarts;

        const aNameHas = (a.name || "").toLowerCase().includes(trimmedQuery) ? 1 : 0;
        const bNameHas = (b.name || "").toLowerCase().includes(trimmedQuery) ? 1 : 0;
        if (aNameHas !== bNameHas) return bNameHas - aNameHas;

        return 0;
      })
      .slice(0, 6);
  }, [products, trimmedQuery, selectedCategory]);

  const executeSearch = (searchTerm: string) => {
    const finalQuery = searchTerm.trim();
    if (!finalQuery) return;

    // Save to Redux & Database (for registered user) or localStorage (guest)
    dispatch(saveSearchQuery({ query: finalQuery, isLoggedIn }));

    setIsOpen(false);
    if (onSearchComplete) onSearchComplete();

    const catQuery = selectedCategory !== "All" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
    navigate(`/shop?search=${encodeURIComponent(finalQuery)}${catQuery}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    executeSearch(query);
  };

  const handleProductSelect = (product: Product) => {
    dispatch(saveSearchQuery({ query: product.name, isLoggedIn }));
    setIsOpen(false);
    if (onSearchComplete) onSearchComplete();
    navigate(getProductUrl(product.id));
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, id: string, term: string) => {
    e.stopPropagation();
    dispatch(removeSearchRecord({ id, query: term, isLoggedIn }));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(clearAllSearches(isLoggedIn));
  };

  const handleClearInput = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      {/* Search Form Bar - Amazon App Style */}
      <form
        onSubmit={handleFormSubmit}
        className={`flex items-center w-full bg-white transition-all duration-200 overflow-hidden shadow-xs h-10 ${
          isMobile
            ? "rounded-xl border border-slate-200 shadow-sm"
            : "rounded-lg border border-slate-300"
        } ${
          isOpen
            ? "border-[#0ea9df] ring-2 ring-[#0ea9df]/20"
            : "hover:border-slate-400"
        }`}
      >
        {/* Left Search Icon */}
        <div className="pl-3.5 pr-1 flex items-center justify-center shrink-0 text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) handleFocus();
          }}
          onFocus={handleFocus}
          onClick={handleFocus}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={t("searchPlaceholder") || "Search Luvars Fashion..."}
          className="flex-1 px-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-white font-normal h-full min-w-0"
          autoComplete="off"
          aria-label="Search"
        />

        {/* Clear input button when text is present */}
        {query && (
          <button
            type="button"
            onClick={handleClearInput}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0 mr-1"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Right Search Button */}
        {isMobile ? (
          <button
            type="submit"
            className="h-full px-3 text-[#0ea9df] hover:text-[#0c93c4] active:scale-95 flex items-center justify-center cursor-pointer transition-transform shrink-0"
            aria-label="Submit Search"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            className="h-full px-4 bg-[#0ea9df] hover:bg-[#0c93c4] active:bg-[#0a7fa8] text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Submit Search"
          >
            <Search className="w-4 h-4 text-white" />
          </button>
        )}
      </form>

      {/* Interactive Live Search Dropdown */}
      {isOpen && (trimmedQuery || recentSearches.length > 0) && (
        <div
          className={`absolute left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden animation-fade-in ${
            isMobile ? "max-h-[75vh]" : "max-h-[480px]"
          } flex flex-col`}
        >
          {/* STATE 1: User hasn't typed yet - Show Recent Searches */}
          {!trimmedQuery ? (
            recentSearches.length > 0 ? (
              <div className="p-3.5 overflow-y-auto">
                <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0ea9df]" />
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors cursor-pointer"
                  >
                    Clear history
                  </button>
                </div>

                <div className="space-y-0.5">
                  {recentSearches.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setQuery(item.query);
                        executeSearch(item.query);
                      }}
                      className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0ea9df] shrink-0 transition-colors" />
                        <span className="text-sm font-medium text-gray-800 group-hover:text-[#191142] truncate">
                          {item.query}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveRecentSearch(e, item.id, item.query)}
                        className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-200/60 rounded-full transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                        title="Remove from history"
                        aria-label={`Remove ${item.query} from history`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          ) : (
            /* STATE 2: User is typing - Live Results */
            <div className="flex flex-col overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-600">
                <span>Products ({matchingProducts.length})</span>
              </div>

              <div className="overflow-y-auto max-h-[340px] divide-y divide-gray-100">
                {matchingProducts.length > 0 ? (
                  matchingProducts.map((product) => {
                    const thumb =
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : "/placeholder-mattress.png";

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="group flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                          <img
                            src={thumb}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/logo-transparent.png";
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-[#0ea5e9] truncate transition-colors">
                            {product.name || "Untitled Product"}
                          </h4>
                          {product.category?.name && (
                            <p className="text-[11px] text-gray-500 truncate">
                              {product.category.name}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 px-4 text-center">
                    <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">
                      No matching products found
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Try searching with different keywords or check spelling.
                    </p>
                  </div>
                )}
              </div>

              {/* View all results footer link */}
              <div className="border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => executeSearch(query)}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-[#0ea5e9] hover:bg-cyan-50/60 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>
                    See all results for &quot;<strong>{query}</strong>&quot;
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#0ea5e9]" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
