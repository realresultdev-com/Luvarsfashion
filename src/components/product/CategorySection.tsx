import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Category, Product } from "../../types/product.types";
import ProductCard from "./ProductCard";

interface CategorySectionProps {
  category: Category;
  products: Product[];
  maxDisplay?: number;
}

export default function CategorySection({
  category,
  products,
  maxDisplay = 8,
}: CategorySectionProps) {
  if (!Array.isArray(products) || products.length === 0) return null;

  const displayProducts = products.slice(0, maxDisplay);

  return (
    <section className="space-y-4 my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1 border-b border-gray-200/80 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {category.name}
          </h2>
        </div>

        <Link
          to={`/catalog?category=${encodeURIComponent(category.name)}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 hover:text-black hover:underline transition-colors shrink-0"
        >
          <span>View All ({products.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
