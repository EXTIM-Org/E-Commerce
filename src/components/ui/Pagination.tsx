"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  buildHrefPattern?: string; // string containing __PAGE__ to be replaced
  className?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  limit,
  onPageChange,
  buildHrefPattern,
  className = ""
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`p-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/5 dark:bg-white/5 rounded-b-3xl sm:rounded-3xl ${className}`}>
      {totalCount !== undefined && limit !== undefined && (
        <div className="text-sm text-gray-500">
          نمایش {(currentPage - 1) * limit + 1} تا {Math.min(currentPage * limit, totalCount)} از {totalCount} مورد
        </div>
      )}
      
      <div className="flex items-center gap-2" dir="ltr">
        {/* Previous Page (ChevronLeft in ltr because we use dir="ltr") */}
        <PageWrapper page={currentPage - 1} disabled={currentPage <= 1} buildHrefPattern={buildHrefPattern} onPageChange={onPageChange}>
          <ChevronLeft className="w-5 h-5" />
        </PageWrapper>

        <div className="flex items-center gap-1 mx-2">
          {Array.from({ length: totalPages })
            .map((_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .map((p, index, array) => {
              const isGap = index > 0 && p - array[index - 1] > 1;
              return (
                <div key={p} className="flex items-center">
                  {isGap && <span className="px-2 text-gray-400">...</span>}
                  <PageWrapper page={p} active={currentPage === p} buildHrefPattern={buildHrefPattern} onPageChange={onPageChange}>
                    {p}
                  </PageWrapper>
                </div>
              );
            })}
        </div>

        {/* Next Page */}
        <PageWrapper page={currentPage + 1} disabled={currentPage >= totalPages} buildHrefPattern={buildHrefPattern} onPageChange={onPageChange}>
          <ChevronRight className="w-5 h-5" />
        </PageWrapper>
      </div>
    </div>
  );
}

// Render logic for the page number wrapper (either a button or a Link)
const PageWrapper = ({ page, children, active, disabled, buildHrefPattern, onPageChange }: { page: number, children: React.ReactNode, active?: boolean, disabled?: boolean, buildHrefPattern?: string, onPageChange?: (page: number) => void }) => {
  const baseClasses = "flex items-center justify-center rounded-lg text-sm font-medium transition-colors";
  
  if (disabled) {
    return (
      <button disabled className={`p-2 border border-black/10 dark:border-white/10 text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed ${baseClasses}`}>
        {children}
      </button>
    );
  }

  const activeClasses = active
    ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
    : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5';
    
  // If it's a prev/next chevron it doesn't get the w-8 h-8 size automatically unless specified by children, wait, we pass w-5 h-5 for chevron inside, but for numbers we need w-8 h-8
  const sizeClasses = typeof children === 'number' || typeof children === 'string' ? 'w-8 h-8' : 'p-2 border border-black/10 dark:border-white/10';

  if (buildHrefPattern) {
    return (
      <Link href={buildHrefPattern.replace('__PAGE__', page.toString())} className={`${baseClasses} ${activeClasses} ${sizeClasses}`}>
        {children}
      </Link>
    );
  }
  
  return (
    <button onClick={() => onPageChange?.(page)} className={`${baseClasses} ${activeClasses} ${sizeClasses}`}>
      {children}
    </button>
  );
};
