"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { getEffectivePrice } from "@/lib/price";

const RESERVATION_MINUTES = 15;

/**
 * Lazy cleanup of expired reservations across the entire system.
 * This runs before any cart mutation to ensure max availability.
 */
export async function lazyReleaseReservations() {
  try {
    const expiryTime = new Date(Date.now() - RESERVATION_MINUTES * 60 * 1000).toISOString();

    // Find all expired cart items that have a reservation
    const expiredItems = await db.orm.public.CartItem
      .where((item) => item.reservedAt.lte(expiryTime))
      .all();

    if (expiredItems.length === 0) return;

    // Release each item
    for (const item of expiredItems) {
      const inventory = await db.orm.public.Inventory.where({ variantId: item.variantId }).first();
      
      if (inventory) {
        // Return stock from reserved to available
        const plan = db.raw.sql`
          UPDATE inventory 
          SET "stockQuantity" = "stockQuantity" + ${item.quantity}, 
              "reservedStock" = GREATEST(0, "reservedStock" - ${item.quantity})
          WHERE id = ${inventory.id}
        `.affectedCount().build();
        await db.runtime().execute(plan);
      }
      
      // Delete the expired cart item
      await db.orm.public.CartItem.where({ id: item.id }).delete();
    }
  } catch (error) {
    console.error("Error in lazyReleaseReservations:", error);
  }
}

/**
 * Fetch the user's cart from the server.
 */
export async function fetchUserCart() {
  await lazyReleaseReservations();
  
  const session = await getSession();
  if (!session || !session.userId) return { success: false, guest: true, items: [] };
  
  const userId = session.userId as string;
  
  const cart = await db.orm.public.Cart
    .where({ userId })
    .include("items", (i) => i.include("variant", (v) => v.include("product", (p) => p.include("flashSale"))))
    .first();
    
  if (!cart) return { success: true, items: [] };
  
  const mappedItems = cart.items.map(item => ({
    id: item.variantId,
    productId: item.variant?.productId || "",
    variantId: item.variantId,
    name: item.variant?.product?.name || "محصول نامشخص",
    variantName: item.variant?.name || null,
    price: getEffectivePrice(item.variant?.price ?? item.variant?.product?.basePrice ?? 0, item.variant?.product?.flashSale).finalPrice,
    quantity: item.quantity,
    image: item.variant?.product?.images[0] || "",
    reservedAt: item.reservedAt,
  }));
  
  return { success: true, items: mappedItems };
}

/**
 * Sync guest cart to server cart upon login.
 */
export async function syncCartServer(localItems: { variantId: string; quantity: number }[]) {
  const session = await getSession();
  if (!session || !session.userId) return { success: false, error: "Unauthorized" };
  
  for (const item of localItems) {
    await addToCartServer(item.variantId, item.quantity);
  }
  
  return await fetchUserCart();
}

/**
 * Add an item to the cart and reserve inventory.
 */
export async function addToCartServer(variantId: string, quantity: number) {
  if (quantity <= 0) return { success: false, error: "تعداد نامعتبر است." };
  
  await lazyReleaseReservations();
  
  const session = await getSession();
  if (!session || !session.userId) return { guest: true };
  
  const userId = session.userId as string;

  try {
    const inventory = await db.orm.public.Inventory.where({ variantId }).first();
    
    if (!inventory) {
      return { success: false, error: "موجودی این کالا یافت نشد." };
    }
    
    // Atomic Inventory Reservation
    const plan = db.raw.sql`
      UPDATE inventory 
      SET "stockQuantity" = "stockQuantity" - ${quantity}, 
          "reservedStock" = "reservedStock" + ${quantity}
      WHERE id = ${inventory.id} AND "stockQuantity" >= ${quantity}
    `.affectedCount().build();

    const { affectedRows } = await db.runtime().execute(plan);

    if (affectedRows === 0) {
      return { success: false, error: "موجودی کافی برای این تعداد وجود ندارد." };
    }
    
    // Ensure Cart exists
    let cart = await db.orm.public.Cart.where({ userId }).first();
    if (!cart) {
      cart = await db.orm.public.Cart.create({ userId });
    }
    
    // Check if item already in cart
    const existingItem = await db.orm.public.CartItem
      .where({ cartId: cart.id, variantId })
      .first();
      
    const reservedAt = new Date().toISOString();
    
    if (existingItem) {
      // Update existing item
      await db.orm.public.CartItem.where({ id: existingItem.id }).update({
        quantity: existingItem.quantity + quantity,
        reservedAt
      });
    } else {
      // Create new item
      await db.orm.public.CartItem.create({
        cartId: cart.id,
        variantId,
        quantity,
        reservedAt
      });
    }
    
    return { success: true, reservedAt };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: "خطایی رخ داد." };
  }
}

