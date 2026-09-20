import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { QAList } from "@/components/admin/QAList";

export const metadata = {
  title: "مدیریت پرسش و پاسخ | پنل ادمین EXTIM",
};

export default async function AdminQAPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const questions = await db.orm.public.Question
    .include("user")
    .include("product")
    .include("answers", (a) => a.include("user"))
    .orderBy((q) => q.createdAt.desc())
    .all();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مدیریت پرسش و پاسخ</h1>
      </div>

      <QAList initialQuestions={questions} />
    </div>
  );
}
