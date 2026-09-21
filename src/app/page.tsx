import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPopularProducts, getSpecialOffers, getNewArrivals, getFlashSales } from "@/lib/recommender";
import { getSession } from "@/lib/session";
import { db } from "@/prisma/db";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { RecentlyViewedCarousel } from "@/components/product/RecentlyViewedCarousel";

export default async function Home() {
  const flashSales = await getFlashSales(8);
  const popularProducts = await getPopularProducts(8);
  const specialOffers = await getSpecialOffers(8);
  const newArrivals = await getNewArrivals(8);
  
  const session = await getSession();
  let userWishlistProductIds = new Set<string>();
  
  if (session?.userId) {
    const wishlist = await db.orm.public.Wishlist
      .where({ userId: session.userId as string })
      .include("items")
      .all().first();
    if (wishlist) {
      userWishlistProductIds = new Set(wishlist.items.map(i => i.productId));
    }
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* Ambient Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-violet-600/10 dark:bg-violet-600/20 rounded-full blur-[100px] sm:blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-fuchsia-600/10 dark:bg-fuchsia-600/20 rounded-full blur-[100px] sm:blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 text-center z-10 flex flex-col items-center gap-8 py-20">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-medium border border-violet-500/20 shadow-sm backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
          </span>
          پلتفرم هوشمند فروشگاهی
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[1.1]">
          نسل جدید <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400">
            تجارت الکترونیک
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
          محصولات پرمیوم، پیشنهادهای هوشمند اختصاصی شما و تجربه‌ای بی‌نظیر از یک خرید فوق‌سریع. به دنیای **EXTIM** خوش آمدید.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
          <Link 
            href="/products" 
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] hover:scale-105"
          >
            <span>مشاهده محصولات</span>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href="/categories" 
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground font-medium transition-all border border-foreground/10 backdrop-blur-sm"
          >
            دسته‌بندی‌ها
          </Link>
        </div>
        
        {/* Flash Sales Carousel */}
        {flashSales.length > 0 && (
          <div className="w-full max-w-7xl mt-12">
            <ProductCarousel 
              title="⏳ پیشنهادهای شگفت‌انگیز" 
              products={flashSales} 
              userWishlistIds={userWishlistProductIds}
            />
          </div>
        )}
        
        {/* Special Offers Carousel */}
        {specialOffers.length > 0 && (
          <div className="w-full max-w-7xl mt-12">
            <ProductCarousel 
              title="🔥 پیشنهادهای شگفت‌انگیز" 
              products={specialOffers} 
              userWishlistIds={userWishlistProductIds}
            />
          </div>
        )}

        {/* Popular Products Carousel */}
        {popularProducts.length > 0 && (
          <div className="w-full max-w-7xl mt-8">
            <ProductCarousel 
              title="⭐ پرفروش‌ترین‌ها" 
              products={popularProducts} 
              userWishlistIds={userWishlistProductIds}
            />
          </div>
        )}

        {/* New Arrivals Carousel */}
        {newArrivals.length > 0 && (
          <div className="w-full max-w-7xl mt-8 mb-12">
            <ProductCarousel 
              title="✨ تازه‌ها" 
              products={newArrivals} 
              userWishlistIds={userWishlistProductIds}
            />
          </div>
        )}
        
        {/* Recently Viewed Carousel */}
        <div className="w-full max-w-7xl mt-8 mb-12">
          <RecentlyViewedCarousel />
        </div>
        
      </div>
    </div>
  );
}
