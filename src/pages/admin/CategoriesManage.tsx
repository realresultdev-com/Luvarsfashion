import { useState, useEffect } from "react";
import { categoryService } from "../../services/category.service";
import type { Category } from "../../types/product.types";
import Loader from "../../components/common/Loader";
import { Plus, Trash2, AlertCircle, Edit2, X, Check } from "lucide-react";

export default function CategoriesManage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatPrefix, setNewCatPrefix] = useState("Starting");
  const [newCatValue, setNewCatValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrefix, setEditPrefix] = useState("");
  const [editValue, setEditValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll(true);
      setCategories(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await categoryService.create({
        name: newCatName.trim(),
        offer_badge_prefix: newCatPrefix.trim() || "Starting",
        offer_badge_value: newCatValue.trim(),
      });
      setCategories((prev) => [...prev, res.data]);
      setNewCatName("");
      setNewCatPrefix("Starting");
      setNewCatValue("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingCat(cat);
    setEditName(cat.name);
    setEditPrefix(cat.offer_badge_prefix ?? "Starting");
    setEditValue(cat.offer_badge_value ?? "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editName.trim()) return;
    setSavingEdit(true);
    try {
      const res = await categoryService.update(editingCat.id, {
        name: editName.trim(),
        offer_badge_prefix: editPrefix.trim() || "Starting",
        offer_badge_value: editValue.trim(),
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCat.id ? { ...c, ...res.data } : c))
      );
      setEditingCat(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update category");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await categoryService.remove(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  if (loading) return <Loader text="Loading categories..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Categories</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {categories.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage store departments and promotional badge settings.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Category Form */}
      <form
        onSubmit={handleAdd}
        className="p-4 rounded-lg border border-gray-200 bg-white shadow-2xs space-y-4"
      >
        <h2 className="text-sm font-semibold text-gray-900">Add New Category</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mattresses"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black focus:ring-0 outline-none bg-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Badge Prefix
            </label>
            <input
              type="text"
              placeholder="Starting"
              value={newCatPrefix}
              onChange={(e) => setNewCatPrefix(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black focus:ring-0 outline-none bg-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Badge Value
            </label>
            <input
              type="text"
              placeholder="Dynamic (Min Price)"
              value={newCatValue}
              onChange={(e) => setNewCatValue(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black focus:ring-0 outline-none bg-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Badge Tag:</span>
            <span className="font-medium px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-800 rounded-md text-[11px]">
              {newCatPrefix || "Starting"} {newCatValue || "(Dynamic Min Price)"}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </form>

      {/* Categories Table */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Badge Offer</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-900">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    No categories created yet.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900 text-xs">
                      {cat.name}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 font-medium text-[11px] text-gray-800">
                        {cat.offer_badge_prefix || "Starting"}:{" "}
                        <strong className="text-gray-900 font-semibold">
                          {cat.offer_badge_value || "Dynamic (Min Price)"}
                        </strong>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">
                Edit Category
              </h3>
              <button
                onClick={() => setEditingCat(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Badge Prefix
                  </label>
                  <input
                    type="text"
                    value={editPrefix}
                    placeholder="Starting"
                    onChange={(e) => setEditPrefix(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Badge Value
                  </label>
                  <input
                    type="text"
                    value={editValue}
                    placeholder="e.g. ₹7,999"
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-3 py-1.5 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-1 px-4 py-1.5 bg-black hover:bg-gray-800 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{savingEdit ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
