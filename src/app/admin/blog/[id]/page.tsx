import { ArticleForm } from "@/components/admin/ArticleForm";
import { getArticleCategories } from "@/actions/blog";
import { db } from "@/prisma/db";
import { notFound } from "next/navigation";

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const categories = await getArticleCategories();
  
  const article = await db.orm.public.Article.where({ id: params.id }).first();
  
  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ویرایش مقاله</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">در حال ویرایش: {article.title}</p>
      </div>

      <ArticleForm categories={categories} initialData={article} />
    </div>
  );
}
