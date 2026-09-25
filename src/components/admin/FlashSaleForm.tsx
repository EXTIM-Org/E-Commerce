"use client";

import { useState, useRef, useEffect } from "react";
import { createFlashSale } from "@/actions/flashSale";
import { Save, ChevronDown, Check, Calendar } from "lucide-react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import dynamic from "next/dynamic";
import type { DateObject } from "react-multi-date-picker";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import { useTheme } from "next-themes";

const DatePicker = dynamic(() => import("react-multi-date-picker"), { ssr: false });
const TimePicker = dynamic(() => import("react-multi-date-picker/plugins/time_picker"), { ssr: false });

type ProductInfo = {
  id: string;
  name: string;
  basePrice: number;
};

interface FlashSaleFormProps {
  products: ProductInfo[];
}

export function FlashSaleForm({ products }: FlashSaleFormProps) {
  const [startTime, setStartTime] = useState<DateObject | null>(null);
  const [endTime, setEndTime] = useState<DateObject | null>(null);
  const [productId, setProductId] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedProduct = products.find(p => p.id === productId);
  
  const parsedDiscount = parseFloat(discountPercent) || 0;
  const basePrice = selectedProduct?.basePrice || 0;
  const finalPrice = Math.max(0, basePrice - (basePrice * parsedDiscount) / 100);

  return (
    <form action={createFlashSale} className="flex flex-col gap-6">
      
      <div className="flex flex-col gap-2" ref={dropdownRef}>
        <label className="font-medium text-gray-700 dark:text-gray-300">محصول مورد نظر</label>
        
        <div className="relative w-full">
          {/* Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
          >
            <span className={selectedProduct ? "text-gray-900 dark:text-white" : "text-gray-500"}>
              {selectedProduct ? selectedProduct.name : "-- انتخاب محصول --"}
            </span>
            <ChevronDown className={`w-4 h-4 opacity-70 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden bg-white/90 dark:bg-[#1a1b26]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl duration-200 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
              <div className="flex flex-col py-1">
                {products.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">هیچ محصولی یافت نشد</div>
                ) : (
                  products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProductId(p.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
                        productId === p.id 
                          ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10" 
                          : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {p.name}
                      {productId === p.id && <Check className="w-4 h-4 text-violet-500" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Hidden input for form submission */}
        <input type="hidden" name="productId" value={productId} required />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="discountPercent" className="font-medium text-gray-700 dark:text-gray-300">درصد تخفیف</label>
        <input 
          type="number" 
          name="discountPercent" 
          id="discountPercent" 
          min="1" 
          max="99" 
          required
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          placeholder="مثلاً 20"
          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>

      {selectedProduct && parsedDiscount > 0 && (
        <div className="bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 p-4 rounded-xl flex items-center justify-between">
          <span className="font-medium">قیمت شگفت‌انگیز نهایی:</span>
          <span className="text-xl font-bold">{finalPrice.toLocaleString('fa-IR')} تومان</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700 dark:text-gray-300">زمان شروع</label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <DatePicker
              value={startTime}
              onChange={(date: any) => setStartTime(date)}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              format="YYYY/MM/DD HH:mm"
              plugins={[
                <TimePicker key="timepicker" position="bottom" />
              ]}
              className={resolvedTheme === "dark" ? "bg-dark" : ""}
              inputClass="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 pl-12 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
              containerClassName="w-full"
              placeholder="انتخاب زمان شروع..."
            />
          </div>
          <input 
            type="hidden" 
            name="startTime" 
            value={startTime ? startTime.toDate().toISOString() : ""} 
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700 dark:text-gray-300">زمان پایان</label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <DatePicker
              value={endTime}
              onChange={(date: any) => setEndTime(date)}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              format="YYYY/MM/DD HH:mm"
              plugins={[
                <TimePicker key="timepicker" position="bottom" />
              ]}
              className={resolvedTheme === "dark" ? "bg-dark" : ""}
              inputClass="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 pl-12 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
              containerClassName="w-full"
              placeholder="انتخاب زمان پایان..."
            />
          </div>
          <input 
            type="hidden" 
            name="endTime" 
            value={endTime ? endTime.toDate().toISOString() : ""} 
          />
        </div>
      </div>

      <button 
        type="submit"
        className="mt-4 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all"
      >
        <Save className="w-5 h-5" />
        ثبت کمپین فروش ویژه
      </button>

    </form>
  );
}
