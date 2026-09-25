"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

export function AdminUsersFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const [q, setQ] = useState(currentQ);

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");

      // Reset to page 1 on new search
      if (q !== currentQ) {
        params.delete("page");
      }

      router.push(`/admin/users?${params.toString()}`);
    });
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
          placeholder="جستجو با نام، ایمیل، یا شماره موبایل..."
          className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-2xl py-3 pr-12 pl-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
        />
      </div>
      
      <div className="flex gap-4 w-full md:w-auto relative items-center">
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
