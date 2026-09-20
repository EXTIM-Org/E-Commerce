"use client";

import { deleteAddress } from "@/actions/address";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteAddressButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm("آیا از حذف این آدرس اطمینان دارید؟")) {
      startTransition(async () => {
        await deleteAddress(id);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="absolute top-4 left-4 p-2 text-gray-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50" 
      title="حذف آدرس"
    >
      <Trash2 className={`w-4 h-4 ${isPending ? "animate-pulse" : ""}`} />
    </button>
  );
}
