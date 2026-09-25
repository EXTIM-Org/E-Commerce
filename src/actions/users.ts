"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { canManageRoles } from "@/lib/permissions";
import { UserRole } from "@/lib/permissions";

import { or } from "@prisma/orm-postgres/orm-client";

export async function getUsers(page: number = 1, limit: number = 10, searchQuery: string = "") {
  const session = await getSession();
  if (!session || !canManageRoles(session.role as string)) {
    throw new Error("Unauthorized");
  }

  const offset = (page - 1) * limit;

  const baseQuery = db.orm.public.User;

  const query = searchQuery
    ? baseQuery.where((u: any) =>
      or(
        u.name.ilike(`%${searchQuery}%`),
        u.email.ilike(`%${searchQuery}%`),
        u.phoneNumber.ilike(`%${searchQuery}%`)
      )
    )
    : baseQuery;

  const users = await query
    .orderBy((u: any) => u.createdAt.desc())
    .limit(limit)
    .offset(offset)
    .all();

  const agg = await query.aggregate((a: any) => ({ total: a.count() }));
  const totalUsers = Number(agg.total || 0);
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users,
    totalUsers,
    totalPages,
    currentPage: page
  };
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await getSession();
  if (!session || !canManageRoles(session.role as string)) {
    return { error: "دسترسی غیرمجاز" };
  }

  try {
    const targetUser = await db.orm.public.User.where({ id: userId }).first();
    if (targetUser?.role === "SUPER_ADMIN") {
      return { error: "نقش سوپر ادمین غیرقابل تغییر است." };
    }

    if (session.role !== "SUPER_ADMIN") {
      if (targetUser?.role === "ADMIN") {
        return { error: "شما اجازه تغییر نقش سایر ادمین‌ها را ندارید." };
      }
      if (newRole === "ADMIN" || newRole === "SUPER_ADMIN") {
        return { error: "شما اجازه ارتقای یک کاربر به سطح ادمین یا سوپر ادمین را ندارید." };
      }
    }

    if (newRole === "SUPER_ADMIN") {
      if (session.role !== "SUPER_ADMIN") {
        return { error: "فقط سوپر ادمین می‌تواند نقش سوپر ادمین را اختصاص دهد." };
      }
      const existingSuperAdmin = await db.orm.public.User.where({ role: "SUPER_ADMIN" }).first();
      if (existingSuperAdmin && existingSuperAdmin.id !== userId) {
        return { error: "سیستم فقط می‌تواند یک سوپر ادمین داشته باشد." };
      }
    }

    await db.orm.public.User.where({ id: userId }).update({
      role: newRole,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: "خطایی رخ داد" };
  }
}

export async function getUserById(userId: string) {
  const session = await getSession();
  if (!session || !canManageRoles(session.role as string)) {
    throw new Error("Unauthorized");
  }

  const user = await db.orm.public.User
    .where({ id: userId })
    .include("orders", (q) => q.orderBy(o => o.createdAt.desc()).limit(5))
    .include("tickets", (q) => q.orderBy(t => t.createdAt.desc()).limit(5))
    .include("addresses")
    .include("cart", c => c.include("items", i => i.include("variant", v => v.include("product"))))
    .first();

  if (!user) return null;

  const orderStats = await db.orm.public.Order.where({ userId }).aggregate(a => ({
    count: a.count()
  }));

  const ticketStats = await db.orm.public.Ticket.where({ userId }).aggregate(a => ({
    count: a.count()
  }));

  const reviewStats = await db.orm.public.Review.where({ userId }).aggregate(a => ({
    count: a.count()
  }));

  const stats = {
    ordersCount: orderStats.count,
    ticketsCount: ticketStats.count,
    reviewsCount: reviewStats.count
  };

  const totalSpentStats = await db.orm.public.Order.where({ userId, status: "DELIVERED" }).aggregate(a => ({
    totalSpent: a.sum("totalAmount")
  }));

  const cancelledOrderStats = await db.orm.public.Order.where({ userId, status: "CANCELLED" }).aggregate(a => ({
    count: a.count()
  }));

  const returnedItemsStats = await db.orm.public.ReturnRequest.where({ userId, status: "REFUNDED" }).aggregate(a => ({
    count: a.count()
  }));

  return {
    ...user, stats: {
      ...stats,
      totalSpent: totalSpentStats.totalSpent ?? 0,
      cancelledOrdersCount: cancelledOrderStats.count,
      returnedItemsCount: returnedItemsStats.count
    }
  };
}

export async function updateUserBanStatus(userId: string, isBanned: boolean, banReason?: string) {
  const session = await getSession();
  if (!session || !canManageRoles(session.role as string)) {
    return { error: "دسترسی غیرمجاز" };
  }

  const targetUser = await db.orm.public.User.where({ id: userId }).first();
  if (!targetUser) {
    return { error: "کاربر یافت نشد" };
  }

  if (targetUser.role === "SUPER_ADMIN") {
    return { error: "سوپر ادمین غیرقابل مسدود شدن است" };
  }

  try {
    await db.orm.public.User.where({ id: userId }).update({
      isBanned,
      banReason: isBanned ? (banReason || "بدون دلیل") : null,
    });
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating ban status:", error);
    return { error: "خطایی رخ داد" };
  }
}

export async function updateUserAdminNotes(userId: string, adminNotes: string) {
  const session = await getSession();
  if (!session || !canManageRoles(session.role as string)) {
    return { error: "دسترسی غیرمجاز" };
  }

  try {
    await db.orm.public.User.where({ id: userId }).update({
      adminNotes,
    });
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating admin notes:", error);
    return { error: "خطایی رخ داد" };
  }
}

export async function sendSmsToUser(userId: string, message: string) {
  const session = await getSession();
  if (!session || !canManageRoles(session.role as string)) {
    return { error: "دسترسی غیرمجاز" };
  }

  const targetUser = await db.orm.public.User.where({ id: userId }).first();
  if (!targetUser) {
    return { error: "کاربر یافت نشد" };
  }

  if (!targetUser.phoneNumber) {
    return { error: "این کاربر شماره موبایل ثبت نکرده است" };
  }

  // Simulate sending SMS
  console.log(`\n========================================`);
  console.log(`[SMS SENDER SIMULATION]`);
  console.log(`To: ${targetUser.name || "کاربر"} (${targetUser.phoneNumber})`);
  console.log(`Message:\n${message}`);
  console.log(`========================================\n`);

  return { success: true };
}
