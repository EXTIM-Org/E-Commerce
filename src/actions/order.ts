"use server";
import { canManageStore } from "@/lib/permissions";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { notificationQueue } from "@/jobs/queues";

type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await getSession();
  if (!session || !canManageStore(session.role as string)) {
    return { success: false, error: "دسترسی غیرمجاز" };
  }

  try {
    const order = await db.orm.public.Order.where({ id: orderId }).include("user").first();
    if (!order) {
      return { success: false, error: "سفارش یافت نشد" };
    }

    await db.orm.public.Order.where({ id: orderId }).update({ status });

    // Send email to user
    if (order.user?.email) {
      const subject = `تغییر وضعیت سفارش #${order.id.slice(0, 8)}`;
      
      let statusText: string = status;
      if (status === "PAID") statusText = "تایید شده (پرداخت موفق)";
      else if (status === "PROCESSING") statusText = "در حال پردازش";
      else if (status === "SHIPPED") statusText = "ارسال شده";
      else if (status === "DELIVERED") statusText = "تحویل شده";
      else if (status === "CANCELLED") statusText = "لغو شده";

      const html = `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>سلام ${order.user.name || "کاربر عزیز"}،</h2>
          <p>وضعیت سفارش شما با شماره پیگیری <strong>${order.id.slice(0, 8)}</strong> به <strong>${statusText}</strong> تغییر یافت.</p>
          ${status === "SHIPPED" && order.trackingCode ? `<p>کد رهگیری پست: <strong>${order.trackingCode}</strong></p>` : ""}
          <p>برای مشاهده جزئیات بیشتر به پروفایل خود مراجعه کنید.</p>
          <p>با تشکر،<br/>تیم پشتیبانی</p>
        </div>
      `;
      
      await notificationQueue.add("send-email", {
        type: "email",
        payload: { to: order.user.email, subject, html }
      });
    }

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/profile/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "خطا در به‌روزرسانی وضعیت سفارش" };
  }
}

export async function updateTrackingCode(orderId: string, trackingCode: string) {
  const session = await getSession();
  if (!session || !canManageStore(session.role as string)) {
    return { success: false, error: "دسترسی غیرمجاز" };
  }

  try {
    await db.orm.public.Order.where({ id: orderId }).update({ trackingCode });
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/profile/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating tracking code:", error);
    return { success: false, error: "خطا در ثبت کد رهگیری" };
  }
}
