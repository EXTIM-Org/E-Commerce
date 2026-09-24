"use server";
import { canManageStore } from "@/lib/permissions";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { render } from "@react-email/render";
import { notificationQueue } from "@/jobs/queues";
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
    if (["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(newStatus)) {
      if (order.user) {
        // Read Notification Settings
        const { getNotificationSettings } = await import("@/actions/settings");
        const notifSettings = await getNotificationSettings().catch(() => ({
          globalSms: true,
          globalEmail: true,
          orders_processing_sms: true,
          orders_processing_email: true,
          orders_shipped_sms: true,
          orders_shipped_email: true,
          orders_delivered_sms: true,
          orders_delivered_email: true,
          orders_cancelled_sms: true,
          orders_cancelled_email: true,
        }));
        
        let specificSmsEnabled = false;
        let specificEmailEnabled = false;
        
        switch (newStatus) {
          case "PROCESSING":
            specificSmsEnabled = notifSettings.orders_processing_sms;
            specificEmailEnabled = notifSettings.orders_processing_email;
            break;
          case "SHIPPED":
            specificSmsEnabled = notifSettings.orders_shipped_sms;
            specificEmailEnabled = notifSettings.orders_shipped_email;
            break;
          case "DELIVERED":
            specificSmsEnabled = notifSettings.orders_delivered_sms;
            specificEmailEnabled = notifSettings.orders_delivered_email;
            break;
          case "CANCELLED":
            specificSmsEnabled = notifSettings.orders_cancelled_sms;
            specificEmailEnabled = notifSettings.orders_cancelled_email;
            break;
        }
        
        const canSendSms = notifSettings.globalSms && specificSmsEnabled;
        const canSendEmail = notifSettings.globalEmail && specificEmailEnabled;

        if (canSendEmail && order.user.email) {
          // Render the email template to an HTML string
          const html = await render(
            React.createElement(OrderStatusEmail, {
              customerName: order.user.name || "کاربر",
              orderId: order.id,
              status: newStatus,
            })
          );
          
          // Send via BullMQ queue
          await notificationQueue.add("send-email", {
            type: "email",
            payload: {
              to: order.user.email,
              subject: `بروزرسانی وضعیت سفارش #${order.id.split('-')[0]}`,
              html,
            }
          });
        }

        if (canSendSms && order.user.phoneNumber) {
          let persianStatus = newStatus;
          switch (newStatus) {
            case "PROCESSING": persianStatus = "در حال پردازش"; break;
            case "SHIPPED": persianStatus = "ارسال شده"; break;
            case "DELIVERED": persianStatus = "تحویل داده شده"; break;
            case "CANCELLED": persianStatus = "لغو شده"; break;
          }
          await notificationQueue.add("send-sms", {
            type: "sms",
            payload: {
              to: order.user.phoneNumber,
              text: `اکستیم\nسفارش #${order.id.split('-')[0]} شما به وضعیت ${persianStatus} تغییر یافت.`,
            }
          });
        }
      }
    }

    revalidatePath("/admin/orders");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "خطایی در بروزرسانی وضعیت رخ داد." };
  }
}
