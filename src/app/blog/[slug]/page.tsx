import { getArticleBySlug, incrementArticleView } from "@/actions/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar, Eye, Tag, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "مقاله یافت نشد" };
  
  return {
    title: `${article.title} | مجله EXTIM`,
    description: article.excerpt || article.title,
    openGraph: {
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function SingleArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  
  if (!article) {
    notFound();
  }

  // Increment view count asynchronously
  incrementArticleView(article.id).catch(console.error);

  // Generate JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.excerpt || undefined,
    'image': article.coverImage ? [article.coverImage] : undefined,
    'datePublished': article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    'dateModified': article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
    'author': [{
      '@type': 'Person',
      'name': article.author?.name || 'EXTIM',
      'url': 'https://extim.com/about'
    }]
  };

  return (
    <article className="min-h-screen bg-gray-50/50 dark:bg-black/5 pb-20">
      {/* JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Hero Section */}
      <div className="bg-white dark:bg-black/20 border-b border-gray-200 dark:border-white/10 pt-10 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 mb-8 transition-colors">
            <ArrowRight className="w-4 h-4" />
            بازگشت به وبلاگ
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
              <Tag className="w-3.5 h-3.5" />
              {article.category?.name || "مقاله"}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-8">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-[2px]">
                <div className="w-full h-full bg-white dark:bg-black rounded-full flex items-center justify-center overflow-hidden">
                  {article.author?.image ? (
                    <img src={article.author.image} alt={article.author.name || ""} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              <span className="font-medium">{article.author?.name || "تیم تولید محتوا EXTIM"}</span>
            </div>
            
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-70" />
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'نامشخص'}
            </span>
            
            <span className="flex items-center gap-2 mr-auto bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
              <Eye className="w-4 h-4 text-purple-500" />
              <span className="font-medium">{article.viewCount + 1} بازدید</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 mt-[-40px]">
        {article.coverImage && (
          <div className="rounded-3xl overflow-hidden shadow-2xl mb-12 border border-gray-200/50 dark:border-white/10 bg-white">
            <img src={article.coverImage} alt={article.title} className="w-full h-auto max-h-[600px] object-cover" />
          </div>
        )}
        
        <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-12 shadow-sm backdrop-blur-xl">
          <div className="prose prose-lg dark:prose-invert prose-purple max-w-none text-justify
            prose-headings:font-bold prose-a:text-purple-600 dark:prose-a:text-purple-400
            prose-img:rounded-2xl prose-img:shadow-md
            prose-pre:bg-gray-900 prose-pre:border-gray-800
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </article>
  );
}
