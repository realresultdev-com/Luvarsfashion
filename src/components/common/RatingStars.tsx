import { Star } from "lucide-react";

interface RatingStarsProps {
  rating?: number;
  maxStars?: number;
  count?: number | string;
  size?: "xs" | "sm" | "md";
  showCount?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
};

export default function RatingStars({
  rating = 4.8,
  maxStars = 5,
  count,
  size = "sm",
  showCount = true,
  className = "",
}: RatingStarsProps) {
  const iconClass = sizeClasses[size];

  return (
    <div className={`flex items-center gap-1.5 text-xs ${className}`}>
      <div className="flex text-amber-400">
        {Array.from({ length: maxStars }).map((_, i) => (
          <Star
            key={i}
            className={`${iconClass} ${
              i < Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : i < rating
                ? "fill-amber-200 text-amber-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="font-semibold text-gray-800 text-[11px]">
        {rating.toFixed(1)}
      </span>
      {showCount && count && (
        <span className="text-[#0ea9df] hover:underline cursor-pointer text-[11px]">
          ({count} reviews)
        </span>
      )}
    </div>
  );
}
