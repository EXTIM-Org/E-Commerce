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
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");
  
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
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  coverImage: z.string().optional(),
  categoryId: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export async function saveArticle(formData: z.infer<typeof ArticleSchema>) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");
  
  const validated = ArticleSchema.parse(formData);
  
  if (validated.id) {
    await db.orm.public.Article.where({ id: validated.id }).update({
      title: validated.title,
      slug: validated.slug,
      excerpt: validated.excerpt || null,
      content: validated.content,
      coverImage: validated.coverImage || null,
      categoryId: validated.categoryId,
      status: validated.status,
      // Simplistic, won't overwrite publish date if already published
    });
  } else {
    await db.orm.public.Article.create({
      title: validated.title,
      slug: validated.slug,
      excerpt: validated.excerpt || null,
      content: validated.content,
      coverImage: validated.coverImage || null,
      categoryId: validated.categoryId,
      status: validated.status,
      authorId: session.userId as string,
      publishedAt: validated.status === "PUBLISHED" ? new Date().toISOString() : null,
    });
  }
  
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function deleteArticle(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");
  
  await db.orm.public.Article.where({ id }).delete();
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
