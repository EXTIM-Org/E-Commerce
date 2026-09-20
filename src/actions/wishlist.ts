"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { error: "برای افزودن به علاقه‌مندی‌ها باید وارد حساب کاربری شوید." };
    }

    const userId = session.userId as string;

    // Ensure the user has a wishlist
    let wishlist = await db.orm.public.Wishlist.where(
      { userId }
    ).all().first();

    if (!wishlist) {
      wishlist = await db.orm.public.Wishlist.create({
        userId,
      });
    }

    // Check if item already exists
    const existingItem = await db.orm.public.WishlistItem.where(
      { wishlistId: wishlist!.id, productId }
    ).all().first();

    if (existingItem) {
      // Remove it
      await db.orm.public.WishlistItem.where({
        id: existingItem.id
      }).delete();
      revalidatePath("/profile/wishlist");
      return { success: true, isLiked: false, message: "از علاقه‌مندی‌ها حذف شد." };
    } else {
      // Add it
      await db.orm.public.WishlistItem.create({
        wishlistId: wishlist.id,
        productId,
      });
      revalidatePath("/profile/wishlist");
      return { success: true, isLiked: true, message: "به علاقه‌مندی‌ها اضافه شد." };
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return { error: "خطایی رخ داده است." };
  }
}
