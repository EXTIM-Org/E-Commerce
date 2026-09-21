"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { updateOrderStatus } from "@/actions/admin-orders";
import toast from "react-hot-toast";
import { ChevronDown, Check } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "در انتظار پرداخت", color: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { value: "PAID", label: "پرداخت شده", color: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20" },
  { value: "PROCESSING", label: "در حال پردازش", color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "SHIPPED", label: "ارسال شده", color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { value: "DELIVERED", label: "تحویل داده شده", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { value: "CANCELLED", label: "لغو شده", color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20" },
];

export function StatusUpdater({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = (newStatus: string) => {
    setIsOpen(false);
    if (newStatus === currentStatus) return;

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        toast.success("وضعیت سفارش بروزرسانی شد");
      } else {
        toast.error(result.error || "خطا در بروزرسانی وضعیت");
      }
    });
  };

  const toggleDropdown = () => {
    if (isPending) return;
    
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 250px space below, open upwards
      if (spaceBelow < 250) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
    setIsOpen(!isOpen);
  };

  const currentOption = STATUS_OPTIONS.find(o => o.value === currentStatus);
  const currentColor = currentOption?.color || "text-gray-900 dark:text-white bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10";

  return (
    <div className="relative w-2/3 min-w-[140px]" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        disabled={isPending}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-1.5 text-sm font-medium ${currentColor} focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50 transition-all shadow-sm`}
      >
        <span>{currentOption?.label || "نامشخص"}</span>
        
        {isPending ? (
          <div className="w-3 h-3 border-2 border-current opacity-30 border-t-current rounded-full animate-spin ml-1"></div>
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute left-0 right-0 z-50 overflow-hidden bg-white/80 dark:bg-[#1a1b26]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl duration-200 ${
          position === "top" ? "bottom-full mb-1.5 origin-bottom animate-in fade-in zoom-in-95" : "top-full mt-1.5 origin-top animate-in fade-in zoom-in-95"
        }`}>
          <div className="flex flex-col py-1">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
                  currentStatus === opt.value 
                    ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10" 
                    : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {opt.label}
                {currentStatus === opt.value && <Check className="w-3.5 h-3.5 text-violet-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
}
