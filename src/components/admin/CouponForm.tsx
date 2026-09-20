"use client";

import { useActionState, useEffect, useState } from "react";
import { createCoupon } from "@/actions/coupon";
import { Save, Loader2 } from "lucide-react";
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
            placeholder="مثال: YALDA1403"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع تخفیف</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
          >
            <option value="PERCENTAGE">درصدی (%)</option>
            <option value="FIXED">مبلغ ثابت (تومان)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مقدار تخفیف</label>
          <input
            type="number"
            name="value"
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
            placeholder={type === "PERCENTAGE" ? "مثال: 20 (برای 20 درصد)" : "مثال: 50000 (تومان)"}
          />
        </div>

        {type === "PERCENTAGE" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">سقف تخفیف (تومان) - اختیاری</label>
            <input
              type="number"
              name="maxDiscount"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="مثال: 100000"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">حداقل مبلغ سفارش (تومان) - اختیاری</label>
          <input
            type="number"
            name="minOrderAmount"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
            placeholder="مثال: 500000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">محدودیت تعداد استفاده - اختیاری</label>
          <input
            type="number"
            name="usageLimit"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
            placeholder="مثال: 100 (نفر)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تاریخ انقضا - اختیاری</label>
          <div className="w-full">
            <DatePicker
              value={expiresAt}
              onChange={(date: any) => setExpiresAt(date)}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              className={resolvedTheme === "dark" ? "bg-dark" : ""}
              inputClass="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
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
