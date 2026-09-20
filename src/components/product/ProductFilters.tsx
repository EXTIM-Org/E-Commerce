"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for instant UI updates before debouncing
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const applyFilters = (updates: Record<string, string | null>) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(updates)}`, { scroll: false });
    });
  };

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query !== searchParams.get("q")) {
        applyFilters({ q: query });
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Debounced Price Range
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (minPrice !== (searchParams.get("minPrice") || "") || maxPrice !== (searchParams.get("maxPrice") || "")) {
        applyFilters({ minPrice, maxPrice });
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [minPrice, maxPrice]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md sticky top-28">
      <div className="flex items-center gap-2 mb-6 text-purple-400 font-bold text-lg">
        <SlidersHorizontal className="w-5 h-5" />
        <h3>فیلتر محصولات</h3>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <label className="text-sm text-gray-400 mb-2 block">جستجو</label>
          <div className="relative">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="نام محصول..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">دسته‌بندی</label>
          <div className="relative">
            <select
              value={searchParams.get("category") || ""}
              onChange={(e) => applyFilters({ category: e.target.value })}
              className="w-full appearance-none bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-zinc-900">همه دسته‌ها</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug} className="bg-zinc-900">
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">محدوده قیمت (تومان)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="از"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-white text-center focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="تا"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-white text-center focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">مرتب‌سازی بر اساس</label>
          <div className="relative">
            <select
              value={searchParams.get("sort") || "newest"}
              onChange={(e) => applyFilters({ sort: e.target.value })}
              className="w-full appearance-none bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all cursor-pointer"
            >
              <option value="newest" className="bg-zinc-900">جدیدترین</option>
              <option value="popular" className="bg-zinc-900">محبوب‌ترین</option>
              <option value="price_asc" className="bg-zinc-900">ارزان‌ترین</option>
              <option value="price_desc" className="bg-zinc-900">گران‌ترین</option>
            </select>
            <ChevronDown className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
      </div>
      
      {isPending && (
        <div className="absolute top-4 left-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
        </div>
      )}
    </div>
  );
}
