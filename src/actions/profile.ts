"use server";

import { db } from "@/prisma/db";
import { getSession, updateSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateProfile(prevState: any, formData: FormData) {
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
