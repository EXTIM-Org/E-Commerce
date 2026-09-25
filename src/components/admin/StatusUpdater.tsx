"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/actions/admin-orders";
import toast from "react-hot-toast";
import { DropdownSelect } from "@/components/ui/DropdownSelect";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "در انتظار پرداخت", color: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { value: "PAID", label: "پرداخت شده", color: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20" },
  { value: "PROCESSING", label: "در حال پردازش", color: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { value: "SHIPPED", label: "ارسال شده", color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "CANCELLED", label: "لغو شده", color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20" },
  { value: "DELIVERED", label: "تحویل داده شده", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
];

export function StatusUpdater({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
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

  return (
    <div className="w-[76%] min-w-[160px]">
      <DropdownSelect
        options={STATUS_OPTIONS}
        value={currentStatus}
        onChange={handleStatusChange}
        variant="colored"
        isLoading={isPending}
        className="w-full !px-3 !py-1.5 !h-auto"
      />
    </div>
  );
}
