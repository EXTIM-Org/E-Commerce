"use server";
import { canManageStore } from "@/lib/permissions";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import { OrderStatusEmail } from "@/emails/OrderStatusEmail";
import React from "react";
import { markOrderAsPaid } from "@/services/order";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const session = await getSession();
    
    // Only allow admins to update orders
    if (!session || !session.userId || !canManageStore(session.role as string)) {
      return { success: false, error: "عدم دسترسی. فقط مدیران می‌توانند وضعیت سفارش را تغییر دهند." };
    }

    // If the status is PAID, use our specialized payment service
    // which handles both the status update and the receipt email
    if (newStatus === "PAID") {
      const result = await markOrderAsPaid(orderId);
      if (!result.success) return result;
      revalidatePath("/admin/orders");
      return { success: true };
    }

    // Fetch the order and user to get the email address
    const order = await db.orm.public.Order.where({ id: orderId }).include("user").first();
    if (!order) {
      return { success: false, error: "سفارش یافت نشد." };
    }

    // Cast the string back to the Prisma enum type if needed, though Prisma 8 client accepts strings
    // matching the enum for OrderStatus (PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
    await db.orm.public.Order.where({ id: orderId }).update({
      status: newStatus as any, // Using 'as any' just in case TS complains about strict enum typing in Prisma 8
    });

    // Send email notification if status is one that users care about
    if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(newStatus)) {
      if (order.user && order.user.email) {
        // Render the email template to an HTML string
        const html = await render(
          React.createElement(OrderStatusEmail, {
            customerName: order.user.name || "کاربر",
            orderId: order.id,
            status: newStatus,
          })
        );
        
        // Fire and forget (don't await so we don't block the UI response)
        sendEmail({
          to: order.user.email,
          subject: `بروزرسانی وضعیت سفارش #${order.id.split('-')[0]}`,
          html,
        }).catch(console.error);
      }
    }

    revalidatePath("/admin/orders");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "خطایی در بروزرسانی وضعیت رخ داد." };
  }
}
