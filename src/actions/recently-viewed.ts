"use server";

import { db } from "@/prisma/db";
import { and } from "@prisma/orm-postgres/orm-client";

export async function getProductsByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];

  try {
    const products = await db.orm.public.Product.where((p) => p.id.in(ids))
      .include('category')
      .include('variants', (v) => v.include('inventory'))
      .all();
    
    // Fetch flash sales separately since relations are tricky in Prisma 8 Contract mode
    // We'll just fetch active flash sales for these products
    const now = new Date();
    const flashSales = await db.orm.public.FlashSale.where((f) => 
      and(
        f.productId.in(ids),
        f.isActive.eq(true),
        f.startTime.lte(now.toISOString()),
        f.endTime.gte(now.toISOString())
      )
    ).all();

    // Map the products and sort them to match the original IDs order
    const orderedProducts = ids
      .map(id => {
        const product = products.find(p => p.id === id);
        if (!product) return null;
        
        const flashSale = flashSales.find(fs => fs.productId === id);
        return {
          ...product,
          flashSale: flashSale ? [flashSale] : [], // Wrap in array to match Prisma relation format if needed by ProductCard
        };
      })
      .filter(Boolean); // Remove nulls if a product was deleted

    return orderedProducts;
  } catch (error) {
    console.error("Error fetching recently viewed products:", error);
    return [];
  }
}
