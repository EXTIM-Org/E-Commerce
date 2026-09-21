"use client";

import { useEffect } from "react";

const RECENTLY_VIEWED_KEY = "extim_recent_products";
const MAX_ITEMS = 15;

export function RecentlyViewedTracker({ productId }: { productId: string }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let ids: string[] = stored ? JSON.parse(stored) : [];

      // Remove the product if it already exists to move it to the front
      ids = ids.filter(id => id !== productId);

      // Add to front
      ids.unshift(productId);

      // Keep only max items
      if (ids.length > MAX_ITEMS) {
        ids = ids.slice(0, MAX_ITEMS);
      }

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
    } catch (e) {
      console.error("Failed to track recently viewed product", e);
    }
  }, [productId]);

  return null; // Invisible component
}
