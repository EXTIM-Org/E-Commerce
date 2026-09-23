import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { NewTicketForm } from "./NewTicketForm";

export const metadata = {
  title: "ثبت تیکت جدید | پروفایل",
};

export default async function NewTicketPage() {
  const session = await getSession();
  
  // Fetch user orders to link to ticket
  const orders = await db.orm.public.Order
    .where({ userId: session?.userId as string })
    .orderBy(o => o.createdAt.desc())
    .all();

  return (
    <div className="bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ثبت تیکت جدید</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">مشکل یا درخواست خود را به دقت ثبت کنید تا پشتیبانان ما بررسی کنند.</p>
      </div>

      <NewTicketForm orders={orders.map(o => ({ id: o.id, createdAt: o.createdAt }))} />
    </div>
  );
}
