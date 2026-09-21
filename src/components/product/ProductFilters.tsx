"use client";

import { useCallback, useEffect, useState, useTransition, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "popular", label: "محبوب‌ترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
];

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for instant UI updates before debouncing
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // Custom dropdown states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categoryPosition, setCategoryPosition] = useState<"bottom" | "top">("bottom");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortPosition, setSortPosition] = useState<"bottom" | "top">("bottom");
  const categoryRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const categoryBtnRef = useRef<HTMLButtonElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
     
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Debounced Price Range
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (minPrice !== (searchParams.get("minPrice") || "") || maxPrice !== (searchParams.get("maxPrice") || "")) {
        applyFilters({ minPrice, maxPrice });
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice]);

  const currentCategory = searchParams.get("category") || "";
  const categoryLabel = currentCategory 
    ? categories.find(c => c.slug === currentCategory)?.name || "همه دسته‌ها"
    : "همه دسته‌ها";

  const currentSort = searchParams.get("sort") || "newest";
  const sortLabel = SORT_OPTIONS.find(o => o.value === currentSort)?.label || "جدیدترین";

  const toggleCategoryDropdown = () => {
    if (!isCategoryOpen && categoryBtnRef.current) {
      const rect = categoryBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setCategoryPosition(spaceBelow < 250 ? "top" : "bottom");
    }
    setIsCategoryOpen(!isCategoryOpen);
  };

  const toggleSortDropdown = () => {
    if (!isSortOpen && sortBtnRef.current) {
      const rect = sortBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setSortPosition(spaceBelow < 250 ? "top" : "bottom");
    }
    setIsSortOpen(!isSortOpen);
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md sticky top-28 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-2 mb-6 text-purple-600 dark:text-purple-400 font-bold text-lg">
        <SlidersHorizontal className="w-5 h-5" />
        <h3>فیلتر محصولات</h3>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <label className="text-sm text-gray-700 dark:text-gray-400 mb-2 block">جستجو</label>
          <div className="relative">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="نام محصول..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl py-3 pr-12 pl-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Category Custom Dropdown */}
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-400 mb-2 block">دسته‌بندی</label>
          <div className="relative" ref={categoryRef}>
            <button
              ref={categoryBtnRef}
              type="button"
              onClick={toggleCategoryDropdown}
              className="w-full flex items-center justify-between bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            >
              <span>{categoryLabel}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isCategoryOpen && (
              <div className={`absolute left-0 right-0 z-50 overflow-hidden bg-white dark:bg-[#1a1b26] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl duration-200 ${
                categoryPosition === "top" ? "bottom-full mb-2 origin-bottom animate-in fade-in zoom-in-95" : "top-full mt-2 origin-top animate-in fade-in zoom-in-95"
              }`}>
                <div className="flex flex-col py-2 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      applyFilters({ category: "" });
                      setIsCategoryOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/10 ${
                      currentCategory === ""
                        ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    همه دسته‌ها
                    {currentCategory === "" && <Check className="w-4 h-4 text-purple-500" />}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        applyFilters({ category: cat.slug });
                        setIsCategoryOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/10 ${
                        currentCategory === cat.slug
                          ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {cat.name}
                      {currentCategory === cat.slug && <Check className="w-4 h-4 text-purple-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-400 mb-2 block">محدوده قیمت (تومان)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="از"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white text-center focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
            <span className="text-gray-400 dark:text-gray-500">-</span>
            <input
              type="number"
              placeholder="تا"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white text-center focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Sort Custom Dropdown */}
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-400 mb-2 block">مرتب‌سازی بر اساس</label>
          <div className="relative" ref={sortRef}>
            <button
              ref={sortBtnRef}
              type="button"
              onClick={toggleSortDropdown}
              className="w-full flex items-center justify-between bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            >
              <span>{sortLabel}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isSortOpen && (
              <div className={`absolute left-0 right-0 z-50 overflow-hidden bg-white dark:bg-[#1a1b26] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl duration-200 ${
                sortPosition === "top" ? "bottom-full mb-2 origin-bottom animate-in fade-in zoom-in-95" : "top-full mt-2 origin-top animate-in fade-in zoom-in-95"
              }`}>
                <div className="flex flex-col py-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        applyFilters({ sort: opt.value });
                        setIsSortOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/10 ${
                        currentSort === opt.value
                          ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {opt.label}
                      {currentSort === opt.value && <Check className="w-4 h-4 text-purple-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
