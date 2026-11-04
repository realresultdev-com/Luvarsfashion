export function LuvarsLogo({
  isDark = false,
  className = "",
}: {
  isDark?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem: Stylized Modern 'L' Diamond Badge */}
      <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-sky-500/25 border border-sky-300/40 shrink-0 transform transition-transform hover:scale-105">
        <span className="font-black text-white text-lg sm:text-xl tracking-tighter leading-none drop-shadow-xs">
          L
        </span>
        {/* Subtle accent dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900 shadow-xs" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none justify-center">
        <span
          className={`font-black text-base sm:text-xl tracking-wider ${
            isDark ? "text-slate-900" : "text-white"
          }`}
          style={{ letterSpacing: "0.08em" }}
        >
          LUVARS
        </span>
        <span
          className="text-[9px] sm:text-[10px] font-black text-[#38bdf8] uppercase tracking-[0.28em] mt-0.5"
        >
          FASHION
        </span>
      </div>
    </div>
  );
}

export default LuvarsLogo;

