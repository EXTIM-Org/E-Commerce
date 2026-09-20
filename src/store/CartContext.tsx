"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import toast from 'react-hot-toast';

export interface CartItem {
  id: string; // unique cart item id (usually variantId)
  productId: string;
  variantId: string;
  name: string;
  variantName: string | null;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("extim_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from local storage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("extim_cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = useCallback((newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantityToAdd = newItem.quantity || 1;
    
    const existing = items.find((i) => i.id === newItem.id);
    
    if (existing) {
      toast.success(`تعداد ${newItem.name} در سبد خرید افزایش یافت.`);
      setItems(items.map((i) =>
        i.id === newItem.id ? { ...i, quantity: i.quantity + quantityToAdd } : i
      ));
    } else {
      toast.success(`${newItem.name} به سبد خرید اضافه شد.`);
      setItems([...items, { ...newItem, quantity: quantityToAdd }]);
    }
  }, [items]);

  const removeFromCart = useCallback((id: string) => {
    const existing = items.find((i) => i.id === id);
    if (existing) {
      toast.success(`${existing.name} از سبد خرید حذف شد.`);
      setItems(items.filter((i) => i.id !== id));
    }
  }, [items]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    const existing = items.find((i) => i.id === id);
    if (existing) {
      if (existing.quantity !== quantity) {
        const action = quantity > existing.quantity ? "افزایش" : "کاهش";
        toast.success(`تعداد ${existing.name} در سبد خرید ${action} یافت.`);
        setItems(items.map((i) => (i.id === id ? { ...i, quantity } : i)));
      }
    }
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
