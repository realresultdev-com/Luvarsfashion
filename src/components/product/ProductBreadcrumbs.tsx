import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getCategoryUrl } from "../../utils/urlSecurity";

interface ProductBreadcrumbsProps {
  categoryName?: string;
  categoryId?: string;
  productName: string;
  className?: string;
}

export default function ProductBreadcrumbs({
  categoryName = "Sleep Collection",
  categoryId,
  productName,
  className = "",
}: ProductBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-xs text-gray-500 flex items-center gap-1.5 flex-wrap ${className}`}
    >
      <Link to="/" className="text-[#0ea9df] hover:underline font-semibold">
        Luvars Fashion
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      {categoryId ? (
        <Link
          to={getCategoryUrl(categoryId)}
          className="hover:text-[#0ea9df] hover:underline cursor-pointer font-medium"
        >
          {categoryName}
        </Link>
      ) : (
        <span className="text-gray-600 font-medium">{categoryName}</span>
      )}
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <span className="text-gray-800 font-semibold truncate max-w-xs sm:max-w-md">
        {productName}
      </span>
    </nav>
  );
}
