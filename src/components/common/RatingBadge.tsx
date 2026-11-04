interface RatingBadgeProps {
  rating?: number | null;
  reviewCount?: number | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  showCount?: boolean;
}

export default function RatingBadge({
  rating,
  reviewCount,
  size = "md",
  className = "",
  onClick,
  showCount = true,
}: RatingBadgeProps) {
  const count = reviewCount ?? 0;
  if (!rating || count <= 0) {
    return null;
  }

  const displayRating = Number(rating).toFixed(1);

  const sizeClasses = {
    xs: {
      container: "text-xs gap-1",
      starText: "text-xs",
      scoreText: "text-xs font-bold",
    },
    sm: {
      container: "text-xs gap-1.5",
      starText: "text-sm",
      scoreText: "text-xs font-bold",
    },
    md: {
      container: "text-sm gap-1.5",
      starText: "text-base",
      scoreText: "text-sm font-extrabold",
    },
    lg: {
      container: "text-base gap-2",
      starText: "text-lg",
      scoreText: "text-base font-black",
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 select-none ${
        sizeClasses.container
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* Rating Score in Normal Text Color */}
      <span className={`text-[#191142] tracking-tight leading-none ${sizeClasses.scoreText}`}>
        {displayRating}
      </span>

      {/* Brand Cyan Star (#0ea9df) */}
      <span className={`text-[#0ea9df] leading-none select-none font-black ${sizeClasses.starText}`}>
        ★
      </span>

      {/* Review Count in Parentheses */}
      {showCount && (
        <span className="text-[#007185] font-normal leading-none">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
