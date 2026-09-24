"use client";

import { updateOrderStatus, updateTrackingCode } from "@/actions/order";
import { useState, useRef, useEffect } from "react";
import { Loader2, ChevronDown, Check } from "lucide-react";

type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";

export function AdminOrderControls({ 
  orderId, 
  currentStatus, 
  trackingCode: initialTrackingCode 
}: { 
  orderId: string;
  currentStatus: OrderStatus;
  trackingCode?: string | null;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const STATUS_OPTIONS = [
    { value: "PENDING", label: "در انتظار پرداخت (PENDING)" },
    { value: "PAID", label: "تایید شده - پرداخت موفق (PAID)" },
    { value: "PROCESSING", label: "در حال پردازش (PROCESSING)" },
    { value: "SHIPPED", label: "ارسال شده (SHIPPED)" },
    { value: "DELIVERED", label: "تحویل شده (DELIVERED)" },
    { value: "CANCELLED", label: "لغو شده (CANCELLED)" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setStatus(newStatus);
    setIsStatusOpen(false);
    setIsLoading(true);
    setMessage("");
    
    const res = await updateOrderStatus(orderId, newStatus);
    
    setIsLoading(false);
    if (res.success) {
      setMessage("وضعیت با موفقیت به‌روزرسانی شد و ایمیل ارسال گردید.");
    } else {
      setMessage(res.error || "خطایی رخ داد.");
      setStatus(currentStatus); // Revert
    }
    
    setTimeout(() => setMessage(""), 5000);
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const res = await updateTrackingCode(orderId, trackingCode);
    
    setIsLoading(false);
    if (res.success) {
      setMessage("کد رهگیری با موفقیت ثبت شد.");
    } else {
      setMessage(res.error || "خطایی رخ داد.");
    }

    setTimeout(() => setMessage(""), 5000);
  };

  return (
    <div className="bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 mt-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">کنترل و مدیریت سفارش</h3>
      
      {message && (
        <div className={`p-4 rounded-xl mb-6 ${message.includes("خطا") ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2" ref={statusDropdownRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            تغییر وضعیت سفارش
          </label>
          <div className="relative w-full">
            {/* Trigger Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="w-full flex items-center justify-between bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white shadow-sm disabled:opacity-50"
            >
              <span>{STATUS_OPTIONS.find(o => o.value === status)?.label}</span>
              <ChevronDown className={`w-4 h-4 opacity-70 transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isStatusOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden bg-white/95 dark:bg-[#1a1b26]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl duration-200 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
                <div className="flex flex-col py-1">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleStatusChange(opt.value as OrderStatus)}
                      className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
                        status === opt.value 
                          ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10" 
                          : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {opt.label}
                      {status === opt.value && <Check className="w-4 h-4 text-violet-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            با تغییر وضعیت، ایمیل اطلاع‌رسانی برای مشتری ارسال می‌شود.
          </p>
        </div>

        <form onSubmit={handleSaveTracking} className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            کد رهگیری پست
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              disabled={isLoading}
              placeholder="مثلاً 123456789012345678901234"
              className="flex-1 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white font-mono text-left"
              dir="ltr"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl transition-colors disabled:opacity-50 min-w-[100px] flex justify-center items-center font-medium"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ثبت کد"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            این کد در پروفایل کاربر و در تایملاینِ «ارسال شده» نمایش داده می‌شود.
          </p>
        </form>
      </div>
    </div>
  );
}
