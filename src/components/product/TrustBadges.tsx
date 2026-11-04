import { RotateCcw, Truck, ShieldCheck, Award } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface TrustBadgesProps {
  variant?: "grid" | "inline";
  className?: string;
}

export default function TrustBadges({ variant = "grid", className = "" }: TrustBadgesProps) {
  const { t } = useLanguage();

  const guarantees = [
    { icon: RotateCcw, label: t("guaranteeReplacement") },
    { icon: Truck, label: t("guaranteeDelivery") },
    { icon: ShieldCheck, label: t("guaranteeWarranty") },
    { icon: Award, label: t("guaranteeTopBrand") },
  ];

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-3 text-xs text-gray-600 ${className}`}>
        {guarantees.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-1 font-medium">
              <Icon className="w-3.5 h-3.5 text-[#0ea9df]" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-4 gap-2 text-center py-2.5 border-t border-b border-gray-100 ${className}`}>
      {guarantees.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="flex flex-col items-center space-y-1 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-[#0ea9df] group-hover:bg-[#0ea9df] group-hover:text-white transition-colors">
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-gray-700 font-medium group-hover:text-[#0ea9df] leading-tight">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
