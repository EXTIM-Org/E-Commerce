"use client";

import { useState } from "react";
import { addTicketMessage } from "@/actions/ticket";
import toast from "react-hot-toast";
import { Send } from "lucide-react";

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("isInternal", "false"); // Users can't send internal notes
    
    const result = await addTicketMessage(ticketId, formData);
    
    if (result.success) {
      toast.success("پیام شما ارسال شد");
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(result.error || "خطایی رخ داد");
    }
    
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-black/10 dark:border-white/10 pt-6">
      <div className="relative">
        <textarea
          name="text"
          required
          rows={3}
          className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl pl-16 pr-4 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all resize-none shadow-sm"
          placeholder="پاسخ خود را بنویسید..."
        />
        <button
          type="submit"
          disabled={isPending}
          className="absolute left-3 bottom-3 p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
        >
          <Send className="w-5 h-5 rtl:-scale-x-100" />
        </button>
      </div>
    </form>
  );
}
