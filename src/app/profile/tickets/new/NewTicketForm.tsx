"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/actions/ticket";
import toast from "react-hot-toast";
import { ChevronDown, Check } from "lucide-react";

function CustomSelect({ 
  name, 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 hover:border-violet-500/50 transition-all text-gray-900 dark:text-white"
      >
        <span className={selectedOption && selectedOption.value !== "" ? "" : "text-gray-500 dark:text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 overflow-hidden bg-white dark:bg-[#1a1b26] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col py-2 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
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
  );
}

export function NewTicketForm({ orders }: { orders: any[] }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [department, setDepartment] = useState("SUPPORT");
  const [priority, setPriority] = useState("MEDIUM");
  const [orderId, setOrderId] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createTicket(formData);
    
    if (result.success) {
      toast.success("تیکت شما با موفقیت ثبت شد");
      router.push("/profile/tickets");
    } else {
      toast.error(result.error || "خطایی رخ داد");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            موضوع تیکت <span className="text-red-500">*</span>
          </label>
          <input
            name="subject"
            required
            className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white hover:border-violet-500/50 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
            placeholder="مثال: پیگیری سفارش ارسال نشده"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            دپارتمان <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            name="department"
            value={department}
            onChange={setDepartment}
            options={[
              { label: "پشتیبانی و امور مشتریان", value: "SUPPORT" },
              { label: "فروش و مالی", value: "SALES" },
              { label: "پشتیبانی فنی سایت", value: "TECHNICAL" }
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            اولویت <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            name="priority"
            value={priority}
            onChange={setPriority}
            options={[
              { label: "کم (سوالات عمومی)", value: "LOW" },
              { label: "متوسط (پیگیری عادی)", value: "MEDIUM" },
              { label: "زیاد (مشکل در خرید)", value: "HIGH" },
              { label: "اورژانسی (خطای پرداخت)", value: "URGENT" }
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            شماره سفارش مرتبط (اختیاری)
          </label>
          <CustomSelect
            name="orderId"
            value={orderId}
            onChange={setOrderId}
            placeholder="انتخاب کنید..."
            options={[
              { label: "انتخاب کنید...", value: "" },
              ...orders.map((o) => ({
                label: `#${o.id.split("-")[0]} - ${new Date(o.createdAt).toLocaleDateString("fa-IR")}`,
                value: o.id
              }))
            ]}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          متن پیام <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={6}
          className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white hover:border-violet-500/50 focus:ring-2 focus:ring-violet-500 outline-none transition-all resize-none"
          placeholder="شرح کامل درخواست یا مشکل خود را اینجا بنویسید..."
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all font-bold disabled:opacity-50 shadow-lg shadow-violet-600/20"
        >
          {isPending ? "در حال ثبت..." : "ثبت تیکت"}
        </button>
      </div>
    </form>
  );
}
