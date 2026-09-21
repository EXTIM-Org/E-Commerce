import { db } from '@/prisma/db';
import { ProductCard } from '@/components/product/ProductCard';
import { getSession } from '@/lib/session';

export const metadata = {
  title: 'پیشنهادهای ویژه',
  description: 'لیست محصولات دارای تخفیف و فروش ویژه',
};

export default async function OffersPage() {
  const now = new Date().toISOString();

  // Fetch products with direct discount > 0
  const discountedProducts = await db.orm.public.Product
    .where((p) => p.discount.gt(0))
    .include("variants", (v) => v.include("inventory"))
    .include("flashSale")
    .all();

  // Fetch products with active flash sales
  const activeFlashSales = await db.orm.public.FlashSale
    .where((f) => f.isActive.eq(true))
    .where((f) => f.startTime.lte(now))
    .where((f) => f.endTime.gte(now))
    .include("product", (p) => p.include("variants", (v) => v.include("inventory")).include("flashSale"))
    .all();

  // Combine and deduplicate products
  const productsMap = new Map();
  for (const p of discountedProducts) {
    productsMap.set(p.id, p);
  }
  for (const f of activeFlashSales) {
    if (f.product) {
      productsMap.set(f.productId, f.product);
    }
  }
  
  const products = Array.from(productsMap.values());

  // Sort by created At (newest first)
  products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Get user wishlist for the like button state
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

  // Generate JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': products.map((product, index) => {
      // Calculate effective price for SEO schema
      let effectiveDiscount = product.discount;
      if (product.flashSale && product.flashSale.isActive && new Date(product.flashSale.startTime) <= new Date() && new Date(product.flashSale.endTime) >= new Date()) {
        effectiveDiscount = product.basePrice * (product.flashSale.discountPercent / 100);
      }

      return {
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Product',
          'name': product.name,
          'description': product.description || undefined,
          'image': product.images,
          'offers': {
            '@type': 'Offer',
            'price': product.basePrice - effectiveDiscount,
            'priceCurrency': 'IRR',
            'availability': 'https://schema.org/InStock',
          },
        }
      }
    })
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4 bg-rose-500/10 dark:bg-rose-500/20 px-4 py-2 rounded-full border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">تخفیف‌های زمان‌دار و شگفت‌انگیز</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-rose-600 to-fuchsia-600 dark:from-rose-400 dark:to-fuchsia-400">
            پیشنهادهای ویژه
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            فرصت را از دست ندهید! محصولات زیر برای مدت محدودی با تخفیف‌های ویژه و قیمت‌های استثنایی به فروش می‌رسند.
          </p>
        </div>

        <div className="w-full">
          {products.length === 0 ? (
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-3xl p-16 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">در حال حاضر پیشنهادی نداریم!</h3>
              <p className="text-gray-600 dark:text-gray-400">متاسفانه در این لحظه محصولی با تخفیف ویژه موجود نیست. لطفاً بعداً دوباره سر بزنید.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  initialIsLiked={userWishlistProductIds.has(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
