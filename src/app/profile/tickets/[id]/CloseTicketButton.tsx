"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { closeUserTicket } from "@/actions/ticket";
import toast from "react-hot-toast";

export function CloseTicketButton({ ticketId }: { ticketId: string }) {
  const [isPending, setIsPending] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClose = async () => {
    setIsPending(true);
    const result = await closeUserTicket(ticketId);
    if (result.success) {
      toast.success("تیکت با موفقیت بسته شد");
      setShowModal(false);
    } else {
      toast.error(result.error || "خطا در بستن تیکت");
      setIsPending(false);
    }
  };

  return (
    <>
      <button 
        type="button" 
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-rose-600 bg-gray-100 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
      >
        <CheckCircle2 className="w-4 h-4" />
        بستن تیکت
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => !isPending && setShowModal(false)}
          ></div>
          
          <div className="relative bg-white dark:bg-[#1a1b26] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                بستن تیکت
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                آیا از بستن این تیکت اطمینان دارید؟ بعد از بسته شدن، امکان ارسال پیام جدید در این تیکت وجود نخواهد داشت.
              </p>
              
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isPending}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-500/20"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "بستن تیکت"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
