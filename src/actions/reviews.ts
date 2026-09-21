"use server";
import { canManageStore } from "@/lib/permissions";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function submitReview(productId: string, rating: number, comment: string) {
  try {
    const session = await getSession();
    
    if (!session || !session.userId) {
      return { success: false, error: "برای ثبت نظر باید وارد حساب کاربری خود شوید." };
    }

    if (rating < 1 || rating > 5) {
      return { success: false, error: "امتیاز باید بین ۱ تا ۵ باشد." };
    }

    // Check if user already reviewed this product
    const existingReview = await db.orm.public.Review.where({ 
      productId, 
      userId: session.userId as string 
    }).first();

    if (existingReview) {
      return { success: false, error: "شما قبلاً برای این محصول نظر ثبت کرده‌اید." };
    }

    // Check if user bought this product
    let isVerifiedBuyer = false;
    let purchasedVariantName: string | null = null;

    const userOrders = await db.orm.public.Order.where({ userId: session.userId as string })
      .include('items', (i) => i.include('variant'))
      .all();

    for (const order of userOrders) {
      if (order.status === 'DELIVERED' || order.status === 'SHIPPED' || order.status === 'PAID') {
        const boughtItem = order.items?.find((item) => item.variant?.productId === productId);
        if (boughtItem) {
          isVerifiedBuyer = true;
          purchasedVariantName = boughtItem.variant?.name || "بدون سایز/رنگ";
          break;
        }
      }
    }

    await db.orm.public.Review.create({
      productId,
      userId: session.userId as string,
      rating,
      comment: comment.trim() || null,
      isVerifiedBuyer,
      purchasedVariantName,
    });

    revalidatePath(`/products/${productId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, error: "خطایی در ثبت نظر رخ داد. لطفاً دوباره تلاش کنید." };
  }
}

export async function adminReplyToReview(reviewId: string, reply: string) {
  try {
    const session = await getSession();
    
    if (!session || !canManageStore(session.role as string)) {
      return { success: false, error: "شما مجوز این کار را ندارید." };
    }

    const review = await db.orm.public.Review.where({ id: reviewId }).first();
    if (!review) {
      return { success: false, error: "نظر مورد نظر یافت نشد." };
    }

    await db.orm.public.Review.where({ id: reviewId }).update({
      adminReply: reply.trim() || null,
      adminReplyAt: reply.trim() ? new Date().toISOString() : null
    });

    revalidatePath(`/products/${review.productId}`);
    revalidatePath('/admin/reviews');
    
    return { success: true };
  } catch (error) {
    console.error("Failed to reply to review:", error);
    return { success: false, error: "خطایی رخ داد. لطفاً دوباره تلاش کنید." };
  }
}

export async function toggleReviewLike(reviewId: string, isLike: boolean) {
  try {
    const session = await getSession();
    
    if (!session || !session.userId) {
      return { success: false, error: "برای ثبت بازخورد باید وارد حساب کاربری خود شوید." };
    }

    const review = await db.orm.public.Review.where({ id: reviewId }).first();
    if (!review) {
      return { success: false, error: "نظر مورد نظر یافت نشد." };
    }

    const existingVote = await db.orm.public.ReviewVote.where({
      reviewId,
      userId: session.userId as string
    }).first();

    if (existingVote) {
      if (existingVote.isLike === isLike) {
        // Toggle off
        await db.orm.public.ReviewVote.where({ id: existingVote.id }).delete();
      } else {
        // Switch vote
        await db.orm.public.ReviewVote.where({ id: existingVote.id }).update({ isLike });
      }
    } else {
      // Create new vote
      await db.orm.public.ReviewVote.create({
        reviewId,
        userId: session.userId as string,
        isLike
      });
    }

    revalidatePath(`/products/${review.productId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle review like:", error);
    return { success: false, error: "خطایی رخ داد. لطفاً دوباره تلاش کنید." };
  }
}
