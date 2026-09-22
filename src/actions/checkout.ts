"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { markOrderAsPaid } from "@/services/order";
import { validateCoupon } from "@/actions/coupon";
import { getEffectivePrice } from "@/lib/price";

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

export async function processCheckout(prevState: unknown, formData: FormData) {
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
    const simulationType = formData.get("simulationType") as string;
    const couponCode = formData.get("couponCode") as string | null;
    
    // Simulate failed payment
    if (simulationType === "FAIL") {
      return { error: "پرداخت ناموفق بود (شبیه‌سازی خطا توسط درگاه پرداخت). لطفاً مجدداً تلاش کنید." };
    }
    
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

    // 1. Fetch valid variants from the DB to prevent Foreign Key errors and secure prices
    const variantIds = cartItems.map(item => item.variantId);
    const dbVariants = await db.orm.public.ProductVariant
      .where((v) => v.id.in(variantIds))
      .include('product', (p) => p.include('flashSale'))
      .all();

    // Map them for quick access
    const dbVariantMap = new Map(dbVariants.map(v => [v.id, v]));

    // Validate cart items
    for (const item of cartItems) {
      if (!dbVariantMap.has(item.variantId)) {
        return { error: "برخی از محصولات سبد خرید شما دیگر در سیستم موجود نیستند. لطفاً سبد خرید خود را بروزرسانی کنید." };
      }
    }

    // 2. Calculate true total amount securely using Database prices!
    let totalAmount = 0;
    const validatedOrderItems = cartItems.map(item => {
      const dbVariant = dbVariantMap.get(item.variantId)!;
      // Price logic: if variant has specific price use it, else use base product price
      const basePrice = dbVariant.price ?? dbVariant.product?.basePrice ?? 0;
      const { finalPrice } = getEffectivePrice(basePrice, dbVariant.product?.flashSale);
      
      totalAmount += finalPrice * item.quantity;
      
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: finalPrice,
      };
    });

    const shipping = totalAmount > 2000000 ? 0 : 45000;
    
    let discountAmount = 0;
    let appliedCouponId: string | null = null;
    
    // Validate Coupon if provided
    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, totalAmount);
      if (!couponRes.success) {
        return { error: couponRes.error || "کد تخفیف نامعتبر است." };
      }
      discountAmount = couponRes.discountAmount || 0;
      appliedCouponId = couponRes.couponId || null;
    }
    
    const finalTotal = totalAmount + shipping - discountAmount;

    // 3. Create the Order and process items in a Transaction
    const txResult = await db.transaction(async (tx) => {
      const newOrder = await tx.orm.public.Order.create({
        userId: session.userId as string,
        status: 'PENDING',
        totalAmount: finalTotal,
        couponId: appliedCouponId,
        discountAmount,
        receiverName,
        phone,
        shippingAddress: fullAddress,
        postalCode,
      });
      
      // Increment coupon usage
      if (appliedCouponId) {
        const coupon = await tx.orm.public.Coupon.where({ id: appliedCouponId }).first();
        if (coupon) {
          await tx.orm.public.Coupon.where({ id: appliedCouponId }).update({
            usedCount: coupon.usedCount + 1
          });
        }
      }

      // 4. Create OrderItems & Update Inventory
      const cart = await tx.orm.public.Cart.where({ userId: session.userId as string }).first();

      for (const item of validatedOrderItems) {
        await tx.orm.public.OrderItem.create({
          orderId: newOrder.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });

        // Find inventory
        const inventory = await tx.orm.public.Inventory.where({ variantId: item.variantId }).first();
        
        if (inventory) {
          // Check if there is an active reservation
          let cartItem = null;
          if (cart) {
            cartItem = await tx.orm.public.CartItem.where({ cartId: cart.id, variantId: item.variantId }).first();
          }

          if (cartItem) {
            // Has reservation, deduct from reservedStock atomically
            const plan = db.raw.sql`
              UPDATE inventory 
              SET "reservedStock" = GREATEST(0, "reservedStock" - ${item.quantity})
              WHERE id = ${inventory.id}
            `.affectedCount().build();
            await tx.execute(plan);
            
            // Remove cart item
            await tx.orm.public.CartItem.where({ id: cartItem.id }).delete();
          } else {
            // No reservation (maybe expired), deduct from stockQuantity if available atomically
            const plan = db.raw.sql`
              UPDATE inventory 
              SET "stockQuantity" = "stockQuantity" - ${item.quantity}
              WHERE id = ${inventory.id} AND "stockQuantity" >= ${item.quantity}
            `.affectedCount().build();
            const { affectedRows } = await tx.execute(plan);
            
            if (affectedRows === 0) {
               throw new Error(`موجودی کالای ${item.variantId} به پایان رسیده است.`);
            }
          }

          // Log transaction
          await tx.orm.public.InventoryTransaction.create({
            inventoryId: inventory.id,
            type: 'SALE',
            quantity: -item.quantity,
            reference: newOrder.id
          });
        }
      }
      
      return { order: newOrder };
    }).catch(e => {
       console.error("Transaction failed:", e);
       return { error: e instanceof Error ? e.message : "خطایی در ثبت سفارش رخ داد." };
    });

    if ('error' in txResult) {
      return { error: txResult.error || "خطایی در پردازش سفارش رخ داد." };
    }
    
    const order = txResult.order;
    
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
    
    // 5. Simulated Payment Success -> Trigger receipt email
    await markOrderAsPaid(order.id);

    // Returning success to trigger client-side clear cart
    return { success: true, orderId: order.id };

  } catch (error) {
    console.error("Checkout error:", error);
    return { error: "خطایی در پردازش سفارش رخ داد. لطفاً دوباره تلاش کنید." };
  }
}
