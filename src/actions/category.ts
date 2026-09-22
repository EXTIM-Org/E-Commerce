"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import sharp from "sharp";

/**
 * Check if the user is an admin
 */
async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new Error("Unauthorized");
  }
  
  const user = await db.orm.public.User.first({ id: session.userId as string });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    throw new Error("Forbidden: Requires Admin Role");
  }
}

export async function createCategory(data: { name: string; slug: string; iconName?: string; colorGradient?: string; image?: string }) {
  await requireAdmin();
  
  // Validate unique slug
  const existing = await db.orm.public.Category.where({ slug: data.slug }).first();
  if (existing) {
    return { success: false, error: "این نامک (Slug) قبلاً استفاده شده است." };
  }

  try {
    const category = await db.orm.public.Category.create({
      name: data.name,
      slug: data.slug,
      iconName: data.iconName || null,
      colorGradient: data.colorGradient || null,
      image: data.image || null,
    });
    
    revalidatePath("/categories");
    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { success: false, error: "خطا در ایجاد دسته‌بندی." };
  }
}

export async function updateCategory(id: string, data: { name: string; slug: string; iconName?: string; colorGradient?: string; image?: string }) {
  await requireAdmin();
  
  // Validate unique slug if changed
  const existing = await db.orm.public.Category.where({ slug: data.slug }).first();
  if (existing && existing.id !== id) {
    return { success: false, error: "این نامک (Slug) توسط دسته‌بندی دیگری استفاده شده است." };
  }

  try {
    const oldCategory = await db.orm.public.Category.where({ id }).first();

    const category = await db.orm.public.Category.where({ id }).update({
      name: data.name,
      slug: data.slug,
      iconName: data.iconName || null,
      colorGradient: data.colorGradient || null,
      image: data.image || null,
    });
    
    // Clean up old image if it was changed or removed
    if (oldCategory && oldCategory.image && oldCategory.image !== data.image && oldCategory.image.startsWith("/uploads/categories/")) {
      try {
        const oldFilepath = join(process.cwd(), "public", oldCategory.image);
        if (existsSync(oldFilepath)) {
          await unlink(oldFilepath);
        }
      } catch (e) {
        console.error("Failed to delete old category image:", e);
      }
    }

    revalidatePath("/categories");
    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return { success: false, error: "خطا در ویرایش دسته‌بندی." };
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  
  try {
    // Basic check for attached products before delete
    const hasProducts = await db.orm.public.Product.where({ categoryId: id }).first();
    if (hasProducts) {
       return { success: false, error: "این دسته‌بندی دارای محصول است و قابل حذف نیست. ابتدا محصولات را جابجا کنید." };
    }
    
    const categoryToDelete = await db.orm.public.Category.where({ id }).first();

    await db.orm.public.Category.where({ id }).delete();
    
    // Clean up image file
    if (categoryToDelete && categoryToDelete.image && categoryToDelete.image.startsWith("/uploads/categories/")) {
      try {
        const filepath = join(process.cwd(), "public", categoryToDelete.image);
        if (existsSync(filepath)) {
          await unlink(filepath);
        }
      } catch (e) {
        console.error("Failed to delete category image:", e);
      }
    }

    revalidatePath("/categories");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, error: "خطا در حذف دسته‌بندی." };
  }
}

export async function uploadCategoryImage(formData: FormData) {
  try {
    await requireAdmin();

    const file = formData.get("image") as File;
    if (!file) {
      return { success: false, error: "هیچ فایلی انتخاب نشده است" };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, error: "لطفا یک فایل تصویری معتبر انتخاب کنید" };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "حجم فایل نباید بیشتر از 10 مگابایت باشد" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `cat-${uniqueSuffix}.webp`;
    
    // Process with sharp (resize and convert to WebP)
    const webpBuffer = await sharp(buffer)
      .resize(500, 500, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 90 })
      .toBuffer();

    const uploadDir = join(process.cwd(), "public/uploads/categories");
    // Ensure dir exists
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch {
        // ignore
    }
    
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, webpBuffer);

    const imageUrl = `/uploads/categories/${filename}`;
    
    return { success: true, imageUrl };
  } catch (error) {
    console.error("Error uploading category image:", error);
    return { success: false, error: "خطایی در آپلود عکس رخ داد" };
  }
}
