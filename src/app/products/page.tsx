import { db } from '@/prisma/db';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { getSession } from '@/lib/session';

export const metadata = {
  title: 'محصولات فروشگاه',
  description: 'لیست جدیدترین محصولات و کالاهای دیجیتال و پوشاک',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : undefined;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const minPrice = typeof params.minPrice === 'string' ? parseInt(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === 'string' ? parseInt(params.maxPrice) : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : 'newest';

  // Fetch categories for the filter sidebar
  const categories = await db.orm.public.Category.select("id", "name", "slug").all();

  // Build the dynamic query
  let query = db.orm.public.Product.include("variants", (v) => v.include("inventory"));

  if (q) {
    query = query.where((p) => p.name.ilike(`%${q}%`));
  }
  
  if (category) {
    const selectedCat = categories.find(c => c.slug === category);
    if (selectedCat) {
      query = query.where((p) => p.categoryId.eq(selectedCat.id));
    }
  }
  
  if (minPrice && !isNaN(minPrice)) {
    query = query.where((p) => p.basePrice.gte(minPrice));
  }
  
  if (maxPrice && !isNaN(maxPrice)) {
    query = query.where((p) => p.basePrice.lte(maxPrice));
  }
  
  // Apply sorting
  if (sort === 'price_asc') {
    query = query.orderBy((p) => p.basePrice.asc());
  } else if (sort === 'price_desc') {
    query = query.orderBy((p) => p.basePrice.desc());
  } else if (sort === 'popular') {
    query = query.orderBy([(p) => p.salesCount.desc(), (p) => p.viewCount.desc()]);
  } else {
    // newest (default)
    query = query.orderBy((p) => p.createdAt.desc());
  }

  // Execute query
  const products = await query.all();

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
    'itemListElement': products.map((product, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Product',
        'name': product.name,
        'description': product.description || undefined,
        'image': product.images,
        'offers': {
          '@type': 'Offer',
          'price': product.basePrice - product.discount,
          'priceCurrency': 'IRR',
          'availability': 'https://schema.org/InStock',
        },
      }
    }))
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-gray-400">
            همه محصولات
          </h1>
          <p className="mt-4 text-gray-400">
            جدیدترین کالاهای موجود را با بهترین قیمت کشف کنید
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar / Filters */}
          <aside className="w-full md:w-1/4">
            <ProductFilters categories={categories} />
          </aside>

          {/* Product Grid */}
          <div className="w-full md:w-3/4">
            {products.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                <p className="text-xl text-gray-400">متاسفانه هیچ محصولی با این مشخصات یافت نشد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </main>
  );
}
