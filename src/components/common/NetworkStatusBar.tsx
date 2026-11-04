import { useState, useEffect } from "react";
import { Network } from "@capacitor/network";
import { WifiOff } from "lucide-react";

export default function NetworkStatusBar() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check initial network status
    Network.getStatus().then((status) => {
      if (mounted) setIsOnline(status.connected);
    }).catch(() => {});

    // Listen for connection changes
    const listener = Network.addListener("networkStatusChange", (status) => {
      if (!mounted) return;
      setIsOnline(status.connected);
    });

    return () => {
      mounted = false;
      listener.then((handle) => handle.remove()).catch(() => {});
    };
  }, []);

  if (isOnline) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed top-16 sm:top-20 inset-x-0 z-50 flex justify-center pointer-events-none px-4 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-medium pointer-events-auto">
        <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Offline mode • Showing cached videos & catalog</span>
      </div>
    </aside>
  );
}
