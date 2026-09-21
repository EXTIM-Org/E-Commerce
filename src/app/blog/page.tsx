import { getArticles } from "@/actions/blog";
import Link from "next/link";
import { Calendar, Eye, User } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const articles = await getArticles({ publishedOnly: true });

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
          وبلاگ <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">EXTIM</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          جدیدترین مقالات، راهنمای خرید و اخبار تکنولوژی را اینجا بخوانید.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.length > 0 ? (
          articles.map((article: any) => (
            <Link href={`/blog/${article.slug}`} key={article.id} className="group flex flex-col bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
              <div className="aspect-[16/10] relative overflow-hidden bg-gray-100 dark:bg-black/20">
                {article.coverImage ? (
                  <img 
                    src={article.coverImage} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">بدون تصویر</div>
                )}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full text-xs font-bold text-purple-600 dark:text-purple-400">
                  {article.category?.name || "مقاله"}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {article.title}
                </h2>
                
                {article.excerpt && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                )}
                
                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {article.author?.name || "EXTIM"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fa-IR') : 'نامشخص'}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md">
                    <Eye className="w-4 h-4" />
                    {article.viewCount}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">هنوز مقاله‌ای منتشر نشده است</h3>
            <p className="text-gray-500 dark:text-gray-400">به زودی با محتوای جذاب برمی‌گردیم!</p>
          </div>
        )}
      </div>
    </div>
  );
}
