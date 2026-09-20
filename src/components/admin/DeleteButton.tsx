"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton() {
  return (
    <button 
      type="submit" 
      className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors" 
      title="حذف" 
      onClick={(e) => {
        if (!window.confirm("آیا از حذف این محصول اطمینان دارید؟")) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
