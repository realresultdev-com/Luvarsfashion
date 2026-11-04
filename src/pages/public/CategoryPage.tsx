import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import { decryptId } from "../../utils/urlSecurity";
import type { Product, Category } from "../../types/product.types";
import ProductCard from "../../components/product/ProductCard";
import { ChevronRight } from "lucide-react";

export default function CategoryPage() {
  const { id: urlParamId } = useParams<{ id: string }>();
  const id = decryptId(urlParamId || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getAll(id),
          categoryService.getAll(),
        ]);
        const pList = Array.isArray(prodRes?.data) ? prodRes.data : [];
        setProducts(pList);
        const cList = Array.isArray(catRes?.data) ? catRes.data : [];
        const current = cList.find((c: Category) => c.id === id);
        setCategory(current || null);
      } catch (err) {
        console.error("Failed to load category products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-16 bg-white min-h-screen">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-gray-500 flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
        <Link to="/" className="hover:text-black hover:underline font-medium">
          Buddy Mattress
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
        <span className="text-gray-900 font-semibold">
          {category ? category.name : "Sleep Collection"}
        </span>
      </nav>

      {/* Header */}
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {category ? category.name : "Sleep Collection"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-gray-200 p-3 rounded-lg space-y-2 animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-md" />
              <div className="h-3.5 bg-gray-100 w-3/4 rounded" />
              <div className="h-3 bg-gray-100 w-1/2 rounded" />
              <div className="h-8 bg-gray-100 rounded-md" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-gray-600 font-medium text-sm">
            No products currently available in this category.
          </p>
          <Link
            to="/shop"
            className="inline-block py-2 px-4 rounded-md bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
          >
            Explore All Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
