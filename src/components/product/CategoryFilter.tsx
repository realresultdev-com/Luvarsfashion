import type { Category } from "../../types/product.types";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory("")}
        className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shadow-2xs ${
          selectedCategory === ""
            ? "bg-amazon-btnYellow text-gray-900 border border-amazon-borderDark font-semibold shadow-xs"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
        }`}
      >
        All Departments
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shadow-2xs ${
            selectedCategory === cat.id
              ? "bg-amazon-btnYellow text-gray-900 border border-amazon-borderDark font-semibold shadow-xs"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
