"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

const SortableHeader = ({ 
  label, 
  field, 
  sortField, 
  sortOrder, 
  setSortField, 
  setSortOrder, 
  setCurrentPage 
}: { 
  label: string, 
  field: string,
  sortField: string,
  sortOrder: "asc" | "desc",
  setSortField: (f: string) => void,
  setSortOrder: (o: "asc" | "desc") => void,
  setCurrentPage: (p: number) => void
}) => {
  const isActive = sortField === field;
  
  const handleSort = () => {
    if (isActive) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  return (
    <button type="button" onClick={handleSort} className="flex items-center gap-1.5 hover:text-violet-500 transition-colors w-fit font-bold">
      {label}
      {isActive && (
        sortOrder === "desc" ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
      )}
    </button>
  );
};

export function TicketsList({ initialTickets, initialSearch = "" }: { initialTickets: any[], initialSearch?: string }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortField, setSortField] = useState<string>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTickets = initialTickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ticket.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ticket.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ticket.user?.phoneNumber || "").includes(searchTerm) ||
    ticket.id.includes(searchTerm)
  );

  const priorityWeight = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  const statusWeight = {
    OPEN: 6,
    SEEN: 5,
    IN_PROGRESS: 4,
    WAITING_FOR_USER: 3,
    RESOLVED: 2,
    CLOSED: 1
  };

  filteredTickets.sort((a, b) => {
    // Always push CLOSED tickets to the bottom
    if (a.status === "CLOSED" && b.status !== "CLOSED") return 1;
    if (a.status !== "CLOSED" && b.status === "CLOSED") return -1;

    let comparison = 0;
    
    if (sortField === "updatedAt") {
      comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    } else if (sortField === "priority") {
      comparison = (priorityWeight[a.priority as keyof typeof priorityWeight] || 0) - (priorityWeight[b.priority as keyof typeof priorityWeight] || 0);
    } else if (sortField === "status") {
      comparison = (statusWeight[a.status as keyof typeof statusWeight] || 0) - (statusWeight[b.status as keyof typeof statusWeight] || 0);
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-blue-500/10 text-blue-600";
      case "SEEN": return "bg-cyan-500/10 text-cyan-600";
      case "IN_PROGRESS": return "bg-amber-500/10 text-amber-600";
      case "WAITING_FOR_USER": return "bg-purple-500/10 text-purple-600";
      case "RESOLVED": return "bg-emerald-500/10 text-emerald-600";
      case "CLOSED": return "bg-gray-500/10 text-gray-600";
      default: return "bg-gray-500/10 text-gray-600";
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "LOW": return "کم";
      case "MEDIUM": return "متوسط";
      case "HIGH": return "زیاد";
      case "URGENT": return "اورژانسی";
      default: return priority;
    }
  };

  return (
    <div className="bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="شناسه، موضوع، نام، ایمیل یا موبایل کاربر..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
            className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all text-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right whitespace-nowrap">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="py-4 px-4 font-bold text-gray-900 dark:text-white">شناسه</th>
              <th className="py-4 px-4 font-bold text-gray-900 dark:text-white">موضوع</th>
              <th className="py-4 px-4 font-bold text-gray-900 dark:text-white">کاربر</th>
              <th className="py-4 px-4 text-gray-900 dark:text-white"><SortableHeader label="اولویت" field="priority" sortField={sortField} sortOrder={sortOrder} setSortField={setSortField} setSortOrder={setSortOrder} setCurrentPage={setCurrentPage} /></th>
              <th className="py-4 px-4 text-gray-900 dark:text-white"><SortableHeader label="وضعیت" field="status" sortField={sortField} sortOrder={sortOrder} setSortField={setSortField} setSortOrder={setSortOrder} setCurrentPage={setCurrentPage} /></th>
              <th className="py-4 px-4 text-gray-900 dark:text-white"><SortableHeader label="آخرین بروزرسانی" field="updatedAt" sortField={sortField} sortOrder={sortOrder} setSortField={setSortField} setSortOrder={setSortOrder} setCurrentPage={setCurrentPage} /></th>
              <th className="py-4 px-4 font-bold text-gray-900 dark:text-white">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((ticket) => (
              <tr key={ticket.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                  #{ticket.id.split("-")[0]}
                </td>
                <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                  {ticket.subject}
                </td>
                <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {ticket.user?.name || "بدون نام"} <br/>
                  <span className="text-xs text-gray-500">{ticket.user?.email}</span>
                </td>
                <td className="py-4 px-4 text-sm">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    ticket.priority === 'URGENT' ? 'bg-red-500/10 text-red-600' :
                    ticket.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-600' :
                    ticket.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-gray-500/10 text-gray-600'
                  }`}>
                    {getPriorityText(ticket.priority)}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(ticket.status)}`}>
                    {getStatusText(ticket.status)}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400" dir="ltr">
                  {new Date(ticket.updatedAt).toLocaleString("fa-IR", {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="py-4 px-4">
                  <Link 
                    href={`/admin/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    مشاهده
                  </Link>
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  تیکتی یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredTickets.length / itemsPerPage)}
        totalCount={filteredTickets.length}
        limit={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        className="rounded-t-none border-x-0 border-b-0 border-t"
      />
    </div>
  );
}
