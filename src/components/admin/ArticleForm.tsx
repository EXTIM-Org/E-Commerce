"use client";

import { useState } from "react";
import { saveArticle } from "@/actions/blog";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface ArticleFormProps {
  categories: any[];
  initialData?: any;
}

export function ArticleForm({ categories, initialData }: ArticleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState(initialData?.content || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await saveArticle({
        id: initialData?.id,
        title: formData.get("title") as string,
        slug: formData.get("slug") as string,
        excerpt: formData.get("excerpt") as string,
        content: content,
        categoryId: formData.get("categoryId") as string,
        status: formData.get("status") as "DRAFT" | "PUBLISHED",
        coverImage: formData.get("coverImage") as string,
      });
      
      toast.success(initialData ? "مقاله ویرایش شد" : "مقاله با موفقیت ایجاد شد");
      router.push("/admin/blog");
    } catch (error) {
      toast.error("خطا در ذخیره مقاله");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-4 rounded-3xl border border-gray-200 dark:border-white/10 backdrop-blur-xl sticky top-6 z-10 shadow-sm">
        <Link
          href="/admin/blog"
          className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex gap-3">
          <select
            name="status"
            defaultValue={initialData?.status || "DRAFT"}
            className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="DRAFT">پیش‌نویس</option>
            <option value="PUBLISHED">انتشار عمومی</option>
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "در حال ذخیره..." : "ذخیره مقاله"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان مقاله</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={initialData?.title}
                  required
                  placeholder="تیتر جذاب برای مقاله..."
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none text-lg font-medium transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">محتوای مقاله (Markdown)</label>
                <textarea
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={20}
                  dir="auto"
                  placeholder="شروع به نوشتن کنید... (پشتیبانی از Markdown)"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono text-sm leading-relaxed transition-all resize-y"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">تنظیمات انتشار</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">دسته‌بندی</label>
                <div className="relative">
                  <select
                    name="categoryId"
                    defaultValue={initialData?.categoryId}
                    required
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  >
                    <option value="" disabled>انتخاب کنید...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نامک (Slug)</label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={initialData?.slug}
                  required
                  dir="ltr"
                  placeholder="how-to-buy-phone"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">خلاصه (Excerpt)</label>
                <textarea
                  name="excerpt"
                  defaultValue={initialData?.excerpt}
                  rows={3}
                  placeholder="توضیح کوتاه برای نمایش در کارت مقاله (SEO)"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">لینک تصویر کاور</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pl-3 flex items-center pr-4 pointer-events-none text-gray-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    name="coverImage"
                    defaultValue={initialData?.coverImage}
                    dir="ltr"
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl pr-12 pl-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
