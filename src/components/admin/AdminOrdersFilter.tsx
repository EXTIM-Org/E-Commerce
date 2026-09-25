"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { DropdownSelect } from "@/components/ui/DropdownSelect";

const STATUS_OPTIONS = [
  { value: "", label: "همه وضعیت‌ها", color: "text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10" },
  { value: "PENDING", label: "در انتظار پرداخت", color: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { value: "PAID", label: "پرداخت شده", color: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20" },
  { value: "PROCESSING", label: "در حال پردازش", color: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { value: "SHIPPED", label: "ارسال شده", color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "CANCELLED", label: "لغو شده", color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20" },
  { value: "DELIVERED", label: "تحویل داده شده", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { value: "RETURNED", label: "مرجوع شده", color: "text-gray-500 dark:text-gray-400 bg-gray-500/10 border-gray-500/20" },
];

export function AdminOrdersFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentStatus = searchParams.get("status") || "";

  const [q, setQ] = useState(currentQ);
  const [status, setStatus] = useState(currentStatus);



  const applyFilters = (overrideStatus?: string) => {
    const targetStatus = overrideStatus !== undefined ? overrideStatus : status;
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");

      if (targetStatus) params.set("status", targetStatus);
      else params.delete("status");

      router.push(`/admin/orders?${params.toString()}`);
    });
  };

  const handleStatusSelect = (newStatus: string) => {
    setStatus(newStatus);
    applyFilters(newStatus);
  };

  return (
    <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center z-10 relative">
      <div className="flex-1 w-full relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="جستجو با شناسه سفارش، نام خریدار، ایمیل، نام گیرنده یا موبایل..."
          className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-2xl py-3 pr-12 pl-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
        />
      </div>
      
      <div className="flex gap-4 w-full md:w-auto relative items-center">
        <div className="min-w-[180px]">
          <DropdownSelect
            options={STATUS_OPTIONS}
            value={status}
            onChange={handleStatusSelect}
            variant="colored"
            isLoading={isPending}
          />
        </div>
        
        <button
          onClick={() => applyFilters()}
          disabled={isPending}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-2xl py-3 px-6 h-[50px] font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-violet-500/20"
        >
          <Search className="w-5 h-5" />
          جستجو
        </button>
      </div>
    </div>
  );
}
