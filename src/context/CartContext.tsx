import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { CartItem } from "../types/product.types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart_items");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("cart_items", JSON.stringify(items));
    } else {
      localStorage.removeItem("cart_items");
    }
  }, [items]);

  // Completely wipe cart when user logs out
  useEffect(() => {
    const handleLogout = () => {
      setItems([]);
      localStorage.removeItem("cart_items");
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const addItem = (item: CartItem) => {
    // Unregistered / unauthenticated users cannot hold or add items to cart
    if (!localStorage.getItem("token")) {
      return;
    }

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && (i.color || "") === (item.color || "")
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && (i.color || "") === (item.color || "")
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: string, color?: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === productId &&
            (color === undefined || (i.color || "") === (color || ""))
          )
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeItem(productId, color);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId &&
        (color === undefined || (i.color || "") === (color || ""))
          ? { ...i, quantity }
          : i
      )
    );
  };


  const clearCart = () => setItems([]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
