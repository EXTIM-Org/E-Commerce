import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { canManageSupport } from "@/lib/permissions";
import { TicketsList } from "./TicketsList";

export const metadata = {
  title: 'تیکت‌های پشتیبانی | ادمین',
};

export default async function AdminTicketsPage() {
  const session = await getSession();
  if (!session || !canManageSupport(session.role as string)) {
    redirect("/admin");
  }

  const tickets = await db.orm.public.Ticket
    .orderBy(t => t.updatedAt.desc())
    .include("user", u => u.select("name", "email"))
    .all();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تیکت‌های پشتیبانی</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          مشاهده و پاسخ‌دهی به تیکت‌های کاربران
        </p>
      </div>

      <TicketsList initialTickets={tickets} />
    </div>
  );
}
