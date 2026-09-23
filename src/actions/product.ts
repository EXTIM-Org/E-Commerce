"use server";
import { canManageStore } from "@/lib/permissions";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { invalidateCachePattern } from "@/lib/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import sharp from "sharp";

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

async function deletePhysicalImages(urls: readonly string[] | string[]) {
  if (!urls || urls.length === 0) return;
  for (const url of urls) {
    if (!url.startsWith("/uploads/products/")) continue;
    try {
      // url is like "/uploads/products/filename.webp"
      const filepath = join(process.cwd(), "public", url);
      if (existsSync(filepath)) {
        await unlink(filepath);
        console.log(`Deleted physical file: ${filepath}`);
      }
    } catch (e) {
      console.error(`Failed to delete physical file for URL ${url}:`, e);
    }
  }
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
      // 1. Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`حجم فایل ${file.name} نباید بیشتر از ۱۰ مگابایت باشد.`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = `product-${uniqueSuffix}.webp`;
      const filepath = join(uploadDir, filename);
      
      // 2. Compress and convert to WebP using sharp
      const webpBuffer = await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      await writeFile(filepath, webpBuffer);
      imageUrls.push(`/uploads/products/${filename}`);
    }
  }

  return imageUrls;
}

export async function createProduct(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || !canManageStore(session.role as string)) {
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
    let newImageUrls: string[] = [];
    try {
      newImageUrls = await saveImages(formData);
    } catch (e: any) {
      return { error: e.message || "خطایی در آپلود تصاویر رخ داد." };
    }
    
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
      } catch {
        finalImages = newImageUrls;
      }
    } else {
      finalImages = newImageUrls;
    }

    // Limit to max 5 images
    finalImages = finalImages.slice(0, 5);

    const product = await db.orm.public.Product.create({
      name,
      slug,
      description,
      basePrice,
      discount,
      categoryId,
      images: finalImages,
    });

    // Handle variants
    const variantsJsonStr = formData.get("variantsJson") as string;
    if (variantsJsonStr) {
      try {
        const variants = JSON.parse(variantsJsonStr);
        for (const variant of variants) {
          const createdVariant = await db.orm.public.ProductVariant.create({
            productId: product.id,
            name: variant.name || "پیش‌فرض",
            sku: variant.sku,
            price: variant.price !== "" ? parseFloat(variant.price) : null,
          });
          
          await db.orm.public.Inventory.create({
            variantId: createdVariant.id,
            stockQuantity: variant.stockQuantity || 0,
            reservedStock: 0,
          });
        }
      } catch (e) {
        console.error("Error parsing variants:", e);
      }
    }

    // Handle specifications
    const specsJsonStr = formData.get("specificationsJson") as string;
    if (specsJsonStr) {
      try {
        const specs = JSON.parse(specsJsonStr);
        for (const spec of specs) {
          if (spec.name && spec.value) {
            await db.orm.public.ProductSpecification.create({
              productId: product.id,
              name: spec.name.trim(),
              value: spec.value.trim(),
            });
          }
        }
      } catch (e) {
        console.error("Error parsing specs:", e);
      }
    }

  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "خطایی در ثبت محصول رخ داد." };
  }

  await invalidateCachePattern("cache:products:*");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || !canManageStore(session.role as string)) {
    return { error: "دسترسی غیرمجاز" };
  }

  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const basePriceStr = formData.get("basePrice") as string;
    const discountStr = formData.get("discount") as string;
    const categoryId = formData.get("categoryId") as string;
    const existingImagesStr = formData.get("existingImages") as string; // JSON string of old images kept

    const oldProduct = await db.orm.public.Product.where({ id }).first();
    if (!oldProduct) {
      return { error: "محصول یافت نشد." };
    }

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
      } catch {
        existingImages = [];
      }
    }

    const finalOrderStr = formData.get("finalOrder") as string;
    
    let newImageUrls: string[] = [];
    try {
      newImageUrls = await saveImages(formData);
    } catch (e: any) {
      return { error: e.message || "خطایی در آپلود تصاویر رخ داد." };
    }
    
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
      } catch {
        finalImages = [...existingImages, ...newImageUrls];
      }
    } else {
      finalImages = [...existingImages, ...newImageUrls];
    }

    // Limit to max 5 images
    finalImages = finalImages.slice(0, 5);

    // Calculate orphaned images to delete physically
    const orphanedImages = oldProduct.images.filter(img => !finalImages.includes(img));
    if (orphanedImages.length > 0) {
      await deletePhysicalImages(orphanedImages);
    }

    await db.orm.public.Product.where({ id }).update({
      name,
      description,
      basePrice,
      discount,
      categoryId,
      images: finalImages,
    });

    // Handle variants
    const variantsJsonStr = formData.get("variantsJson") as string;
    if (variantsJsonStr) {
      try {
        const variants = JSON.parse(variantsJsonStr);
        const incomingIds = variants.map((v: any) => v.id);
        
        // Find existing variants
        const existingVariants = await db.orm.public.ProductVariant.where({ productId: id }).all();
        
        // Delete missing variants
        for (const ev of existingVariants) {
          if (!incomingIds.includes(ev.id)) {
            await db.orm.public.ProductVariant.where({ id: ev.id }).delete();
          }
        }
        
        // Create or update incoming variants
        for (const variant of variants) {
          if (variant.isNew) {
            const createdVariant = await db.orm.public.ProductVariant.create({
              productId: id,
              name: variant.name || "پیش‌فرض",
              sku: variant.sku,
              price: variant.price !== "" ? parseFloat(variant.price) : null,
            });
            await db.orm.public.Inventory.create({
              variantId: createdVariant.id,
              stockQuantity: variant.stockQuantity || 0,
              reservedStock: 0,
            });
          } else {
            await db.orm.public.ProductVariant.where({ id: variant.id }).update({
              name: variant.name || "پیش‌فرض",
              sku: variant.sku,
              price: variant.price !== "" ? parseFloat(variant.price) : null,
            });
            await db.orm.public.Inventory.where({ variantId: variant.id }).update({
              stockQuantity: variant.stockQuantity || 0,
            });
          }
        }
      } catch (e) {
        console.error("Error parsing/syncing variants:", e);
      }
    }

    // Handle specifications
    const specsJsonStr = formData.get("specificationsJson") as string;
    if (specsJsonStr) {
      try {
        const specs = JSON.parse(specsJsonStr);
        
        // Delete existing ones and recreate
        await db.orm.public.ProductSpecification.where({ productId: id }).delete();
        
        for (const spec of specs) {
          if (spec.name && spec.value) {
            await db.orm.public.ProductSpecification.create({
              productId: id,
              name: spec.name.trim(),
              value: spec.value.trim(),
            });
          }
        }
      } catch (e) {
        console.error("Error parsing/syncing specs:", e);
      }
    }

  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "خطایی در ویرایش محصول رخ داد." };
  }

  await invalidateCachePattern("cache:products:*");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "دسترسی غیرمجاز" };
  }

  try {
    const oldProduct = await db.orm.public.Product.where({ id }).first();
    
    await db.orm.public.Product.where({ id }).delete();
    
    if (oldProduct && oldProduct.images && oldProduct.images.length > 0) {
      await deletePhysicalImages(oldProduct.images);
    }
    
    await invalidateCachePattern("cache:products:*");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "خطایی در حذف محصول رخ داد." };
  }
}
