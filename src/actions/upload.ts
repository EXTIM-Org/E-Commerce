"use server";

import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { getSession, updateSession } from "@/lib/session";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

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

    // Check file size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "حجم فایل نباید بیشتر از 10 مگابایت باشد" };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `avatar-${session.userId}-${uniqueSuffix}.webp`;
    
    // Process with sharp (resize and convert to WebP)
    const webpBuffer = await sharp(buffer)
      .resize(500, 500, { fit: "cover", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Save to public/uploads/avatars
    const filepath = join(process.cwd(), "public/uploads/avatars", filename);
    await writeFile(filepath, webpBuffer);

    const imageUrl = `/uploads/avatars/${filename}`;

    // Get old user image to clean it up later
    const user = await db.orm.public.User.where({ id: session.userId as string }).first();

    // Update user in DB
    await db.orm.public.User.where({ id: session.userId as string }).update({ image: imageUrl });

    // Clean up old avatar file
    if (user?.image && user.image.startsWith("/uploads/avatars/")) {
      try {
        const oldFilepath = join(process.cwd(), "public", user.image);
        if (existsSync(oldFilepath)) {
          await unlink(oldFilepath);
          console.log(`Deleted old avatar: ${oldFilepath}`);
        }
      } catch (e) {
        console.error("Failed to delete old avatar:", e);
      }
    }

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
