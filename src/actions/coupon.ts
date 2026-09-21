"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

type DiscountType = "PERCENTAGE" | "FIXED";

export async function getCoupons() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return await db.orm.public.Coupon.orderBy(c => c.createdAt.desc()).all();
}

export async function createCoupon(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز" };
  }

  try {
    const code = (formData.get("code") as string).trim().toUpperCase();
    const type = formData.get("type") as DiscountType;
    const valueStr = formData.get("value") as string;
    const maxDiscountStr = formData.get("maxDiscount") as string;
    const minOrderAmountStr = formData.get("minOrderAmount") as string;
    const usageLimitStr = formData.get("usageLimit") as string;
    const expiresAtStr = formData.get("expiresAt") as string;

    if (!code || !type || !valueStr) {
      return { error: "فیلدهای کد، نوع و مقدار الزامی هستند." };
    }

    const value = parseFloat(valueStr);
    if (isNaN(value)) {
      return { error: "مقدار نامعتبر است." };
    }

    const existing = await db.orm.public.Coupon.where({ code }).first();
    if (existing) {
      return { error: "این کد تخفیف قبلا ثبت شده است." };
    }

    await db.orm.public.Coupon.create({
      code,
      type,
      value,
      maxDiscount: maxDiscountStr ? parseFloat(maxDiscountStr) : null,
      minOrderAmount: minOrderAmountStr ? parseFloat(minOrderAmountStr) : null,
      usageLimit: usageLimitStr ? parseInt(usageLimitStr, 10) : null,
      expiresAt: expiresAtStr ? new Date(expiresAtStr).toISOString() : null,
      isActive: true,
    });

  } catch {
    console.error("Error creating coupon:", error);
    return { error: "خطایی در ساخت کد تخفیف رخ داد." };
  }

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "دسترسی غیرمجاز" };
  }

  try {
    await db.orm.public.Coupon.where({ id }).update({ isActive });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch {
    return { success: false, error: "خطایی رخ داد." };
  }
}

export async function deleteCoupon(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "دسترسی غیرمجاز" };
  }

  try {
    await db.orm.public.Coupon.where({ id }).delete();
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch {
    return { success: false, error: "خطایی رخ داد." };
  }
}

export async function validateCoupon(code: string, cartTotal: number) {
  try {
    code = code.trim().toUpperCase();
    if (!code) {
      return { success: false, error: "کد تخفیف نمی‌تواند خالی باشد." };
    }

    const coupon = await db.orm.public.Coupon.where({ code }).first();

    if (!coupon) {
      return { success: false, error: "کد تخفیف نامعتبر است." };
    }

    if (!coupon.isActive) {
      return { success: false, error: "این کد تخفیف غیرفعال شده است." };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { success: false, error: "تاریخ انقضای این کد تخفیف به پایان رسیده است." };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, error: "ظرفیت استفاده از این کد تخفیف تکمیل شده است." };
    }

    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return { success: false, error: `حداقل مبلغ خرید برای این کد تخفیف ${coupon.minOrderAmount.toLocaleString()} تومان است.` };
    }

    let discountAmount = 0;
    if (coupon.type === "FIXED") {
      discountAmount = coupon.value;
    } else if (coupon.type === "PERCENTAGE") {
      discountAmount = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }

    // Ensure we don't discount more than the cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    return { 
      success: true, 
      discountAmount, 
      couponId: coupon.id,
      code: coupon.code
    };
  } catch {
    console.error("Error validating coupon:", error);
    return { success: false, error: "خطایی در اعتبارسنجی کد تخفیف رخ داد." };
  }
}
