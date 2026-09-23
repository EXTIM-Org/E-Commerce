import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Clock, ShieldAlert, Package } from "lucide-react";
import { AdminTicketReplyForm } from "./AdminTicketReplyForm";
import { TicketStatusUpdater } from "./TicketStatusUpdater";
import { canManageSupport } from "@/lib/permissions";

export const metadata = {
  title: "جزئیات تیکت | ادمین",
};

export default async function AdminTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !canManageSupport(session.role as string)) {
    redirect("/admin");
  }
  
  const ticket = await db.orm.public.Ticket
    .where({ id })
    .include("messages", m => m.orderBy(msg => msg.createdAt.asc()).include("user"))
    .include("user")
    .include("order")
    .first();

  if (!ticket) {
    redirect("/admin/tickets");
  }

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
    <div className="bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/tickets" className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500">
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              {ticket.subject}
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    ticket.priority === 'URGENT' ? 'bg-red-500/10 text-red-600' :
                    ticket.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-600' :
                    ticket.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-gray-500/10 text-gray-600'
                  }`}>
                    اولویت: {getPriorityText(ticket.priority)}
              </span>
            </h1>
            <div className="text-sm text-gray-500 mt-2 flex flex-wrap items-center gap-3">
              <span>تیکت #{ticket.id.split("-")[0]}</span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span>فرستنده: {ticket.user?.name || "بدون نام"} ({ticket.user?.email})</span>
              
              {ticket.orderId && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <Link 
                    href={`/admin/orders/${ticket.orderId}`}
                    className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-medium hover:underline bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-md transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    مرتبط با سفارش #{ticket.orderId.split("-")[0]}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        <TicketStatusUpdater ticketId={ticket.id} initialStatus={ticket.status} />
      </div>

      <div className="space-y-6 mb-8">
        {ticket.messages.map((msg) => {
          const isUser = msg.userId === ticket.userId;
          const isInternal = msg.isInternal;
          
          return (
            <div key={msg.id} className={`flex flex-col ${!isUser ? "items-start" : "items-end"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  {isInternal && <ShieldAlert className="w-3 h-3 text-rose-500" />}
                  {isUser ? ticket.user?.name : (msg.userId === session.userId ? "شما" : msg.user?.name || "پشتیبان")}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(msg.createdAt).toLocaleString("fa-IR")}
                </span>
              </div>
              <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${
                isUser 
                  ? "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-tl-none border border-black/5 dark:border-white/5" 
                  : isInternal
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-tr-none border border-rose-500/20"
                    : "bg-violet-600 text-white rounded-tr-none shadow-lg shadow-violet-600/20"
              }`}>
                {isInternal && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2 border-b border-rose-500/20 pb-1">
                    یادداشت داخلی (کاربر نمی‌بیند)
                  </p>
                )}
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                  {msg.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <AdminTicketReplyForm ticketId={ticket.id} />
    </div>
  );
}
