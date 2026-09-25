"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function AdminSidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="md:hidden flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-xl mb-6 w-full justify-center transition-colors shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        <span className="font-medium">{isOpen ? "بستن منوی مدیریت" : "نمایش منوی مدیریت"}</span>
      </button>
      
      <div className={`${isOpen ? "block" : "hidden"} md:block`}>
        {children}
      </div>
    </>
  );
}
