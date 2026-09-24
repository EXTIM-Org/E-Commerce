"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { updateReturnRequestStatus } from "@/actions/returns";
import { Loader2, CheckCircle2, ChevronDown, AlertCircle, X } from "lucide-react";
import toast from "react-hot-toast";

export function ReturnStatusUpdater({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED";
}) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 0 });
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (buttonRef.current?.contains(event.target as Node)) return;
      if (dropdownRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    
    // Close on scroll or resize to prevent floating menu out of sync
    const handleScrollOrResize = () => setIsOpen(false);
    const handleContextMenu = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("contextmenu", handleContextMenu);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (loading) return;
    
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      
      const openTop = spaceBelow < 200;
      setPosition(openTop ? "top" : "bottom");
      
      setDropdownStyle({
        top: openTop ? rect.top + window.scrollY - 6 : rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: Math.max(140, rect.width) // Minimum width for the dropdown
      });
    }
    setIsOpen(!isOpen);
  };

  const handleUpdate = async (status: typeof currentStatus) => {
    setIsOpen(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50';
      case 'APPROVED': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-900/50';
      case 'REFUNDED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'در بررسی';
      case 'APPROVED': return 'تایید شده';
      case 'REJECTED': return 'رد شده';
      case 'REFUNDED': return 'مسترد شده';
      default: return status;
    }
  };

  return (
    <div className="relative inline-block text-right">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        disabled={loading}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all disabled:opacity-50 ${getStatusColor(currentStatus)} shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-violet-500 min-w-[110px]`}
      >
        <span className="flex items-center gap-1.5">
          {loading && <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />}
          {getStatusLabel(currentStatus)}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu (Rendered in Portal) */}
      {isOpen && typeof window !== "undefined" && createPortal(
        <div 
          ref={dropdownRef}
          style={{ 
            top: dropdownStyle.top, 
            left: dropdownStyle.left, 
            width: dropdownStyle.width 
          }}
          className={`absolute z-[9999] overflow-hidden bg-white/95 dark:bg-[#1a1b26]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl duration-200 ${
            position === "top" ? "-translate-y-full origin-bottom animate-in fade-in zoom-in-95" : "origin-top animate-in fade-in zoom-in-95"
          }`}
        >
          <div className="flex flex-col py-1">
            {(['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleUpdate(s)}
                className={`w-full text-right px-4 py-2 text-xs sm:text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-between ${
                  currentStatus === s 
                    ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10' 
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {getStatusLabel(s)}
                {currentStatus === s && <CheckCircle2 className="w-4 h-4 text-violet-500" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

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
