"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

export function UserTicketsList({ initialTickets }: { initialTickets: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "SEEN": return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
      case "IN_PROGRESS": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "WAITING_FOR_USER": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "RESOLVED": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "CLOSED": return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN": return "باز";
      case "SEEN": return "مشاهده شده";
      case "IN_PROGRESS": return "در حال بررسی";
      case "WAITING_FOR_USER": return "پاسخ داده شده";
      case "RESOLVED": return "حل شده";
      case "CLOSED": return "بسته شده";
      default: return status;
    }
  };

  const paginatedTickets = initialTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تیکت‌های پشتیبانی</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">مشاهده و پیگیری درخواست‌های پشتیبانی شما</p>
        </div>
        <Link 
          href="/profile/tickets/new" 
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-violet-600/20"
        >
          <Plus className="w-5 h-5" />
          ثبت تیکت جدید
        </Link>
      </div>

      {initialTickets.length === 0 ? (
        <div className="text-center py-16 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
          <p className="text-gray-500 dark:text-gray-400">تا کنون تیکتی ثبت نکرده‌اید.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4">
            {paginatedTickets.map((ticket) => (
              <Link 
                key={ticket.id} 
                href={`/profile/tickets/${ticket.id}`}
                className="flex flex-col sm:flex-row justify-between gap-4 p-5 bg-white dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 hover:border-violet-500/30 dark:hover:border-violet-500/30 transition-all hover:shadow-md"
              >
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{ticket.subject}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>شناسه: #{ticket.id.split("-")[0]}</span>
                    <span>•</span>
                    <span dir="ltr">
                      آخرین بروزرسانی: {new Date(ticket.updatedAt).toLocaleString("fa-IR", {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 text-sm font-medium border rounded-full ${getStatusColor(ticket.status)}`}>
                    {getStatusText(ticket.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {initialTickets.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-black/10 dark:border-white/10">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                نمایش {(currentPage - 1) * itemsPerPage + 1} تا {Math.min(currentPage * itemsPerPage, initialTickets.length)} از {initialTickets.length} تیکت
              </span>
              <div className="flex items-center gap-2" dir="ltr">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.ceil(initialTickets.length / itemsPerPage) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === i + 1
                          ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(initialTickets.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(initialTickets.length / itemsPerPage)}
                  className="p-2 rounded-lg border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
