"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { updateReturnRequestStatus } from "@/actions/returns";
import { Loader2, AlertCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { DropdownSelect } from "@/components/ui/DropdownSelect";

const RETURN_STATUS_OPTIONS = [
  { value: "PENDING", label: "در حال بررسی", color: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { value: "APPROVED", label: "تایید شده", color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "REJECTED", label: "رد شده", color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20" },
  { value: "REFUNDED", label: "مسترد شده", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
];

export function ReturnStatusUpdater({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED";
}) {
  const [loading, setLoading] = useState(false);

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const handleUpdate = async (status: typeof currentStatus) => {
    if (status === currentStatus) return;
    
    if (status === 'REJECTED') {
      setIsRejectModalOpen(true);
      setRejectNote("");
      return;
    }

    setLoading(true);
    await updateReturnRequestStatus(requestId, status, undefined);
    setLoading(false);
  };

  const submitReject = async () => {
    if (!rejectNote.trim()) {
      toast.error("لطفا دلیل رد درخواست را وارد کنید");
      return;
    }

    setLoading(true);
    await updateReturnRequestStatus(requestId, "REJECTED", rejectNote);
    setLoading(false);
    setIsRejectModalOpen(false);
  };

  return (
    <div className="w-[120px] inline-block">
      <DropdownSelect
        options={RETURN_STATUS_OPTIONS}
        value={currentStatus}
        onChange={(val) => handleUpdate(val as any)}
        variant="colored"
        isLoading={loading}
        className="!px-3 !py-1.5 !rounded-full !h-auto text-xs"
        menuClassName="!min-w-[140px]"
      />

      {/* Reject Modal (Rendered in Portal) */}
      {isRejectModalOpen && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => !loading && setIsRejectModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            
            <div className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">رد درخواست مرجوعی</h3>
              <p className="text-sm text-gray-500 mb-6">لطفاً دلیل رد درخواست را برای کاربر بنویسید.</p>
              
              <div className="mb-6">
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="مثال: متاسفانه طبق قوانین سایت، جعبه کالا نباید مخدوش شده باشد..."
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 dark:text-white resize-none text-sm leading-relaxed"
                  rows={4}
                  autoFocus
                />
              </div>
              
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={submitReject}
                  disabled={loading || !rejectNote.trim()}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "ثبت و رد درخواست"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
