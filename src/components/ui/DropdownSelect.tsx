"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export type DropdownOption = {
  value: string;
  label: string;
  color?: string; // e.g., "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20"
};

export type DropdownSelectProps = {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  variant?: "colored" | "neutral";
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  className?: string; // applied to the trigger button
  menuClassName?: string; // applied to the dropdown menu container
};

export function DropdownSelect({
  options,
  value,
  onChange,
  variant = "neutral",
  disabled = false,
  isLoading = false,
  placeholder = "انتخاب کنید...",
  className = "",
  menuClassName = ""
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 0 });
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (buttonRef.current?.contains(event.target as Node)) return;
      if (dropdownRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };
    const handleScrollOrResize = (e: Event) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    };
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
    if (disabled || isLoading) return;
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openTop = spaceBelow < 300; // threshold to open upward
      setPosition(openTop ? "top" : "bottom");
      
      setDropdownStyle({
        top: openTop ? rect.top + window.scrollY - 6 : rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (newValue: string) => {
    setIsOpen(false);
    onChange(newValue);
  };

  const selectedOption = options.find(o => o.value === value);

  // Trigger button styling based on variant
  const baseTriggerClasses = "w-full flex items-center justify-between border transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50";
  let triggerClasses = "";
  
  if (variant === "colored") {
    const colorClasses = selectedOption?.color || "text-gray-900 dark:text-white bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10";
    triggerClasses = `${baseTriggerClasses} ${colorClasses} rounded-2xl px-4 py-2.5 h-[50px] text-sm font-medium ${className}`;
  } else {
    // neutral
    triggerClasses = `${baseTriggerClasses} bg-white/50 dark:bg-black/50 border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium ${className}`;
  }

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        disabled={disabled || isLoading}
        className={triggerClasses}
      >
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{selectedOption ? selectedOption.label : placeholder}</span>
        
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current opacity-30 border-t-current rounded-full animate-spin ml-1 flex-shrink-0"></div>
        ) : (
          <ChevronDown className={`w-4 h-4 opacity-70 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
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
          className={`absolute z-[9999] overflow-hidden bg-white/95 dark:bg-[#1a1b26]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-2xl duration-200 p-2 max-h-60 overflow-y-auto ${
            position === "top" ? "-translate-y-full origin-bottom animate-in fade-in zoom-in-95" : "origin-top animate-in fade-in zoom-in-95"
          } ${menuClassName}`}
        >
          <div className="flex flex-col gap-1">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`flex items-center justify-between whitespace-nowrap w-full px-3 py-2.5 text-sm font-medium transition-all rounded-lg ${
                  value === opt.value 
                    ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {opt.label}
                {value === opt.value && <Check className="w-4 h-4 text-violet-500" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
