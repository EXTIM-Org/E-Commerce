import { db } from "@/prisma/db";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import { OrderReceiptEmail } from "@/emails/OrderReceiptEmail";
import React from "react";
import { getLogger } from "@/lib/logger";

export async function markOrderAsPaid(orderId: string) {
  // We can't know userId yet, so we use base logger until we fetch order
  const baseLog = getLogger();
  try {
    // 1. Fetch the order with its user and items
    const order = await db.orm.public.Order
      .where({ id: orderId })
      .include("user")
      .include("items", (i) => i.include("variant", (v) => v.include("product")))
      .first();

    if (!order) {
      baseLog.warn({ orderId }, "markOrderAsPaid called but order not found");
      return { success: false, error: "سفارش یافت نشد." };
    }
    
    const log = getLogger(order.userId);

    if (order.status === "PAID") {
      log.warn({ orderId }, "Order is already paid");
      return { success: false, error: "این سفارش قبلاً پرداخت شده است." };
    }

    // 2. Update status to PAID
    await db.orm.public.Order.where({ id: orderId }).update({
      status: "PAID"
    });
    
    log.info({ orderId, amount: order.totalAmount }, "Order marked as PAID successfully");
    
    // 2.5 Increment salesCount for each product in the order
    for (const item of order.items) {
      if (item.variant?.productId) {
        const plan = db.raw.sql`
          UPDATE product
          SET "salesCount" = "salesCount" + ${item.quantity}
          WHERE id = ${item.variant.productId}
        `.affectedCount().build();
        await db.runtime().execute(plan);
      }
    }

    // 3. Prepare data for the Receipt Email
    if (order.user && order.user.email) {
      const items = order.items.map(item => ({
        name: item.variant?.product?.name || "محصول نامشخص",
        quantity: item.quantity,
        price: Number(item.unitPrice),
      }));

      const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const total = Number(order.totalAmount);
      const shipping = total - subtotal; // Calculate shipping cost from difference

      // Render the email template to an HTML string
      const html = await render(
        React.createElement(OrderReceiptEmail, {
          customerName: order.receiverName || order.user.name || "مشتری عزیز",
          orderId: order.id,
          items,
          subtotal,
          shipping,
          total,
          shippingAddress: order.shippingAddress,
          date: new Date().toLocaleDateString('fa-IR'),
        })
      );
      
      // Fire and forget (don't block)
      sendEmail({
        to: order.user.email,
        subject: `رسید پرداخت سفارش #${order.id.split('-')[0]}`,
        html,
      }).catch(e => {
        log.error({ err: e, orderId }, "Failed to send receipt email");
      });
    }

    return { success: true };
  } catch (error) {
    baseLog.error({ err: error, orderId }, "Failed to mark order as paid");
    return { success: false, error: "خطایی رخ داد." };
  }
}
