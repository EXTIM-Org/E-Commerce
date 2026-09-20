"use server";

import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { getSession, updateSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateProfile(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "باید وارد سیستم شده باشید" };
  }

  const name = formData.get("name") as string;
  if (!name || name.trim().length < 2) {
    return { error: "نام باید حداقل ۲ کاراکتر باشد" };
  }

  try {
    const newName = name.trim();
    
    await db.orm.public.User.where({ id: session.userId as string }).update({
      name: newName,
    });

    // Update the session cookie with the new name
    await updateSession({
      ...session,
      name: newName,
    });

    // Revalidate the entire layout to ensure header updates
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "خطا در ذخیره اطلاعات" };
  }
}

export async function changePassword(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "باید وارد سیستم شده باشید" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "تمام فیلدها الزامی هستند" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "رمز عبور جدید و تکرار آن با هم مطابقت ندارند" };
  }

  if (newPassword.length < 6) {
    return { error: "رمز عبور جدید باید حداقل ۶ کاراکتر باشد" };
  }

  try {
    const user = await db.orm.public.User.where({ id: session.userId as string }).first();
    if (!user) {
      return { error: "کاربر یافت نشد" };
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return { error: "رمز عبور فعلی اشتباه است" };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await db.orm.public.User.where({ id: session.userId as string }).update({
      passwordHash: newPasswordHash,
    });

    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    return { error: "خطا در بروزرسانی رمز عبور" };
  }
}
