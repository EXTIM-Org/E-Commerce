"use client";

import { useState, useRef, useEffect } from "react";
import { updateTicketStatus } from "@/actions/ticket";
import toast from "react-hot-toast";
import { ChevronDown, Check } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "باز" },
  { value: "SEEN", label: "مشاهده شده" },
  { value: "IN_PROGRESS", label: "در حال بررسی" },
  { value: "WAITING_FOR_USER", label: "پاسخ داده شده" },
  { value: "RESOLVED", label: "حل شده" },
  { value: "CLOSED", label: "بسته شده" },
];

export function TicketStatusUpdater({ ticketId, initialStatus }: { ticketId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAutoUpdated = useRef(false);

  useEffect(() => {
    if (initialStatus === "OPEN" && !hasAutoUpdated.current) {
      hasAutoUpdated.current = true;
      setStatus("SEEN");
      updateTicketStatus(ticketId, "SEEN").catch(console.error);
    }
  }, [initialStatus, ticketId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = async (newStatus: string) => {
    setIsOpen(false);
    if (newStatus === status) return;

    const oldStatus = status;
    setStatus(newStatus);
    setIsPending(true);
    
    const result = await updateTicketStatus(ticketId, newStatus);
    
    if (result.success) {
      toast.success("وضعیت تیکت تغییر کرد");
    } else {
      toast.error("خطا در تغییر وضعیت");
      setStatus(oldStatus); // revert
    }
    
    setIsPending(false);
  };

  const getStatusStyle = (s: string) => {
    switch(s) {
      case 'OPEN': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'SEEN': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'WAITING_FOR_USER': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const selectedOption = STATUS_OPTIONS.find(o => o.value === status);

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">وضعیت:</label>
      <div ref={containerRef} className="relative min-w-[150px]">
        <button
          type="button"
          disabled={isPending}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-bold border transition-all disabled:opacity-50 ${getStatusStyle(status)}`}
        >
          <span>{selectedOption?.label}</span>
          <ChevronDown className={`w-4 h-4 mr-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 left-0 min-w-[180px] z-50 overflow-hidden bg-white dark:bg-[#1a1b26] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col py-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange(opt.value)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/10 ${
                    status === opt.value
                      ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10"
                      : "text-gray-700 dark:text-gray-300"
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
    </div>
  );
}
