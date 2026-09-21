import { ArticleForm } from "@/components/admin/ArticleForm";
import { getArticleCategories } from "@/actions/blog";

export default async function NewArticlePage() {
  const categories = await getArticleCategories();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">نوشتن مقاله جدید</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">محتوای ارزشمند برای کاربران خود خلق کنید.</p>
      </div>

      <ArticleForm categories={categories} />
    </div>
  );
}
