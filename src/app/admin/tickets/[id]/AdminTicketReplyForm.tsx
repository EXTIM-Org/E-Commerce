"use client";

import { useState } from "react";
import { addTicketMessage } from "@/actions/ticket";
import toast from "react-hot-toast";
import { Send, ShieldAlert } from "lucide-react";

export function AdminTicketReplyForm({ ticketId }: { ticketId: string }) {
  const [isPending, setIsPending] = useState(false);
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("isInternal", isInternal.toString());
    
    const result = await addTicketMessage(ticketId, formData);
    
    if (result.success) {
      toast.success(isInternal ? "یادداشت داخلی ثبت شد" : "پاسخ به کاربر ارسال شد");
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(result.error || "خطایی رخ داد");
    }
    
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-black/10 dark:border-white/10 pt-6">
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setIsInternal(!isInternal)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            isInternal 
              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" 
              : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-white/10"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          ارسال به عنوان یادداشت داخلی
        </button>
        {isInternal && (
          <span className="text-xs text-rose-500">کاربر این پیام را نخواهد دید</span>
        )}
      </div>
      
      <div className="relative">
        <textarea
          name="text"
          required
          rows={4}
          className={`w-full bg-white dark:bg-white/5 border rounded-2xl pl-16 pr-4 py-4 text-gray-900 dark:text-white focus:ring-2 outline-none transition-all resize-none shadow-sm ${
            isInternal 
              ? "border-rose-500/30 focus:ring-rose-500 placeholder-rose-500/50" 
              : "border-black/10 dark:border-white/10 focus:ring-violet-500"
          }`}
          placeholder={isInternal ? "یادداشت داخلی خود را اینجا بنویسید..." : "پاسخ خود را برای کاربر بنویسید..."}
        />
        <button
          type="submit"
          disabled={isPending}
          className={`absolute left-3 bottom-3 p-3 text-white rounded-xl transition-all disabled:opacity-50 shadow-lg ${
            isInternal
              ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
              : "bg-violet-600 hover:bg-violet-700 shadow-violet-600/20"
          }`}
        >
          <Send className="w-5 h-5 rtl:-scale-x-100" />
        </button>
      </div>
    </form>
  );
}
