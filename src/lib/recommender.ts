import { db } from "@/prisma/db";

// 1. Content-based: Similar Products
export async function getSimilarProducts(productId: string, categoryId: string, limit: number = 4) {
  // Fetch products in the same category, excluding the current one
  // Ordered by salesCount as a secondary sorting metric
  const products = await db.orm.public.Product
    .where((p) => p.categoryId.eq(categoryId))
    .where((p) => p.id.neq(productId))
    .include("variants", (v) => v.include("inventory"))
    .orderBy((p) => p.salesCount.desc())
    .limit(limit)
    .all();
    
  return products;
}

// 2. Popular Products
export async function getPopularProducts(limit: number = 8) {
  // Fetch products with highest sales count and view count
  const products = await db.orm.public.Product
    .include("variants", (v) => v.include("inventory"))
    .orderBy([(p) => p.salesCount.desc(), (p) => p.viewCount.desc()])
    .limit(limit)
    .all();
    
  return products;
}

// 3. Special Offers (Discounted)
export async function getSpecialOffers(limit: number = 8) {
  // Fetch products that have a discount > 0, ordered by highest discount
  const products = await db.orm.public.Product
    .where((p) => p.discount.gt(0))
    .include("variants", (v) => v.include("inventory"))
    .orderBy((p) => p.discount.desc())
    .limit(limit)
    .all();
    
  return products;
}

// 4. New Arrivals
export async function getNewArrivals(limit: number = 8) {
  // Fetch the latest added products
  const products = await db.orm.public.Product
    .include("variants", (v) => v.include("inventory"))
    .orderBy((p) => p.createdAt.desc())
    .limit(limit)
    .all();
    
  return products;
}

// 3. Collaborative Filtering (Frequently Bought Together)
export async function getFrequentlyBoughtTogether(productId: string, limit: number = 4) {
  // First, get all variant IDs for this product
  const variants = await db.orm.public.ProductVariant.where({ productId }).select("id").all();
  if (variants.length === 0) return [];
  const variantIds = variants.map(v => v.id);

  // Find orders that contain these variants
  const orderItemsWithProduct = await db.orm.public.OrderItem
    .where((oi) => oi.variantId.in(variantIds))
    .select("orderId")
    .all();

  if (orderItemsWithProduct.length === 0) {
    return [];
  }

  const orderIds = orderItemsWithProduct.map(oi => oi.orderId);

  // Find other order items in those same orders
  const relatedOrderItems = await db.orm.public.OrderItem
    .where((oi) => oi.orderId.in(orderIds))
    .include("variant", (v) => 
      v.include("product", (p) => 
        p.include("variants", (v2) => v2.include("inventory"))
      )
    )
    .all();

  // Count frequencies of products (excluding the current product)
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

  // Sort by frequency
  const sortedProducts = Array.from(productFrequency.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(entry => entry.product);

  return sortedProducts;
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
