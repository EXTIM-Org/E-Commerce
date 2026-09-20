"use server";

import { writeFile } from "fs/promises";
import { join } from "path";
import { getSession, updateSession } from "@/lib/session";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export async function uploadProfileImage(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "ابتدا وارد حساب کاربری شوید" };
    }

    const file = formData.get("image") as File;
    if (!file) {
      return { success: false, error: "هیچ فایلی انتخاب نشده است" };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "لطفا یک فایل تصویری معتبر انتخاب کنید" };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.name.split(".").pop();
    const filename = `avatar-${session.userId}-${uniqueSuffix}.${extension}`;
    
    // Save to public/uploads/avatars
    const filepath = join(process.cwd(), "public/uploads/avatars", filename);
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/avatars/${filename}`;

    // Update user in DB
    await db.orm.public.User.where({ id: session.userId }).update({ image: imageUrl });

    // Update session
    await updateSession({ ...session, image: imageUrl });

    // Revalidate paths
    revalidatePath("/profile", "layout");
    
    return { success: true, imageUrl };
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return { success: false, error: "خطایی در آپلود عکس رخ داد" };
  }
}
