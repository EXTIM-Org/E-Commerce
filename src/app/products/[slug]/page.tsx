import { notFound } from "next/navigation";
import { db } from "@/prisma/db";
import { ProductClient } from "@/components/product/ProductClient";
import { getSimilarProducts, getFrequentlyBoughtTogether, incrementProductView } from "@/lib/recommender";
import { getSession } from "@/lib/session";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ReviewForm } from "@/components/product/ReviewForm";
import { QASection } from "@/components/product/QASection";
import { InteractionTabs } from "@/components/product/InteractionTabs";
import { Star, BadgeCheck } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await db.orm.public.Product.where({ slug }).first();
  
  if (!product) {
    return { title: 'محصول یافت نشد' };
  }
  
  return {
    title: `${product.name} | فروشگاه EXTIM`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  const product = await db.orm.public.Product.where({ slug })
    .include('category')
    .include("variants", (v) => v.include("inventory"))
    .include('reviews', (r) => r.include('user'))
    .include('questions', (q) => q.include('user').include('answers', (a) => a.include('user')))
    .first();

  if (!product) {
    notFound();
  }

  // Increment view count asynchronously
  incrementProductView(product.id);

  // Recommender Queries
  const similarProducts = await getSimilarProducts(product.id, product.categoryId, 8);
  const boughtTogetherProducts = await getFrequentlyBoughtTogether(product.id, 8);

  // Fetch Wishlist
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

  // Calculate price for JSON-LD based on the first variant or base price
  const basePrice = (product.variants && product.variants.length > 0 && product.variants[0].price) 
    ? product.variants[0].price 
    : product.basePrice;
    
  const finalPrice = basePrice - product.discount;

  // JSON-LD Schema for single product SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description || undefined,
    'image': product.images,
    'sku': (product.variants && product.variants.length > 0) ? product.variants[0].sku : product.id,
    'offers': {
      '@type': 'Offer',
      'url': `https://extim.com/products/${product.slug}`,
      'priceCurrency': 'IRR',
      'price': finalPrice,
      'availability': 'https://schema.org/InStock',
      'itemCondition': 'https://schema.org/NewCondition',
    },
  };

  return (
    <main className="min-h-screen py-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Product Client UI */}
      <ProductClient product={product} />

      {/* Frequently Bought Together */}
      {boughtTogetherProducts.length > 0 && (
        <div className="mt-24 max-w-7xl mx-auto border-t border-white/10 pt-12">
          <ProductCarousel 
            title="خریداران این محصول، محصولات زیر را هم خریده‌اند" 
            products={boughtTogetherProducts} 
            userWishlistIds={userWishlistProductIds}
          />
        </div>
      )}

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-12 max-w-7xl mx-auto border-t border-white/10 pt-12">
          <ProductCarousel 
            title="محصولات مشابه" 
            products={similarProducts} 
            userWishlistIds={userWishlistProductIds}
          />
        </div>
      )}

      {/* Interaction Tabs (Reviews & QA) */}
      <InteractionTabs 
        reviewsCount={product.reviews?.length || 0}
        qaCount={product.questions?.length || 0}
        reviewsContent={
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Reviews List */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm dark:shadow-none backdrop-blur-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">{review.user?.name || "کاربر ناشناس"}</span>
                            {review.isVerifiedBuyer && (
                              <span className="flex items-center gap-1 text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                                <BadgeCheck className="w-3 h-3" />
                                خریدار این محصول
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString("fa-IR")}
                            </span>
                            {review.isVerifiedBuyer && review.purchasedVariantName && review.purchasedVariantName !== "Default" && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600 pr-2">
                                {review.purchasedVariantName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center" dir="ltr">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-4 h-4 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mt-2">{review.comment}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none">
                    <p className="text-gray-500 dark:text-gray-400">هنوز نظری برای این محصول ثبت نشده است. شما اولین نفر باشید!</p>
                  </div>
                )}
              </div>
              
              {/* Review Form */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <ReviewForm productId={product.id} isLoggedIn={!!session?.userId} />
                </div>
              </div>
            </div>
          </div>
        }
        qaContent={
          <QASection productId={product.id} isLoggedIn={!!session?.userId} questions={product.questions || []} />
        }
      />

    </main>
  );
}
