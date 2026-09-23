"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { updateUserRole } from "@/actions/users";
import { UserRole } from "@/lib/permissions";
import toast from "react-hot-toast";
import { ChevronDown, Check, AlertCircle, Loader2 } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "USER", label: "کاربر عادی", color: "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700" },
  { value: "BLOG_ADMIN", label: "مدیر وبلاگ", color: "text-blue-700 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800" },
  { value: "SUPPORT", label: "پشتیبانی", color: "text-teal-700 dark:text-teal-400 bg-teal-100/50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800" },
  { value: "ADMIN", label: "ادمین", color: "text-purple-700 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800" },
  { value: "SUPER_ADMIN", label: "سوپر ادمین", color: "text-red-700 dark:text-red-400 bg-red-100/50 dark:bg-red-900/30 border-red-200 dark:border-red-800" },
];

export function UserRoleForm({ userId, currentRole }: { userId: string, currentRole: UserRole }) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 0 });
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const [showModal, setShowModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (buttonRef.current?.contains(event.target as Node)) return;
      if (dropdownRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    
    // Close on scroll or resize to prevent floating menu out of sync
    const handleScrollOrResize = () => setIsOpen(false);
    // Force close if user right-clicks anywhere
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

  const handleRoleSelect = (newRoleValue: string) => {
    setIsOpen(false);
    const newRole = newRoleValue as UserRole;
    if (newRole === currentRole) return;

    setPendingRole(newRole);
    setShowModal(true);
  };

  const confirmRoleChange = () => {
    if (!pendingRole) return;

    startTransition(async () => {
      const res = await updateUserRole(userId, pendingRole);
      if (res && res.error) {
        toast.error(res.error);
      } else {
        toast.success("نقش کاربر با موفقیت بروزرسانی شد");
        setShowModal(false);
        setPendingRole(null);
      }
    });
  };

  const toggleDropdown = () => {
    if (isPending) return;
    
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      
      const openTop = spaceBelow < 250;
      setPosition(openTop ? "top" : "bottom");
      
      setDropdownStyle({
        top: openTop ? rect.top + window.scrollY - 6 : rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  const currentOption = ROLE_OPTIONS.find(o => o.value === currentRole);
  const currentColor = currentOption?.color || "text-gray-900 dark:text-white bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10";

  return (
    <div className="relative w-full max-w-[150px]">
      
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        disabled={isPending}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium ${currentColor} focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50 transition-all shadow-sm`}
      >
        <span>{currentOption?.label || "نامشخص"}</span>
        
        {isPending ? (
          <div className="w-3.5 h-3.5 border-2 border-current opacity-30 border-t-current rounded-full animate-spin ml-1 flex-shrink-0"></div>
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
        )}
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
            {ROLE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleRoleSelect(opt.value)}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs sm:text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
                  currentRole === opt.value 
                    ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10" 
                    : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {opt.label}
                {currentRole === opt.value && <Check className="w-3.5 h-3.5 text-violet-500" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
      
      {/* Confirmation Modal */}
      {showModal && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-0">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => !isPending && setShowModal(false)}
          ></div>
          
          <div className="relative bg-white dark:bg-[#1a1b26] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                تغییر نقش کاربر
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                آیا از تغییر نقش این کاربر به <span className="font-bold text-gray-900 dark:text-white">&quot;{ROLE_OPTIONS.find(r => r.value === pendingRole)?.label}&quot;</span> اطمینان دارید؟
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
                  onClick={confirmRoleChange}
                  disabled={isPending}
                  className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "تایید تغییر"
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
