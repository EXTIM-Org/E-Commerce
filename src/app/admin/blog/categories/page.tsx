import { getArticleCategories, createArticleCategory } from "@/actions/blog";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminBlogCategoriesPage() {
  const categories = await getArticleCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-black/20 p-6 rounded-3xl border border-gray-200 dark:border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">دسته‌بندی‌های وبلاگ</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">مدیریت دسته‌های مقالات</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Category Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm backdrop-blur-xl sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-purple-500" />
              افزودن دسته‌بندی جدید
            </h2>
            <form action={async (formData) => {
              "use server";
              const name = formData.get("name") as string;
              const slug = formData.get("slug") as string;
              if (name && slug) {
                await createArticleCategory({ name, slug });
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نام دسته‌بندی</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="مثلا: راهنمای خرید"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نامک (Slug)</label>
                <input
                  type="text"
                  name="slug"
                  required
                  dir="ltr"
                  placeholder="e.g. buying-guides"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all shadow-md mt-2"
              >
                ثبت دسته‌بندی
              </button>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm backdrop-blur-xl">
            <table className="w-full text-right">
              <thead className="bg-gray-50/50 dark:bg-black/20 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-sm font-medium">
                <tr>
                  <th className="px-6 py-4">نام دسته‌بندی</th>
                  <th className="px-6 py-4">نامک (Slug)</th>
                  <th className="px-6 py-4 text-center">تعداد مقالات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {categories.length > 0 ? (
                  categories.map((cat: any) => (
                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {cat.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm" dir="ltr">
                        {cat.slug}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                        -
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      هیچ دسته‌بندی یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
