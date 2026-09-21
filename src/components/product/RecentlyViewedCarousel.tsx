"use client";

import { useEffect, useState } from "react";
import { ProductCarousel } from "./ProductCarousel";
import { getProductsByIds } from "@/actions/recently-viewed";
import { Loader2 } from "lucide-react";

const RECENTLY_VIEWED_KEY = "extim_recent_products";

export function RecentlyViewedCarousel({ excludeProductId }: { excludeProductId?: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentlyViewed() {
      try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (!stored) {
          setLoading(false);
          return;
        }

        let ids: string[] = JSON.parse(stored);
        
        // Remove the current product if specified
        if (excludeProductId) {
          ids = ids.filter(id => id !== excludeProductId);
        }

        if (ids.length === 0) {
          setLoading(false);
          return;
        }

        const fetchedProducts = await getProductsByIds(ids);
        setProducts(fetchedProducts);
      } catch (e) {
        console.error("Failed to load recently viewed products", e);
      } finally {
        setLoading(false);
      }
    }

    loadRecentlyViewed();
  }, [excludeProductId]);

  if (loading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <ProductCarousel 
      title="بازدیدهای اخیر شما" 
      products={products}
    />
  );
}