/**
 * Update the quantity of a cart item and adjust reservation.
 */
export async function updateQuantityServer(variantId: string, quantity: number) {
  if (quantity <= 0) return { success: false, error: "تعداد نامعتبر است." };
  
  await lazyReleaseReservations();
  
  const session = await getSession();
  if (!session || !session.userId) return { guest: true };
  
  const userId = session.userId as string;
  
  try {
    const cart = await db.orm.public.Cart.where({ userId }).first();
    if (!cart) return { success: false, error: "سبد خرید یافت نشد." };
    
    const cartItem = await db.orm.public.CartItem.where({ cartId: cart.id, variantId }).first();
    if (!cartItem) return { success: false, error: "آیتم در سبد خرید یافت نشد." };
    
    const inventory = await db.orm.public.Inventory.where({ variantId }).first();
    if (!inventory) return { success: false, error: "موجودی یافت نشد." };
    
    const diff = quantity - cartItem.quantity;
    
    if (diff > 0) {
      // Increasing quantity - atomic update
      const plan = db.raw.sql`
        UPDATE inventory 
        SET "stockQuantity" = "stockQuantity" - ${diff}, 
            "reservedStock" = "reservedStock" + ${diff}
        WHERE id = ${inventory.id} AND "stockQuantity" >= ${diff}
      `.affectedCount().build();
      
      const { affectedRows } = await db.runtime().execute(plan);
      if (affectedRows === 0) {
        return { success: false, error: "موجودی کافی نیست." };
      }
    } else if (diff < 0) {
      const absDiff = Math.abs(diff);
      // Decreasing quantity - atomic update
      const plan = db.raw.sql`
        UPDATE inventory 
        SET "stockQuantity" = "stockQuantity" + ${absDiff},
            "reservedStock" = GREATEST(0, "reservedStock" - ${absDiff})
        WHERE id = ${inventory.id}
      `.affectedCount().build();
      await db.runtime().execute(plan);
    }
    
    const reservedAt = new Date().toISOString();
    await db.orm.public.CartItem.where({ id: cartItem.id }).update({
      quantity,
      reservedAt
    });
    
    return { success: true, reservedAt };
  } catch (error) {
    console.error("Error updating quantity:", error);
    return { success: false, error: "خطایی رخ داد." };
  }
}

/**
 * Remove an item from the cart and release its reservation.
 */
export async function removeFromCartServer(variantId: string) {
  const session = await getSession();
  if (!session || !session.userId) return { guest: true };
  
  const userId = session.userId as string;
  
  try {
    const cart = await db.orm.public.Cart.where({ userId }).first();
    if (!cart) return { success: false };
    
    const cartItem = await db.orm.public.CartItem.where({ cartId: cart.id, variantId }).first();
    if (!cartItem) return { success: false };
    
    const item = cartItem;
    
    // Release inventory atomically
    const inventory = await db.orm.public.Inventory.where({ variantId }).first();
      if (inventory) {
        // Return stock from reserved to available
        const plan = db.raw.sql`
          UPDATE inventory 
          SET "stockQuantity" = "stockQuantity" + ${item.quantity}, 
              "reservedStock" = GREATEST(0, "reservedStock" - ${item.quantity})
          WHERE id = ${inventory.id}
        `.affectedCount().build();
        await db.runtime().execute(plan);
      }
    
    await db.orm.public.CartItem.where({ id: cartItem.id }).delete();
    
    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, error: "خطایی رخ داد." };
  }
}
