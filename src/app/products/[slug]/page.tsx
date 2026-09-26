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
import { getEffectivePrice } from "@/lib/price";
import { RecentlyViewedTracker } from "@/components/product/RecentlyViewedTracker";
import { RecentlyViewedCarousel } from "@/components/product/RecentlyViewedCarousel";

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
    .include("variants", (v) => v.select("id", "name", "sku", "price").include("inventory"))
    .include('specifications')
    .include('reviews', (r) => r.select("id", "rating", "comment", "isVerifiedBuyer", "purchasedVariantName", "adminReply", "adminReplyAt", "createdAt").include('user', (u) => u.select("name", "image")).include('votes'))
    .include('questions', (q) => q.select("id", "text", "createdAt").include('user', (u) => u.select("name", "image")).include('answers', (a) => a.select("id", "text", "isAdmin", "createdAt").include('user', (u) => u.select("name", "image"))))
    .include('flashSale')
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
      .include("items", (i) => i.select("productId"))
      .all().first();
    if (wishlist) {
      userWishlistProductIds = new Set(wishlist.items.map(i => i.productId));
    }
  }

  // Calculate price for JSON-LD based on the first variant or base price
  const basePriceForCalculation = (product.variants && product.variants.length > 0 && product.variants[0].price) 
    ? product.variants[0].price 
    : product.basePrice;
    
  const { finalPrice } = getEffectivePrice(basePriceForCalculation, product.discount, product.flashSale);

  // Calculate stock availability for JSON-LD
  let inStock = true;
  if (product.variants && product.variants.length > 0) {
    inStock = product.variants.some((v: any) => v.inventory && v.inventory.quantity > 0);
  }

  // 1. Calculate Aggregate Rating & Reviews Schema
  let aggregateRating = undefined;
  let reviewsSchema = undefined;
  
  if (product.reviews && product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    const averageRating = (totalRating / product.reviews.length).toFixed(1);
    
    aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': averageRating,
      'reviewCount': product.reviews.length,
      'bestRating': '5',
      'worstRating': '1'
    };

    reviewsSchema = product.reviews.map((review: any) => ({
      '@type': 'Review',
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': review.rating,
        'bestRating': '5',
        'worstRating': '1'
      },
      'author': {
        '@type': 'Person',
        'name': review.user?.name || 'کاربر مهمان'
      },
      'reviewBody': review.comment,
      'datePublished': new Date(review.createdAt).toISOString()
    }));
  }

  // 2. FAQ Page Schema
  let faqSchema = undefined;
  if (product.questions && product.questions.length > 0) {
    const questionsWithAnswers = product.questions.filter((q: any) => q.answers && q.answers.length > 0);
    if (questionsWithAnswers.length > 0) {
      faqSchema = {
        '@type': 'FAQPage',
        '@id': `https://extim.com/products/${product.slug}#faq`,
        'mainEntity': questionsWithAnswers.map((q: any) => ({
          '@type': 'Question',
          'name': q.text,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': q.answers[0].text
          }
        }))
      };
    }
  }

  // 3. BreadcrumbList Schema
  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    '@id': `https://extim.com/products/${product.slug}#breadcrumb`,
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'فروشگاه EXTIM',
        'item': 'https://extim.com/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': product.category?.name || 'محصولات',
        'item': `https://extim.com/categories/${product.category?.slug || 'all'}`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product.name,
        'item': `https://extim.com/products/${product.slug}`
      }
    ]
  };

  // 4. Product Schema
  const productSchema = {
    '@type': 'Product',
    '@id': `https://extim.com/products/${product.slug}#product`,
    'name': product.name,
    'description': product.description || undefined,
    'image': product.images,
    'sku': (product.variants && product.variants.length > 0) ? product.variants[0].sku : product.id,
    'brand': {
      '@type': 'Brand',
      'name': 'EXTIM'
    },
    'offers': {
      '@type': 'Offer',
      'url': `https://extim.com/products/${product.slug}`,
      'priceCurrency': 'IRR',
      'price': finalPrice,
      'priceValidUntil': product.flashSale 
        ? new Date(product.flashSale.endTime).toISOString().split('T')[0] 
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      'availability': inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'itemCondition': 'https://schema.org/NewCondition',
    },
    ...(aggregateRating && { aggregateRating }),
    ...(reviewsSchema && { review: reviewsSchema }),
  };

  // JSON-LD Graph Payload
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      productSchema,
      breadcrumbSchema,
      ...(faqSchema ? [faqSchema] : [])
    ]
  };

  return (
    <main className="min-h-screen py-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Track Recently Viewed */}
      <RecentlyViewedTracker productId={product.id} />
      
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
        introductionContent={
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">معرفی محصول</h3>
            {product.introduction ? (
              <div 
                className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-loose"
                dangerouslySetInnerHTML={{ __html: product.introduction }}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                معرفی محصول برای این کالا ثبت نشده است.
              </p>
            )}
          </div>
        }
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
        specificationsContent={
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">مشخصات</h3>
            {product.specifications && product.specifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec) => (
                  <div key={spec.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-2xl">
                    <span className="text-gray-500 dark:text-gray-400 font-medium mb-1 sm:mb-0">{spec.name}</span>
                    <span className="text-gray-900 dark:text-white font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">مشخصات برای این محصول ثبت نشده است.</p>
            )}
          </div>
        }
      />

      {/* Recently Viewed */}
      <div className="mt-12 max-w-7xl mx-auto border-t border-white/10 pt-12">
        <RecentlyViewedCarousel excludeProductId={product.id} />
      </div>

    </main>
  );
}
