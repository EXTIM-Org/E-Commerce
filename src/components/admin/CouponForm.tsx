"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { createCoupon } from "@/actions/coupon";
import { Save, Loader2, ChevronDown, Check, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import dynamic from "next/dynamic";
import type { DateObject } from "react-multi-date-picker";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import { useTheme } from "next-themes";

const DatePicker = dynamic(() => import("react-multi-date-picker"), { ssr: false });

export function CouponForm() {
  const [state, formAction, isPending] = useActionState(createCoupon, null);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [expiresAt, setExpiresAt] = useState<DateObject | null>(null);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success("کد تخفیف با موفقیت ایجاد شد!");
      // Option to reset form
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm mb-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">ایجاد کد تخفیف جدید</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">کد تخفیف (به انگلیسی)</label>
          <input
            type="text"
            name="code"
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none uppercase"
            placeholder="مثال: YALDA۱۴۰۳"
            dir="ltr"
          />
        </div>

        <div className="flex flex-col gap-2" ref={typeDropdownRef}>
          <label className="font-medium text-sm text-gray-700 dark:text-gray-300">نوع تخفیف</label>
          <div className="relative w-full">
            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className="w-full flex items-center justify-between bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all shadow-sm text-right"
            >
              <span>{type === "PERCENTAGE" ? "درصدی (%)" : "مبلغ ثابت (تومان)"}</span>
              <ChevronDown className={`w-4 h-4 opacity-70 transition-transform duration-200 ${isTypeOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isTypeOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden bg-white/95 dark:bg-[#1a1b26]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl duration-200 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
                <div className="flex flex-col py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setType("PERCENTAGE");
                      setIsTypeOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
                      type === "PERCENTAGE" 
                        ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10" 
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    درصدی (%)
                    {type === "PERCENTAGE" && <Check className="w-4 h-4 text-violet-500" />}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setType("FIXED");
                      setIsTypeOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
                      type === "FIXED" 
                        ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10" 
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    مبلغ ثابت (تومان)
                    {type === "FIXED" && <Check className="w-4 h-4 text-violet-500" />}
                  </button>
                </div>
              </div>
            )}
          </div>
          <input type="hidden" name="type" value={type} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مقدار تخفیف</label>
          <input
            type="number"
            name="value"
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
            placeholder={type === "PERCENTAGE" ? "مثال: ۲۰ (برای ۲۰ درصد)" : "مثال: ۵۰۰۰۰ (تومان)"}
          />
        </div>

        {type === "PERCENTAGE" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">سقف تخفیف (تومان) - اختیاری</label>
            <input
              type="number"
              name="maxDiscount"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="مثال: ۱۰۰۰۰۰"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">حداقل مبلغ سفارش (تومان) - اختیاری</label>
          <input
            type="number"
            name="minOrderAmount"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
            placeholder="مثال: ۵۰۰۰۰۰"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">محدودیت تعداد استفاده - اختیاری</label>
          <input
            type="number"
            name="usageLimit"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
            placeholder="مثال: ۱۰۰ (نفر)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تاریخ انقضا - اختیاری</label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <DatePicker
              value={expiresAt}
              onChange={(date: any) => setExpiresAt(date)}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              className={resolvedTheme === "dark" ? "bg-dark" : ""}
              inputClass="w-full px-4 pl-12 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
              containerClassName="w-full"
              placeholder="انتخاب تاریخ انقضا..."
            />
          </div>
          <input 
            type="hidden" 
            name="expiresAt" 
            value={expiresAt ? expiresAt.toDate().toISOString() : ""} 
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        ثبت کد تخفیف
      </button>
    </form>
  );
}
