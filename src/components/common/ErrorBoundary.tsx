import { useRouteError, Link } from "react-router-dom";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function ErrorBoundary() {
  const error = useRouteError() as { statusText?: string; message?: string };
  console.error("Route Error:", error);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#191142]">Something went wrong</h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            {error?.message || error?.statusText || "An unexpected application error occurred while loading this page."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0ea9df] hover:bg-[#0c93c4] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Page</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#191142] hover:bg-[#281c62] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
