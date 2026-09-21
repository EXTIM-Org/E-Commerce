import { getArticles, deleteArticle } from "@/actions/blog";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const articles = await getArticles();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-black/20 p-6 rounded-3xl border border-gray-200 dark:border-white/10 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">وبلاگ و مقالات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">مدیریت محتوا و اخبار فروشگاه</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog/categories"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            دسته‌بندی‌ها
          </Link>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            مقاله جدید
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50/50 dark:bg-black/20 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">عنوان مقاله</th>
                <th className="px-6 py-4">دسته‌بندی</th>
                <th className="px-6 py-4">نویسنده</th>
                <th className="px-6 py-4 text-center">وضعیت</th>
                <th className="px-6 py-4 text-center">بازدید</th>
                <th className="px-6 py-4 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {articles.length > 0 ? (
                articles.map((article: any) => (
                  <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white line-clamp-1">{article.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1" dir="ltr">{article.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-medium">
                        {article.category?.name || "بدون دسته"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {article.author?.name || "ناشناس"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        article.status === 'PUBLISHED' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>
                        {article.status === 'PUBLISHED' ? 'منتشر شده' : 'پیش‌نویس'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">{article.viewCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/blog/${article.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors"
                          title="مشاهده در سایت"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/blog/${article.id}`}
                          className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <form action={async () => {
                          "use server";
                          await deleteArticle(article.id);
                        }}>
                          <button
                            type="submit"
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    هیچ مقاله‌ای یافت نشد. اولین مقاله خود را بنویسید!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
