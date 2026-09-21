"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

export function ProductFilters({ categories }: { categories: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentCategory = searchParams.get("category") || "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("?" + createQueryString("q", q));
  };

  const handleCategoryChange = (categoryId: string) => {
    router.push("?" + createQueryString("category", categoryId));
    setIsCategoryOpen(false);
  };

  const selectedCategory = categories.find((c) => c.id === currentCategory);

  return (
    <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      <form onSubmit={handleSearch} className="relative w-full md:w-96">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجوی نام محصول..."
          className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500">
          <Search className="w-5 h-5" />
        </button>
      </form>

      <div className="w-full md:w-64 relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="w-full flex items-center justify-between bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white"
        >
          <span className={currentCategory ? "text-gray-900 dark:text-white" : "text-gray-500"}>
            {currentCategory && selectedCategory ? selectedCategory.name : "همه دسته‌بندی‌ها"}
          </span>
          <ChevronDown className={`w-4 h-4 opacity-70 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isCategoryOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden bg-white/95 dark:bg-[#1a1b26]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl duration-200 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
            <div className="flex flex-col py-1">
              <button
                type="button"
                onClick={() => handleCategoryChange("")}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
                  currentCategory === "" 
                    ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10" 
                    : "text-gray-700 dark:text-gray-200"
                }`}
              >
                همه دسته‌بندی‌ها
                {currentCategory === "" && <Check className="w-4 h-4 text-violet-500" />}
              </button>
              
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategoryChange(c.id)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
                    currentCategory === c.id 
                      ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10" 
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {c.name}
                  {currentCategory === c.id && <Check className="w-4 h-4 text-violet-500" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
