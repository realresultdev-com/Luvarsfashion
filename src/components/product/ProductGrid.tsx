import ProductCard from "./ProductCard";
import type { Product } from "../../types/product.types";
import { PackageOpen } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-4 space-y-3 animate-pulse shadow-2xs"
          >
            <div className="aspect-square bg-gray-100 rounded-md" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-100 rounded w-1/3" />
              <div className="h-8 w-20 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-lg border border-gray-200 bg-white shadow-2xs">
        <PackageOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-base font-bold text-gray-900">No results found</h3>
        <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
          Try checking your spelling or use more general terms to find products in our catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
