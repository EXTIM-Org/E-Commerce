import { db } from '@/prisma/db';
import Link from 'next/link';
import { 
  Package, 
  Smartphone, 
  Monitor, 
  Headphones, 
  Camera, 
  Watch, 
  Shirt, 
  Utensils, 
  Sparkles,
  Gamepad2,
  BookOpen,
  Home as HomeIcon,
  ShoppingBag
} from 'lucide-react';
import * as Icons from 'lucide-react';

export const metadata = {
  title: 'دسته‌بندی‌های محصولات | EXTIM E-Commerce Platform',
  description: 'لیست تمامی دسته‌بندی‌های موجود در فروشگاه EXTIM',
};

// Map slugs or names to icons
const getCategoryIcon = (slug: string, className: string = "w-8 h-8") => {
  const iconMap: Record<string, React.ReactNode> = {
    'electronics': <Smartphone className={className} />,
    'digital': <Monitor className={className} />,
    'clothing': <Shirt className={className} />,
    'fashion': <Shirt className={className} />,
    'home': <HomeIcon className={className} />,
    'kitchen': <Utensils className={className} />,
    'gaming': <Gamepad2 className={className} />,
    'books': <BookOpen className={className} />,
    'audio': <Headphones className={className} />,
    'cameras': <Camera className={className} />,
    'watches': <Watch className={className} />,
    'accessories': <Watch className={className} />,
  };

  // Check if any key is in the slug
  for (const key in iconMap) {
    if (slug.toLowerCase().includes(key)) {
      return iconMap[key];
    }
  }
  
  return <ShoppingBag className={className} />;
};

// Beautiful gradient presets for the cards
const gradients = [
  "from-pink-500 to-rose-500",
  "from-purple-500 to-indigo-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-fuchsia-500 to-pink-500",
  "from-blue-600 to-violet-600",
  "from-lime-400 to-green-500",
];

export default async function CategoriesPage() {
  // Fetch categories with product counts
  const categories = await db.orm.public.Category
    .include("products", (p) => p.count())
    .orderBy((c) => c.createdAt.asc())
    .all();

  return (
    <main className="min-h-screen pt-28 pb-20 px-6 bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-800">
            <Sparkles className="w-6 h-6 mr-2 animate-pulse" />
            <span className="font-semibold text-sm">تنوع بی‌نظیر</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-l from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 mb-6 tracking-tight">
            دسته‌بندی‌های فروشگاه
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
            محصول مورد نظر خود را از بین دسته‌بندی‌های متنوع ما پیدا کنید و تجربه‌ای متفاوت از خرید داشته باشید.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((category, index) => {
            const gradientClass = category.colorGradient || gradients[index % gradients.length];
            
            let IconComponent = ShoppingBag;
            if (category.iconName && (Icons as any)[category.iconName]) {
              IconComponent = (Icons as any)[category.iconName];
            }
            
            return (
              <Link 
                key={category.id} 
                href={`/products?category=${category.slug}`}
                className="group relative h-64 rounded-3xl p-1 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                {/* Animated Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Inner Content (Glassmorphism) */}
                <div className="relative h-full flex flex-col justify-between p-8 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-[1.35rem] border border-white/30 dark:border-white/10 transition-colors duration-500 group-hover:bg-white/10 dark:group-hover:bg-black/10">
                  
                  <div className="flex items-start justify-between">
                    <div className="p-4 bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-2xl text-white shadow-inner flex items-center justify-center overflow-hidden" style={{ width: '4.5rem', height: '4.5rem' }}>
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-contain" />
                      ) : category.iconName && (Icons as any)[category.iconName] ? (
                        <IconComponent className="w-10 h-10" />
                      ) : (
                        getCategoryIcon(category.slug, "w-10 h-10")
                      )}
                    </div>
                    
                    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-medium">
                      {category.products} محصول
                    </div>
                  </div>

                  <div className="mt-4">
                    <h2 className="text-2xl font-bold text-white mb-2 group-hover:scale-105 transform origin-right transition-transform duration-300">
                      {category.name}
                    </h2>
                    <div className="w-0 h-1 bg-white rounded-full group-hover:w-1/2 transition-all duration-500 ease-out" />
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500" />
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500" />
                </div>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">هیچ دسته‌بندی یافت نشد</h2>
            <p className="text-gray-500 mt-2">در حال حاضر دسته‌بندی برای نمایش وجود ندارد.</p>
          </div>
        )}

      </div>
    </main>
  );
}
