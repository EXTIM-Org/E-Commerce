import { db } from '../src/prisma/db';

async function main() {
  console.log('Seeding database...');
  
  try {
    // Check if category exists
    const existingCat = await db.orm.public.Category.all().first();
    if (existingCat) {
      console.log('Database already seeded!');
      return;
    }
    
    // Create categories
    const electronicCat = await db.orm.public.Category.create({
      name: 'محصولات الکترونیکی',
      slug: 'electronics',
    });
    
    const fashionCat = await db.orm.public.Category.create({
      name: 'پوشاک و مد',
      slug: 'fashion',
    });

    // Create products
    const p1 = await db.orm.public.Product.create({
      name: 'گوشی موبایل اپل آیفون 15 پرو مکس',
      slug: 'apple-iphone-15-pro-max',
      description: 'پرچمدار جدید اپل با دوربین ۴۸ مگاپیکسلی و پردازنده فوق سریع.',
      basePrice: 65000000,
      discount: 2000000,
      categoryId: electronicCat.id,
      images: ['https://picsum.photos/seed/iphone/800/800'],
    });

    const v1 = await db.orm.public.ProductVariant.create({
      productId: p1.id,
      name: 'تیتانیوم مشکی - 256GB',
      sku: 'IP15PM-BLK-256',
    });
    
    await db.orm.public.Inventory.create({
      variantId: v1.id,
      stockQuantity: 15,
      lowStockThreshold: 3,
    });

    const p2 = await db.orm.public.Product.create({
      name: 'تی‌شرت مردانه یقه گرد پنبه‌ای',
      slug: 'men-cotton-tshirt',
      description: 'تی‌شرت با کیفیت عالی و تنفس‌پذیر مناسب برای استفاده روزمره.',
      basePrice: 450000,
      discount: 0,
      categoryId: fashionCat.id,
      images: ['https://picsum.photos/seed/tshirt/800/800'],
    });

    const v2 = await db.orm.public.ProductVariant.create({
      productId: p2.id,
      name: 'سایز L - سفید',
      sku: 'TSHIRT-L-WHT',
    });

    await db.orm.public.Inventory.create({
      variantId: v2.id,
      stockQuantity: 50,
    });

    const p3 = await db.orm.public.Product.create({
      name: 'لپ‌تاپ ایسوس ROG Strix',
      slug: 'asus-rog-strix',
      description: 'لپ‌تاپ گیمینگ قدرتمند با گرافیک RTX 4070.',
      basePrice: 85000000,
      discount: 5000000,
      categoryId: electronicCat.id,
      images: ['https://picsum.photos/seed/laptop/800/800'],
    });

    const v3 = await db.orm.public.ProductVariant.create({
      productId: p3.id,
      name: 'پیش‌فرض',
      sku: 'ROG-STRIX-4070',
    });

    await db.orm.public.Inventory.create({
      variantId: v3.id,
      stockQuantity: 5,
      lowStockThreshold: 2,
    });

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

main();
