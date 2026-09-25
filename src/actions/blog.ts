"use server";

import { db } from "@/prisma/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

// --- Categories ---

export async function getArticleCategories() {
  return await db.orm.public.ArticleCategory.orderBy((c) => c.createdAt.desc()).all();
}

export async function createArticleCategory(data: { name: string; slug: string }) {
  const session = await getSession();
  if (!session || !canManageBlog(session.role as string)) throw new Error("Unauthorized");
  
  await db.orm.public.ArticleCategory.create({
    name: data.name,
    slug: data.slug,
  });
  
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

// --- Articles ---

export async function getArticles(options?: { publishedOnly?: boolean }) {
  let query = db.orm.public.Article.include("category").include("author", (u) => u.select("name"));
  
  if (options?.publishedOnly) {
    query = query.where((a) => a.status.eq("PUBLISHED"));
  }
  
  return await query.orderBy((a) => a.createdAt.desc()).all();
}

export async function getArticleBySlug(slug: string) {
  return await db.orm.public.Article
    .where({ slug })
    .include("category")
    .include("author", (u) => u.select("name", "image"))
    .first();
}

export async function incrementArticleView(id: string) {
  const article = await db.orm.public.Article.where({ id }).first();
  if (article) {
    await db.orm.public.Article.where({ id }).update({ viewCount: article.viewCount + 1 });
  }
}

const ArticleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "عنوان مقاله باید حداقل ۳ کاراکتر باشد"),
  slug: z.string().min(3, "نامک باید حداقل ۳ کاراکتر باشد"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "محتوای مقاله باید حداقل ۱۰ کاراکتر باشد"),
  coverImage: z.string().optional(),
  categoryId: z.string().min(1, "انتخاب دسته‌بندی الزامی است"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import sharp from "sharp";

async function saveCoverImage(file: File): Promise<string | null> {
  if (!file || file.size === 0 || !file.type.startsWith("image/")) return null;
  if (file.size > 5 * 1024 * 1024) throw new Error("حجم تصویر کاور نباید بیشتر از ۵ مگابایت باشد.");
  
  const uploadDir = join(process.cwd(), "public/uploads/blog");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const filename = `cover-${uniqueSuffix}.webp`;
  const filepath = join(uploadDir, filename);
  
  const webpBuffer = await sharp(buffer)
    .resize(1200, 800, { fit: "cover", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  await writeFile(filepath, webpBuffer);
  return `/uploads/blog/${filename}`;
}

export async function saveArticle(formData: FormData) {
  const session = await getSession();
  if (!session || !canManageBlog(session.role as string)) return { error: "عدم دسترسی کافی" };
  
  // Parse standard fields
  const id = formData.get("id") as string;
  const rawData = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    categoryId: formData.get("categoryId") as string,
    status: formData.get("status") as string,
    coverImage: formData.get("coverImage") as string, // existing link or previous image
  };

  const result = ArticleSchema.safeParse(rawData);
  if (!result.success) {
    const zodError = result.error as any;
    const firstIssue = zodError?.errors?.[0] || zodError?.issues?.[0];
    return { error: firstIssue?.message || "مقادیر وارد شده نامعتبر است." };
  }
  const validated = result.data;

  // Handle cover image upload
  let finalCoverImage = validated.coverImage || null;
  const coverImageFile = formData.get("coverImageFile") as File;
  if (coverImageFile && coverImageFile.size > 0) {
    try {
      const uploadedUrl = await saveCoverImage(coverImageFile);
      if (uploadedUrl) finalCoverImage = uploadedUrl;
    } catch (e: any) {
      return { error: e.message || "خطایی در آپلود تصویر رخ داد." };
    }
  }
  
  if (id) {
    const existing = await db.orm.public.Article.where({ id }).first();
    const shouldSetPublishedAt = validated.status === "PUBLISHED" && (!existing || !existing.publishedAt);

    await db.orm.public.Article.where({ id }).update({
      title: validated.title,
      slug: validated.slug,
      excerpt: validated.excerpt || null,
      content: validated.content,
      coverImage: finalCoverImage,
      categoryId: validated.categoryId,
      status: validated.status as "DRAFT" | "PUBLISHED",
      ...(shouldSetPublishedAt ? { publishedAt: new Date().toISOString() } : {})
    });
    
    // If the image changed (either deleted or replaced by a new one), delete the old physical file
    if (existing && existing.coverImage && existing.coverImage !== finalCoverImage) {
      await deletePhysicalImage(existing.coverImage);
    }
  } else {
    await db.orm.public.Article.create({
      title: validated.title,
      slug: validated.slug,
      excerpt: validated.excerpt || null,
      content: validated.content,
      coverImage: finalCoverImage,
      categoryId: validated.categoryId,
      status: validated.status as "DRAFT" | "PUBLISHED",
      authorId: session.userId as string,
      publishedAt: validated.status === "PUBLISHED" ? new Date().toISOString() : null,
    });
  }
  
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

import { unlink } from "fs/promises";

async function deletePhysicalImage(url: string | null) {
  if (!url || !url.startsWith("/uploads/blog/")) return;
  try {
    const filepath = join(process.cwd(), "public", url);
    if (existsSync(filepath)) {
      await unlink(filepath);
    }
  } catch (e) {
    console.error("Failed to delete physical image", e);
  }
}

import { canManageBlog } from "@/lib/permissions";

export async function deleteArticle(id: string) {
  const session = await getSession();
  if (!session || !canManageBlog(session.role as string)) throw new Error("Unauthorized");
  
  const oldArticle = await db.orm.public.Article.where({ id }).first();
  await db.orm.public.Article.where({ id }).delete();
  
  if (oldArticle && oldArticle.coverImage) {
    await deletePhysicalImage(oldArticle.coverImage);
  }
  
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
