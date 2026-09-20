"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addressSchema = z.object({
  title: z.string().optional(),
  fullAddress: z.string().min(10, "آدرس دقیق باید حداقل ۱۰ کاراکتر باشد."),
  postalCode: z.string().regex(/^\d{10}$/, "کد پستی باید دقیقاً ۱۰ رقم باشد.").optional().or(z.literal("")),
});

export async function addAddress(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { error: "باید وارد حساب کاربری شوید." };
    }

    const title = formData.get("title") as string;
    const fullAddress = formData.get("fullAddress") as string;
    const postalCode = formData.get("postalCode") as string;

    const validation = addressSchema.safeParse({
      title,
      fullAddress,
      postalCode,
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    await db.orm.public.Address.create({
      userId: session.userId as string,
      title: title || "آدرس",
      fullAddress,
      postalCode: postalCode || null,
    });

    revalidatePath("/profile/addresses");
    return { success: true };
  } catch (error) {
    console.error("Add address error:", error);
    return { error: "خطا در ثبت آدرس. لطفا دوباره تلاش کنید." };
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { error: "Unauthorized" };

    // Ensure the address belongs to the user
    const address = await db.orm.public.Address.where({ id: addressId, userId: session.userId as string }).first();
    
    if (address) {
      await db.orm.public.Address.where({ id: addressId }).delete();
      revalidatePath("/profile/addresses");
      return { success: true };
    }
    
    return { error: "آدرس یافت نشد." };
  } catch (error) {
    console.error("Delete address error:", error);
    return { error: "خطا در حذف آدرس." };
  }
}
