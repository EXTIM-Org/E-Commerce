"use client";

import { useCallback, useEffect, useState, useTransition, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Filter, ChevronDown, Check } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "همه نظرات" },
  { value: "unanswered", label: "بدون پاسخ" },
  { value: "answered", label: "پاسخ داده شده" },
];

const RATING_OPTIONS = [
  { value: "", label: "همه امتیازها" },
  { value: "5", label: "۵ ستاره (عالی)" },
  { value: "4", label: "۴ ستاره (خوب)" },
  { value: "3", label: "۳ ستاره (متوسط)" },
  { value: "2", label: "۲ ستاره (ضعیف)" },
  { value: "1", label: "۱ ستاره (بد)" },
];

const VERIFIED_OPTIONS = [
  { value: "", label: "همه کاربران" },
  { value: "true", label: "فقط خریداران تایید شده" },
  { value: "false", label: "سایر کاربران" },
];

function FilterDropdown({ 
  label, 
  value, 
  options, 
  onChange 
}: { 
  label: string; 
  value: string; 
  options: {value: string; label: string}[]; 
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
     
  }, []);

  const toggleDropdown = () => {
    if (!isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setPosition(spaceBelow < 250 ? "top" : "bottom");
    }
    setIsOpen(!isOpen);
  };

  const selectedLabel = options.find(o => o.value === value)?.label || options[0].label;

  return (
    <div>
      <label className="text-sm text-gray-700 dark:text-gray-400 mb-2 block">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <button
          ref={btnRef}
          type="button"
          onClick={toggleDropdown}
          className="w-full flex items-center justify-between bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
        >
          <span>{selectedLabel}</span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
        
        {isOpen && (
          <div className={`absolute left-0 right-0 z-50 overflow-hidden bg-white dark:bg-[#1a1b26] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl duration-200 ${
            position === "top" ? "bottom-full mb-2 origin-bottom animate-in fade-in zoom-in-95" : "top-full mt-2 origin-top animate-in fade-in zoom-in-95"
          }`}>
            <div className="flex flex-col py-2 max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/10 ${
                    value === opt.value
                      ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {opt.label}
                  {value === opt.value && <Check className="w-4 h-4 text-violet-500" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ReviewFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for instant UI updates before debouncing
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [verified, setVerified] = useState(searchParams.get("verified") || "");

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
      if (query !== (searchParams.get("q") || "")) {
        applyFilters({ q: query });
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSelectChange = (name: string, value: string) => {
    if (name === "status") setStatus(value);
    if (name === "rating") setRating(value);
    if (name === "verified") setVerified(value);
    
    applyFilters({ [name]: value });
  };

  return (
    <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md mb-8">
      <div className="flex items-center gap-2 mb-6 text-violet-600 dark:text-violet-400 font-bold text-lg">
        <Filter className="w-5 h-5" />
        <h3>فیلتر و جستجوی نظرات</h3>
        {isPending && (
          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-4"></div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative col-span-1 md:col-span-2 lg:col-span-2">
          <label className="text-sm text-gray-700 dark:text-gray-400 mb-2 block">جستجو متنی</label>
          <div className="relative">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="متن، محصول، نام، ایمیل یا موبایل کاربر..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl py-3 pr-12 pl-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
            />
          </div>
        </div>

        <FilterDropdown
          label="وضعیت پاسخ"
          value={status}
          options={STATUS_OPTIONS}
          onChange={(val) => handleSelectChange("status", val)}
        />

        <FilterDropdown
          label="امتیاز"
          value={rating}
          options={RATING_OPTIONS}
          onChange={(val) => handleSelectChange("rating", val)}
        />

        <FilterDropdown
          label="وضعیت خریدار"
          value={verified}
          options={VERIFIED_OPTIONS}
          onChange={(val) => handleSelectChange("verified", val)}
        />
      </div>
    </div>
  );
}
