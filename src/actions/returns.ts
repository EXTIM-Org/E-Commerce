"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createReturnRequest(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { error: "لطفاً ابتدا وارد حساب کاربری شوید." };
    }

    const orderItemId = formData.get("orderItemId") as string;
    const reason = formData.get("reason") as string;
    const description = formData.get("description") as string | null;
    
    // Parse uploaded image paths if any
    const imagesRaw = formData.getAll("images");
    const images: string[] = [];
    for (const img of imagesRaw) {
      if (typeof img === "string" && img.trim() !== "") {
        images.push(img);
      }
    }

    if (!orderItemId || !reason) {
      return { error: "لطفاً دلیل مرجوعی را انتخاب کنید." };
    }

    // Ensure order is delivered and belongs to user
    const orderItem = await db.orm.public.OrderItem
      .where({ id: orderItemId })
      .include("order", (o) => o.include("user"))
      .include("variant", (v) => v.include("product"))
      .first();

    if (!orderItem || orderItem.order?.userId !== session.userId) {
      return { error: "آیتم سفارش یافت نشد یا متعلق به شما نیست." };
    }

    if (orderItem.order?.status !== "DELIVERED") {
      return { error: "فقط سفارشات تحویل داده شده قابل مرجوعی هستند." };
    }

    // Check if within 7 days
    const deliveredDate = orderItem.order.updatedAt; // assuming updatedAt is when it was delivered
    const daysSinceDelivery = (Date.now() - new Date(deliveredDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      return { error: "مهلت ۷ روزه مرجوعی کالا برای این سفارش به پایان رسیده است." };
    }

    // Check if already requested
    const existing = await db.orm.public.ReturnRequest.where({ orderItemId }).first();
    if (existing) {
      return { error: "برای این محصول قبلاً درخواست مرجوعی ثبت شده است." };
    }

    await db.orm.public.ReturnRequest.create({
      orderItemId,
      userId: session.userId as string,
      reason,
      description,
      images,
    });
    
    // --- SEND SUBMITTED NOTIFICATIONS ---
    if (orderItem.order?.user && orderItem.variant?.product?.name) {
      const productName = orderItem.variant.product.name;
      const subject = "ثبت درخواست مرجوعی";
      const message = `مشتری گرامی، درخواست مرجوعی شما برای کالای "${productName}" با موفقیت ثبت شد و در صف بررسی قرار گرفت.`;

      // Read Notification Settings
      const { getNotificationSettings } = await import("@/actions/settings");
      const notifSettings = await getNotificationSettings().catch(() => ({
        globalSms: true,
        globalEmail: true,
        returns_submitted_sms: false,
        returns_submitted_email: false,
      }));
      
      const canSendSms = notifSettings.globalSms && notifSettings.returns_submitted_sms;
      const canSendEmail = notifSettings.globalEmail && notifSettings.returns_submitted_email;

      if (canSendSms && orderItem.order.user.phoneNumber) {
        import("@/lib/sms").then(({ sendSms }) => sendSms({ to: orderItem.order!.user.phoneNumber!, text: message })).catch(console.error);
      }
      
      if (canSendEmail && orderItem.order.user.email) {
        import("@/lib/email").then(({ sendEmail }) => sendEmail({ 
          to: orderItem.order!.user.email!, 
          subject: `فروشگاه اکستیم - ${subject}`, 
          html: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
                  <h2>${subject}</h2>
                  <p>${message}</p>
                  <hr style="border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #777;">فروشگاه اینترنتی اکستیم</p>
                 </div>` 
        })).catch(console.error);
      }
    }

    revalidatePath("/profile/orders/[id]", "page");
    return { success: true, message: "درخواست مرجوعی با موفقیت ثبت شد." };
  } catch (error) {
    console.error("Create return request error:", error);
    return { error: "خطایی در ثبت درخواست رخ داد." };
  }
}

export async function getAdminReturnRequests() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    throw new Error("دسترسی غیرمجاز");
  }

  const submittedRequests = await db.orm.public.ReturnRequest
    .where({ status: "SUBMITTED" })
    .all();

  if (submittedRequests.length > 0) {
    // Background update to trigger notifications without blocking page load
    Promise.all(
      submittedRequests.map((req) => updateReturnRequestStatus(req.id, "PENDING"))
    ).catch(console.error);
  }

  const requests = await db.orm.public.ReturnRequest
    .include("user")
    .include("orderItem", (oi) => oi.include("order").include("variant", (v) => v.include("product")))
    .orderBy((r) => r.createdAt.desc())
    .all();
    
  // Optimistically return them as PENDING if they were SUBMITTED
  return requests.map(req => {
    if (req.status === "SUBMITTED") {
      req.status = "PENDING";
    }
    return req;
  });
}

import { sendSms } from "@/lib/sms";
import { sendEmail } from "@/lib/email";

export async function updateReturnRequestStatus(requestId: string, status: "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED", adminNote?: string) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return { error: "دسترسی غیرمجاز" };
    }

    const request = await db.orm.public.ReturnRequest
      .where({ id: requestId })
      .include("orderItem", (oi) => oi.include("variant", (v) => v.include("product")))
      .include("user")
      .first();

    if (!request) {
      return { error: "درخواست یافت نشد." };
    }

    await db.transaction(async (tx) => {
      await tx.orm.public.ReturnRequest.where({ id: requestId }).update({
        status,
        adminNote: adminNote || request.adminNote,
      });

      // If refunded, restock inventory if it wasn't already
      if (status === "REFUNDED" && request.status !== "REFUNDED") {
        const inventory = await tx.orm.public.Inventory.where({ variantId: request.orderItem!.variantId }).first();
        if (inventory) {
          const plan = db.raw.sql`
            UPDATE inventory 
            SET "stockQuantity" = "stockQuantity" + ${request.orderItem!.quantity}
            WHERE id = ${inventory.id}
          `.affectedCount().build();
          await tx.execute(plan);

          await tx.orm.public.InventoryTransaction.create({
            inventoryId: inventory.id,
            type: "RETURN",
            quantity: request.orderItem!.quantity,
            reference: `Return-${request.id}`
          });
        }
      }
    });

    // --- SEND NOTIFICATIONS ---
    // Make sure we have a user and product name
    if (request.user && request.orderItem?.variant?.product?.name) {
      const productName = request.orderItem.variant.product.name;
      let subject = "";
      let message = "";
      
      switch (status) {
        case "APPROVED":
          subject = "تایید درخواست مرجوعی";
          message = `مشتری گرامی، درخواست مرجوعی شما برای کالای "${productName}" تایید شد. لطفاً کالا را به آدرس فروشگاه ارسال کنید.`;
          break;
        case "REJECTED":
          subject = "رد درخواست مرجوعی";
          message = `مشتری گرامی، متاسفانه درخواست مرجوعی شما برای کالای "${productName}" رد شد. علت: ${adminNote || 'عدم تطابق با قوانین مرجوعی سایت'}`;
          break;
        case "REFUNDED":
          subject = "استرداد وجه مرجوعی";
          message = `مشتری گرامی، فرآیند مرجوعی کالای "${productName}" با موفقیت به پایان رسید و وجه آن به حساب شما واریز شد.`;
          break;
        case "PENDING":
          subject = "درخواست مرجوعی در حال بررسی";
          message = `مشتری گرامی، درخواست مرجوعی شما برای کالای "${productName}" مجدداً در وضعیت بررسی قرار گرفت.`;
          break;
      }

      // Read Notification Settings
      const { getNotificationSettings } = await import("@/actions/settings");
      const notifSettings = await getNotificationSettings().catch(() => ({
        globalSms: true,
        globalEmail: true,
        returns_pending_sms: false,
        returns_pending_email: false,
        returns_approved_sms: true,
        returns_approved_email: true,
        returns_rejected_sms: true,
        returns_rejected_email: true,
        returns_refunded_sms: true,
        returns_refunded_email: true,
      }));
      
      let specificSmsEnabled = false;
      let specificEmailEnabled = false;
      
      switch (status) {
        case "PENDING":
          specificSmsEnabled = notifSettings.returns_pending_sms;
          specificEmailEnabled = notifSettings.returns_pending_email;
          break;
        case "APPROVED":
          specificSmsEnabled = notifSettings.returns_approved_sms;
          specificEmailEnabled = notifSettings.returns_approved_email;
          break;
        case "REJECTED":
          specificSmsEnabled = notifSettings.returns_rejected_sms;
          specificEmailEnabled = notifSettings.returns_rejected_email;
          break;
        case "REFUNDED":
          specificSmsEnabled = notifSettings.returns_refunded_sms;
          specificEmailEnabled = notifSettings.returns_refunded_email;
          break;
      }
      
      const canSendSms = notifSettings.globalSms && specificSmsEnabled;
      const canSendEmail = notifSettings.globalEmail && specificEmailEnabled;

      // Send SMS
      if (canSendSms && request.user.phoneNumber) {
        sendSms({ to: request.user.phoneNumber, text: message }).catch(console.error);
      }
      
      // Send Email
      if (canSendEmail && request.user.email) {
        sendEmail({ 
          to: request.user.email, 
          subject: `فروشگاه اکستیم - ${subject}`, 
          html: `<div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
                  <h2>${subject}</h2>
                  <p>${message}</p>
                  <hr style="border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #777;">فروشگاه اینترنتی اکستیم</p>
                 </div>` 
        }).catch(console.error);
      }
    }

    revalidatePath("/admin/returns");
    return { success: true };
  } catch (error) {
    console.error("Update return status error:", error);
    return { error: "خطایی رخ داد." };
  }
}
