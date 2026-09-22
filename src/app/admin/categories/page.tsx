import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { CategoryClient } from "./CategoryClient";

export const metadata = {
  title: "مدیریت دسته‌بندی‌ها",
};

export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/auth/login");

  const user = await db.orm.public.User.first({ id: session.userId as string });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  const categories = await db.orm.public.Category.orderBy((c) => c.createdAt.desc()).all();

  return <CategoryClient categories={categories} />;
}
