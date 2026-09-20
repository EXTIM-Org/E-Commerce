"use client";

import { CheckCircle2, Clock, Home, Package, Truck, XCircle, Copy, Check } from "lucide-react";
import { useState } from "react";

type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STEPS = [
  { id: "PAID", label: "تایید سفارش", icon: CheckCircle2 },
  { id: "PROCESSING", label: "در حال پردازش", icon: Package },
  { id: "SHIPPED", label: "ارسال شده", icon: Truck },
  { id: "DELIVERED", label: "تحویل شده", icon: Home },
];

export function OrderTimeline({ 
  status, 
  trackingCode 
}: { 
  status: OrderStatus;
  trackingCode?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  if (status === "CANCELLED") {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">سفارش لغو شده است</h3>
        <p className="text-red-500/80 dark:text-red-400/80">این سفارش لغو شده و قابل پیگیری نمی‌باشد.</p>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <Clock className="w-12 h-12 text-amber-500 mb-3" />
        <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">در انتظار پرداخت</h3>
        <p className="text-amber-500/80 dark:text-amber-400/80">لطفاً برای قرارگیری سفارش در صف پردازش، پرداخت را کامل کنید.</p>
      </div>
    );
  }

  // Find the index of current status
  const currentIndex = STEPS.findIndex(s => s.id === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  const handleCopyTracking = () => {
    if (trackingCode) {
      navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">رهگیری سفارش</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">وضعیت فعلی بسته شما</p>
        </div>
        
        {trackingCode && (
          <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end">
            <span className="text-sm text-gray-500 mb-1">کد رهگیری پست</span>
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-xl px-4 py-2 border border-black/10 dark:border-white/10">
              <span className="font-mono text-lg font-bold text-gray-900 dark:text-white tracking-widest">{trackingCode}</span>
              <button 
                onClick={handleCopyTracking}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors text-gray-500 hover:text-violet-500"
                title="کپی کد رهگیری"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Connecting Line (Background) */}
        <div className="absolute top-1/2 left-[10%] right-[10%] h-1 bg-black/5 dark:bg-white/5 -translate-y-1/2 rounded-full hidden md:block" />
        
        {/* Connecting Line (Active) */}
        <div 
          className="absolute top-1/2 right-[10%] h-1 bg-gradient-to-l from-violet-500 to-fuchsia-500 -translate-y-1/2 rounded-full transition-all duration-700 hidden md:block"
          style={{ width: `${(activeIndex / (STEPS.length - 1)) * 80}%` }}
        />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 relative z-10">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= activeIndex;
            const isCurrent = index === activeIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center relative w-full md:w-auto">
                {/* Mobile vertical line */}
                {index < STEPS.length - 1 && (
                  <div className="absolute top-12 bottom-[-24px] w-1 bg-black/5 dark:bg-white/5 md:hidden" />
                )}
                {index < STEPS.length - 1 && index < activeIndex && (
                  <div className="absolute top-12 bottom-[-24px] w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500 md:hidden" />
                )}

                <div 
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 relative z-10 bg-white dark:bg-[#121212] ${
                    isCompleted 
                      ? "border-violet-500 text-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                      : "border-black/10 dark:border-white/10 text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isCurrent ? "animate-pulse" : ""}`} />
                </div>
                
                <span className={`mt-3 font-medium text-sm md:text-base text-center ${
                  isCompleted ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"
                }`}>
                  {step.label}
                </span>
                
                {isCurrent && (
                  <span className="text-xs text-violet-500 mt-1 font-medium bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-full">
                    وضعیت فعلی
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
