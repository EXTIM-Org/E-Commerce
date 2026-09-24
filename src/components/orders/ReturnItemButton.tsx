"use client";

import { useState } from "react";
import { PackageMinus } from "lucide-react";
import { ReturnRequestModal } from "./ReturnRequestModal";

export function ReturnItemButton({ 
  orderItemId, 
  productName,
  existingReturn 
}: { 
  orderItemId: string;
  productName: string;
  existingReturn?: { status: string; adminNote?: string | null };
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (existingReturn) {
    let statusLabel = "";
    let statusColor = "";
    
    switch (existingReturn.status) {
      case 'SUBMITTED': statusLabel = 'ثبت شده'; statusColor = 'text-indigo-600 bg-indigo-50'; break;
      case 'PENDING': statusLabel = 'درخواست در حال بررسی'; statusColor = 'text-yellow-600 bg-yellow-50'; break;
      case 'APPROVED': statusLabel = 'تایید شده - در انتظار کالا'; statusColor = 'text-blue-600 bg-blue-50'; break;
      case 'REJECTED': statusLabel = 'درخواست رد شده'; statusColor = 'text-red-600 bg-red-50'; break;
      case 'REFUNDED': statusLabel = 'مسترد شده'; statusColor = 'text-emerald-600 bg-emerald-50'; break;
      default: statusLabel = 'نامشخص'; statusColor = 'text-gray-600 bg-gray-50'; break;
    }

    return (
      <div className="flex flex-col gap-2 items-end">
        <div className={`text-xs font-medium px-3 py-1.5 rounded-xl ${statusColor} dark:bg-black/20 flex items-center gap-1.5 w-fit border border-current/10`}>
          <PackageMinus className="w-3.5 h-3.5" />
          {statusLabel}
        </div>
        
        {existingReturn.status === 'REJECTED' && existingReturn.adminNote && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-3 rounded-xl mt-1 text-xs text-red-700 dark:text-red-400 w-full max-w-sm text-right">
            <span className="font-bold block mb-1">دلیل رد درخواست:</span>
            {existingReturn.adminNote}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="text-xs font-medium px-3 py-1.5 rounded-xl text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 flex items-center gap-1.5 transition-colors border border-violet-200 dark:border-violet-500/20"
      >
        <PackageMinus className="w-3.5 h-3.5" />
        ثبت درخواست مرجوعی
      </button>

      <ReturnRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orderItemId={orderItemId}
        productName={productName}
      />
    </>
  );
}
