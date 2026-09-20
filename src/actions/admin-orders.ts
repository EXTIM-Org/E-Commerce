"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const session = await getSession();
    
    // Only allow admins to update orders
    if (!session || !session.userId || session.role !== "ADMIN") {
      return { success: false, error: "عدم دسترسی. فقط مدیران می‌توانند وضعیت سفارش را تغییر دهند." };
    }

    // Cast the string back to the Prisma enum type if needed, though Prisma 8 client accepts strings
    // matching the enum for OrderStatus (PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
    await db.orm.public.Order.where({ id: orderId }).update({
      status: newStatus as any, // Using 'as any' just in case TS complains about strict enum typing in Prisma 8
    });

    revalidatePath("/admin/orders");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "خطایی در بروزرسانی وضعیت رخ داد." };
  }
}
