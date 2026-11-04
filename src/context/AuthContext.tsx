import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "../types/user.types";
import { authService } from "../services/auth.service";
import { notificationService } from "../services/notification.service";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const res = await authService.me();
          const validUser = (res.data as any)?.user || res.data;
          setUser(validUser);
          // Sync device token on startup so native FCM push tokens stay linked
          notificationService.syncDeviceToken();
        } catch {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (u: User, t: string) => {
    const validUser = (u as any)?.user || u;
    setUser(validUser);
    setToken(t);
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(validUser));
    // Immediately ensure device token is synced with backend upon login
    notificationService.syncDeviceToken();
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    // Remove token and user session
    localStorage.removeItem("token");

    // Remove cart data
    localStorage.removeItem("cart_items");

    // Clean up all user-specific address and search keys
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("buddy_") ||
            key.startsWith("checkout_") ||
            key.startsWith("user_") ||
            key === "cart_items")
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error("Error clearing user storage on logout:", e);
    }

    // Dispatch global logout event so CartContext, Redux, and all subcomponents instantly clear
    window.dispatchEvent(new CustomEvent("auth:logout"));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
