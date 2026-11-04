import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../../services/product.service";
import { getProductUrl } from "../../utils/urlSecurity";
import type { Product } from "../../types/product.types";
import Loader from "../../components/common/Loader";
import { Plus, Search, Edit2, Trash2, ExternalLink } from "lucide-react";

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadProducts = async () => {
    try {
      const res = await productService.getAll();
      setProducts(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await productService.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader text="Loading products..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {products.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your product inventory, pricing, and details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black focus:ring-0 outline-none bg-white placeholder:text-gray-400 shadow-2xs"
            />
          </div>

          {/* Add Product Button */}
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors shrink-0 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Clean Human Table Container */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-900">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No products found matching "{search}"
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const img =
                    product.images?.[0] ||
                    "/logo-transparent.png";

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={img}
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover bg-gray-50 border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-xs truncate">
                            {product.name}
                          </p>
                          {product.is_trending && (
                            <span className="text-[10px] text-gray-500 font-normal">
                              (Trending)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-normal">
                        {product.category?.name || "General"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        ₹{product.price.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-normal">
                        {product.stock > 0 ? (
                          <span>{product.stock} in stock</span>
                        ) : (
                          <span className="text-red-600 font-medium">Out of stock</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <Link
                            to={getProductUrl(product.id)}
                            target="_blank"
                            className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
                            title="View on storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
