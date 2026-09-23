import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Clock, Info } from "lucide-react";
import { TicketReplyForm } from "./TicketReplyForm";
import { CloseTicketButton } from "./CloseTicketButton";

export const metadata = {
  title: "جزئیات تیکت | پروفایل",
};

export default async function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  
  const ticket = await db.orm.public.Ticket
    .where({ id, userId: session?.userId as string })
    .include("messages", m => m.orderBy(msg => msg.createdAt.asc()).include("user"))
    .first();

  if (!ticket) {
    redirect("/profile/tickets");
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "text-blue-600 bg-blue-500/10";
      case "SEEN": return "text-cyan-600 bg-cyan-500/10";
      case "IN_PROGRESS": return "text-amber-600 bg-amber-500/10";
      case "WAITING_FOR_USER": return "text-purple-600 bg-purple-500/10";
      case "RESOLVED": return "text-emerald-600 bg-emerald-500/10";
      case "CLOSED": return "text-gray-600 bg-gray-500/10";
      default: return "text-gray-600 bg-gray-500/10";
    }
  };

  return (
    <div className="bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/profile/tickets" className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500">
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              {ticket.subject}
            </h1>
            <p className="text-sm text-gray-500 mt-1">تیکت #{ticket.id.split("-")[0]}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
            <CloseTicketButton ticketId={ticket.id} />
          )}
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(ticket.status)} border-current/20`}>
            {getStatusText(ticket.status)}
          </span>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {ticket.messages.filter(m => !m.isInternal).map((msg) => {
          const isUser = msg.userId === session?.userId;
          
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  {isUser ? "شما" : (msg.user?.name || "پشتیبان")}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(msg.createdAt).toLocaleString("fa-IR")}
                </span>
              </div>
              <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${
                isUser 
                  ? "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-tr-none border border-black/5 dark:border-white/5" 
                  : "bg-violet-600 text-white rounded-tl-none shadow-lg shadow-violet-600/20"
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                  {msg.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" ? (
        <TicketReplyForm ticketId={ticket.id} />
      ) : (
        <div className="bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/5 p-6 rounded-2xl flex items-center gap-4 text-gray-600 dark:text-gray-400">
          <Info className="w-6 h-6 text-gray-400" />
          <p>این تیکت بسته شده است و امکان ارسال پیام جدید وجود ندارد.</p>
        </div>
      )}
    </div>
  );
}
