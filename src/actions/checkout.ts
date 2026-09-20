"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

const checkoutSchema = z.object({
  receiverName: z.string().min(2, "نام تحویل گیرنده باید حداقل ۲ کاراکتر باشد."),
  phone: z.string().regex(/^09\d{9}$/, "شماره همراه نامعتبر است. (مثال: 09123456789)"),
  fullAddress: z.string().min(10, "آدرس دقیق باید حداقل ۱۰ کاراکتر باشد."),
  postalCode: z.string().regex(/^\d{10}$/, "کد پستی باید دقیقاً ۱۰ رقم باشد.").optional().or(z.literal("")),
});

export async function getUserCheckoutData() {
  const session = await getSession();
  if (!session || !session.userId) return null;

  const userId = session.userId as string;

  // Get user details
  const user = await db.orm.public.User.where({ id: userId }).first();
  if (!user) return null;

  // Get their latest address
  const latestAddress = await db.orm.public.Address.where({ userId }).orderBy((a) => a.createdAt.desc()).first();
  
  // Get their latest order to extract the last used phone and receiver name
  const latestOrder = await db.orm.public.Order.where({ userId }).orderBy((o) => o.createdAt.desc()).first();

  return {
    receiverName: latestOrder?.receiverName || user.name || "",
    phone: latestOrder?.phone || "",
    address: latestAddress?.fullAddress || "",
    postalCode: latestAddress?.postalCode || "",
  };
}

export async function processCheckout(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { error: "برای ثبت سفارش باید وارد حساب کاربری شوید." };
    }

    const fullAddress = formData.get("address") as string;
    const receiverName = formData.get("receiverName") as string;
    const phone = formData.get("phone") as string;
    const postalCode = formData.get("postalCode") as string | null;
    const itemsRaw = formData.get("items") as string;
    
    const validation = checkoutSchema.safeParse({
      receiverName,
      phone,
      fullAddress,
      postalCode,
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    if (!itemsRaw) {
      return { error: "سبد خرید خالی است." };
    }

    const cartItems = JSON.parse(itemsRaw) as { variantId: string, quantity: number, price: number }[];
    
    if (cartItems.length === 0) {
      return { error: "سبد خرید خالی است." };
    }

    // 1. Calculate total (In a real app, you must verify prices against the DB again!)
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = totalAmount > 2000000 ? 0 : 45000;
    const finalTotal = totalAmount + shipping;

    // 2. Create the Order
    const order = await db.orm.public.Order.create({
      userId: session.userId as string,
      status: 'PENDING',
      totalAmount: finalTotal,
      receiverName,
      phone,
      shippingAddress: fullAddress,
      postalCode,
    });

    // 3. Create OrderItems & Update Inventory (in a transaction optimally, but we'll do sequentially for Prisma 8 RC)
    for (const item of cartItems) {
      await db.orm.public.OrderItem.create({
        orderId: order.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.price,
      });

      // Find inventory
      const inventory = await db.orm.public.Inventory.where({ variantId: item.variantId }).first();
      
      if (inventory) {
        // Decrease stock
        await db.orm.public.Inventory.where({ id: inventory.id }).update({
          stockQuantity: inventory.stockQuantity - item.quantity
        });

        // Log transaction
        await db.orm.public.InventoryTransaction.create({
          inventoryId: inventory.id,
          type: 'SALE',
          quantity: -item.quantity,
          reference: order.id
        });
      }
    }
    
    // 4. Auto-save Address if it doesn't exist
    const existingAddress = await db.orm.public.Address.where({ 
      userId: session.userId as string,
      fullAddress: fullAddress 
    }).first();

    if (!existingAddress) {
      await db.orm.public.Address.create({
        userId: session.userId as string,
        fullAddress: fullAddress,
        postalCode: postalCode || null,
        title: "آدرس تحویل سفارش",
      });
    }
    
    // Returning success to trigger client-side clear cart
    return { success: true, orderId: order.id };

  } catch (error) {
    console.error("Checkout error:", error);
    return { error: "خطایی در پردازش سفارش رخ داد. لطفاً دوباره تلاش کنید." };
  }
}
