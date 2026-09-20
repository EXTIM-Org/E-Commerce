"use server";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Helper to ensure category exists (for the "default" category if none exists)
export async function getOrCreateDefaultCategory() {
  const existing = await db.orm.public.Category.first();
  if (existing) return existing;

  // Create a default one
  return await db.orm.public.Category.create({
    name: "عمومی",
    slug: "general",
  });
}

// Helper to get all categories
export async function getCategories() {
  return await db.orm.public.Category.orderBy((c) => c.createdAt.desc()).all();
}

async function saveImages(formData: FormData): Promise<string[]> {
  const imageFiles = formData.getAll("images") as File[];
  console.log("saveImages received files:", imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
  const imageUrls: string[] = [];

  const uploadDir = join(process.cwd(), "public/uploads/products");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  for (const file of imageFiles) {
    if (file && file.size > 0 && file.type.startsWith("image/")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = file.name.split(".").pop();
      const filename = `product-${uniqueSuffix}.${extension}`;
      const filepath = join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      imageUrls.push(`/uploads/products/${filename}`);
    }
  }

  return imageUrls;
}

export async function createProduct(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز" };
  }

  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const basePriceStr = formData.get("basePrice") as string;
    const discountStr = formData.get("discount") as string;
    const categoryId = formData.get("categoryId") as string;

    if (!name || !basePriceStr || !categoryId) {
      return { error: "فیلدهای نام، قیمت پایه و دسته‌بندی الزامی هستند." };
    }

    const basePrice = parseFloat(basePriceStr);
    const discount = parseFloat(discountStr || "0");
    
    // Generate slug from name (simple slugification)
    let slug = name.toLowerCase().trim().replace(/[\s\W-]+/g, "-");
    // Ensure slug is unique
    const existingProduct = await db.orm.public.Product.where({ slug }).first();
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    // Handle image uploads
    const newImageUrls = await saveImages(formData);
    const finalOrderStr = formData.get("finalOrder") as string;
    let finalImages: string[] = [];
    
    if (finalOrderStr) {
      try {
        const order = JSON.parse(finalOrderStr);
        let fileIdx = 0;
        for (const item of order) {
          if (item === "__NEW_FILE__") {
            if (newImageUrls[fileIdx]) {
              finalImages.push(newImageUrls[fileIdx]);
              fileIdx++;
            }
          } else {
            finalImages.push(item);
          }
        }
      } catch(e) {
        finalImages = newImageUrls;
      }
    } else {
      finalImages = newImageUrls;
    }

    await db.orm.public.Product.create({
      name,
      slug,
      description,
      basePrice,
      discount,
      categoryId,
      images: finalImages,
    });

  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "خطایی در ثبت محصول رخ داد." };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز" };
  }

  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const basePriceStr = formData.get("basePrice") as string;
    const discountStr = formData.get("discount") as string;
    const categoryId = formData.get("categoryId") as string;
    const existingImagesStr = formData.get("existingImages") as string; // JSON string of old images kept

    if (!name || !basePriceStr || !categoryId) {
      return { error: "فیلدهای نام، قیمت پایه و دسته‌بندی الزامی هستند." };
    }

    const basePrice = parseFloat(basePriceStr);
    const discount = parseFloat(discountStr || "0");
    
    // Parse existing images that weren't deleted by user
    let existingImages: string[] = [];
    if (existingImagesStr) {
      try {
        existingImages = JSON.parse(existingImagesStr);
      } catch (e) {
        existingImages = [];
      }
    }

    const finalOrderStr = formData.get("finalOrder") as string;
    
    const newImageUrls = await saveImages(formData);
    let finalImages: string[] = [];

    if (finalOrderStr) {
      try {
        const order = JSON.parse(finalOrderStr);
        let fileIdx = 0;
        for (const item of order) {
          if (item === "__NEW_FILE__") {
            if (newImageUrls[fileIdx]) {
              finalImages.push(newImageUrls[fileIdx]);
              fileIdx++;
            }
          } else {
            finalImages.push(item);
          }
        }
      } catch (e) {
        finalImages = [...existingImages, ...newImageUrls];
      }
    } else {
      finalImages = [...existingImages, ...newImageUrls];
    }

    await db.orm.public.Product.where({ id }).update({
      name,
      description,
      basePrice,
      discount,
      categoryId,
      images: finalImages,
    });

  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "خطایی در ویرایش محصول رخ داد." };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "دسترسی غیرمجاز" };
  }

  try {
    await db.orm.public.Product.where({ id }).delete();
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "خطایی در حذف محصول رخ داد." };
  }
}
