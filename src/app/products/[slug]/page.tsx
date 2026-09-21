import { notFound } from "next/navigation";
import { db } from "@/prisma/db";
import { ProductClient } from "@/components/product/ProductClient";
import { getSimilarProducts, getFrequentlyBoughtTogether, incrementProductView } from "@/lib/recommender";
import { getSession } from "@/lib/session";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ReviewForm } from "@/components/product/ReviewForm";
import { QASection } from "@/components/product/QASection";
import { InteractionTabs } from "@/components/product/InteractionTabs";
import { ReviewItem } from "@/components/product/ReviewItem";
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
    .include('reviews', (r) => r.include('user').include('votes'))
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
      <ProductClient product={product} initialIsLiked={userWishlistProductIds.has(product.id)} />

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
                    <ReviewItem key={review.id} review={review as any} currentUserId={session?.userId as string | null} />
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
