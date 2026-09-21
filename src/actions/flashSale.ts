"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createFlashSale(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }

  const productId = formData.get("productId") as string;
  const discountPercent = parseInt(formData.get("discountPercent") as string, 10);
  const startTimeStr = formData.get("startTime") as string;
  const endTimeStr = formData.get("endTime") as string;

  if (!productId || !discountPercent || !startTimeStr || !endTimeStr) {
    throw new Error("لطفاً تمام فیلدها را پر کنید.");
  }

  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  if (startTime >= endTime) {
    throw new Error("زمان پایان باید بعد از زمان شروع باشد.");
  }

  try {
    // Upsert FlashSale (since it's 1-to-1)
    const existing = await db.orm.public.FlashSale.where({ productId }).first();
    
    if (existing) {
      await db.orm.public.FlashSale.where({ id: existing.id }).update({
        discountPercent,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isActive: true,
      });
    } else {
      await db.orm.public.FlashSale.create({
        productId,
        discountPercent,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isActive: true,
      });
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/flash-sales");
  } catch {
    console.error("Error creating flash sale:", error);
    throw new Error("خطایی در ثبت فروش ویژه رخ داد.");
  }
  
  redirect("/admin/flash-sales");
}

export async function toggleFlashSale(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز" };
  }

  try {
    await db.orm.public.FlashSale.where({ id }).update({ isActive });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/flash-sales");
    return { success: true };
  } catch {
    return { error: "خطا در تغییر وضعیت" };
  }
}

export async function deleteFlashSale(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز" };
  }

  try {
    await db.orm.public.FlashSale.where({ id }).delete();
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/flash-sales");
    return { success: true };
  } catch {
    return { error: "خطا در حذف" };
  }
}
