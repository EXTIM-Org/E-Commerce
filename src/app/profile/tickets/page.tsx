import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { UserTicketsList } from "./UserTicketsList";

export const metadata = {
  title: "تیکت‌های پشتیبانی | پروفایل",
};

export default async function TicketsPage() {
  const session = await getSession();
  
  const tickets = await db.orm.public.Ticket
    .where({ userId: session?.userId as string })
    .orderBy(t => t.updatedAt.desc())
    .all();

  return <UserTicketsList initialTickets={tickets} />;
}
