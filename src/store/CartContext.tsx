"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useTransition, useRef } from "react";
import toast from 'react-hot-toast';
import { 
  addToCartServer, 
  removeFromCartServer, 
  updateQuantityServer, 
  syncCartServer, 
  fetchUserCart 
} from "@/actions/cart";

export interface CartItem {
  id: string; // unique cart item id (usually variantId)
  productId: string;
  variantId: string;
  name: string;
  variantName: string | null;
  price: number;
  quantity: number;
  image: string;
  reservedAt?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'reservedAt'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isPending: boolean; // For showing loading states
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children, isLoggedIn }: { children: ReactNode, isLoggedIn: boolean }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPending, startTransition] = useTransition();
  const prevIsLoggedIn = useRef(isLoggedIn);

  // Handle logout transition
  useEffect(() => {
    if (prevIsLoggedIn.current === true && isLoggedIn === false) {
      setItems([]);
      localStorage.removeItem("extim_cart");
    }
    prevIsLoggedIn.current = isLoggedIn;
  }, [isLoggedIn]);

  // Load from server if logged in, else localStorage on mount
  useEffect(() => {
    const initializeCart = async () => {
      try {
        const stored = localStorage.getItem("extim_cart");
        let localItems: CartItem[] = [];
        if (stored) {
          localItems = JSON.parse(stored);
        }

        if (isLoggedIn) {
          // Sync local items to server if any
          if (localItems.length > 0) {
            const res = await syncCartServer(localItems.map(i => ({ variantId: i.variantId, quantity: i.quantity })));
            if (res.success && 'items' in res && res.items) {
              setItems(res.items);
              localStorage.removeItem("extim_cart"); // Clear local storage after sync
            }
          } else {
            // Just fetch
            const res = await fetchUserCart();
            if (res.success && 'items' in res && res.items) {
              setItems(res.items);
            }
          }
        } else {
          setItems(localItems);
        }
      } catch (e) {
        console.error("Failed to load cart", e);
      }
      setIsInitialized(true);
    };

    initializeCart();
  }, [isLoggedIn]);

  // Save to localStorage when items change ONLY if not logged in
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      localStorage.setItem("extim_cart", JSON.stringify(items));
    }
  }, [items, isInitialized, isLoggedIn]);

  const addToCart = useCallback((newItem: Omit<CartItem, 'quantity' | 'reservedAt'> & { quantity?: number }) => {
    const quantityToAdd = newItem.quantity || 1;
    
    startTransition(async () => {
      if (isLoggedIn) {
        const res = await addToCartServer(newItem.variantId, quantityToAdd);
        if (!res.success && !res.guest) {
          toast.error(res.error || "خطا در افزودن به سبد خرید");
          return;
        }
        
        // Optimistic UI update or wait for server
        const existing = items.find((i) => i.id === newItem.id);
        if (existing) {
          toast.success(`تعداد ${newItem.name} در سبد خرید افزایش یافت و رزرو شد.`);
          setItems(prev => prev.map((i) =>
            i.id === newItem.id ? { ...i, quantity: i.quantity + quantityToAdd, reservedAt: res.reservedAt || i.reservedAt } : i
          ));
        } else {
          toast.success(`${newItem.name} به سبد خرید اضافه و رزرو شد.`);
          setItems(prev => [...prev, { ...newItem, quantity: quantityToAdd, reservedAt: res.reservedAt }]);
        }
      } else {
        // Guest Behavior
        const existing = items.find((i) => i.id === newItem.id);
        if (existing) {
          toast.success(`تعداد ${newItem.name} در سبد خرید افزایش یافت.`);
          setItems(prev => prev.map((i) =>
            i.id === newItem.id ? { ...i, quantity: i.quantity + quantityToAdd } : i
          ));
        } else {
          toast.success(`${newItem.name} به سبد خرید اضافه شد.`);
          setItems(prev => [...prev, { ...newItem, quantity: quantityToAdd }]);
        }
      }
    });
  }, [items, isLoggedIn]);

  const removeFromCart = useCallback((id: string) => {
    startTransition(async () => {
      if (isLoggedIn) {
        await removeFromCartServer(id);
      }
      const existing = items.find((i) => i.id === id);
      if (existing) {
        toast.success(`${existing.name} از سبد خرید حذف شد.`);
        setItems(prev => prev.filter((i) => i.id !== id));
      }
    });
  }, [items, isLoggedIn]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    
    startTransition(async () => {
      if (isLoggedIn) {
        const res = await updateQuantityServer(id, quantity);
        if (!res.success && !res.guest) {
          toast.error(res.error || "موجودی کافی نیست.");
          return;
        }
        setItems(prev => prev.map((i) => (i.id === id ? { ...i, quantity, reservedAt: res.reservedAt || i.reservedAt } : i)));
      } else {
        setItems(prev => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
      }
      
      const existing = items.find((i) => i.id === id);
      if (existing && existing.quantity !== quantity) {
        const action = quantity > existing.quantity ? "افزایش" : "کاهش";
        toast.success(`تعداد در سبد خرید ${action} یافت.`);
      }
    });
  }, [items, isLoggedIn]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (!isLoggedIn) {
      localStorage.removeItem("extim_cart");
    }
  }, [isLoggedIn]);

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
        isPending,
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
