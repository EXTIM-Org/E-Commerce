import { db } from "@/prisma/db";
import { withCache } from "@/lib/cache";

const CACHE_TTL = 15 * 60; // 15 minutes

// 1. Content-based: Similar Products
export async function getSimilarProducts(productId: string, categoryId: string, limit: number = 4) {
  return withCache(`cache:products:similar:${productId}:${categoryId}:${limit}`, CACHE_TTL, async () => {
    return await db.orm.public.Product
      .where((p) => p.categoryId.eq(categoryId))
      .where((p) => p.id.neq(productId))
      .include("variants", (v) => v.select("id", "name", "sku", "price").include("inventory"))
      .include("flashSale")
      .orderBy((p) => p.salesCount.desc())
      .limit(limit)
      .all();
  });
}

// 2. Popular Products
export async function getPopularProducts(limit: number = 8) {
  return withCache(`cache:products:popular:${limit}`, CACHE_TTL, async () => {
    return await db.orm.public.Product
      .include("variants", (v) => v.select("id", "name", "sku", "price").include("inventory"))
      .include("flashSale")
      .orderBy([(p) => p.salesCount.desc(), (p) => p.viewCount.desc()])
      .limit(limit)
      .all();
  });
}

// 3. Special Offers (Discounted)
export async function getSpecialOffers(limit: number = 8) {
  return withCache(`cache:products:special-offers:${limit}`, CACHE_TTL, async () => {
    return await db.orm.public.Product
      .where((p) => p.discount.gt(0))
      .include("variants", (v) => v.select("id", "name", "sku", "price").include("inventory"))
      .include("flashSale")
      .orderBy((p) => p.discount.desc())
      .limit(limit)
      .all();
  });
}

// 4. New Arrivals
export async function getNewArrivals(limit: number = 8) {
  return withCache(`cache:products:new-arrivals:${limit}`, CACHE_TTL, async () => {
    return await db.orm.public.Product
      .include("variants", (v) => v.select("id", "name", "sku", "price").include("inventory"))
      .include("flashSale")
      .orderBy((p) => p.createdAt.desc())
      .limit(limit)
      .all();
  });
}

// 3. Collaborative Filtering (Frequently Bought Together)
export async function getFrequentlyBoughtTogether(productId: string, limit: number = 4) {
  return withCache(`cache:products:fbt:${productId}:${limit}`, CACHE_TTL, async () => {
    const variants = await db.orm.public.ProductVariant.where({ productId }).select("id").all();
    if (variants.length === 0) return [];
    const variantIds = variants.map(v => v.id);

    const orderItemsWithProduct = await db.orm.public.OrderItem
      .where((oi) => oi.variantId.in(variantIds))
      .select("orderId")
      .all();

    if (orderItemsWithProduct.length === 0) {
      return [];
    }

    const orderIds = orderItemsWithProduct.map(oi => oi.orderId);

    const relatedOrderItems = await db.orm.public.OrderItem
      .where((oi) => oi.orderId.in(orderIds))
      .include("variant", (v) => 
        v.select("productId").include("product", (p) => 
          p.include("variants", (v2) => v2.select("id", "name", "sku", "price").include("inventory"))
           .include("flashSale")
        )
      )
      .all();

    const productFrequency = new Map<string, { count: number, product: any }>();
    
    for (const item of relatedOrderItems) {
      if (item.variant && item.variant.product && item.variant.productId !== productId) {
        const relatedProductId = item.variant.productId;
        const existing = productFrequency.get(relatedProductId);
        if (existing) {
          existing.count += 1;
        } else {
          productFrequency.set(relatedProductId, { count: 1, product: item.variant.product });
        }
      }
    }

    const sortedProducts = Array.from(productFrequency.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(entry => entry.product);

    return sortedProducts;
  });
}

// 5. Flash Sales
export async function getFlashSales(limit: number = 8) {
  return withCache(`cache:products:flash-sales:${limit}`, CACHE_TTL, async () => {
    const now = new Date().toISOString();
    const sales = await db.orm.public.FlashSale
      .where((f) => f.isActive.eq(true))
      .where((f) => f.startTime.lte(now))
      .where((f) => f.endTime.gte(now))
      .include("product", (p) => p.include("variants", (v) => v.select("id", "name", "sku", "price").include("inventory")).include("flashSale"))
      .limit(limit)
      .all();
      
    return sales.map(s => s.product).filter(Boolean);
  });
}

// Helper to asynchronously increment view count
export async function incrementProductView(productId: string) {
  try {
    const product = await db.orm.public.Product.where({ id: productId }).select("viewCount").all().first();
    if (product) {
      await db.orm.public.Product.where({ id: productId }).update({
        viewCount: product.viewCount + 1
      });
    }
  } catch (error) {
    console.error("Failed to increment product view:", error);
  }
}
