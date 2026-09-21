import Link from 'next/link';
import Image from 'next/image';
import { AddToCartQuick } from './AddToCartQuick';
import { WishlistButton } from './WishlistButton';
import { FlashSaleCountdown } from './FlashSaleCountdown';
import { getEffectivePrice } from '@/lib/price';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    discount: number;
    images: readonly string[];
    variants?: any[];
    flashSale?: {
      isActive: boolean;
      startTime: string | Date;
      endTime: string | Date;
      discountPercent: number;
    } | null;
  };
  initialIsLiked?: boolean;
}

export function ProductCard({ product, initialIsLiked = false }: ProductCardProps) {
  const { originalPrice, finalPrice, hasDiscount, discountPercent } = getEffectivePrice(product.basePrice - product.discount, product.flashSale);
  const totalStock = product.variants?.reduce((acc: number, v: any) => acc + (v.inventory?.stockQuantity || 0), 0) ?? 0;
  const isOutOfStock = totalStock === 0 && product.variants && product.variants.length > 0;
  const isLowStock = !isOutOfStock && totalStock > 0 && totalStock <= 5;
  
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(147,51,234,0.1)] dark:hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] shadow-sm dark:shadow-none ${isOutOfStock ? "opacity-75 grayscale-[30%]" : ""}`}>
        
        {/* Wishlist Button */}
        <WishlistButton productId={product.id} initialIsLiked={initialIsLiked} />
        
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-black/20">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">
              بدون تصویر
            </div>
          )}
          
          {/* Discount Badge */}
          {(product.discount > 0 || hasDiscount) && !isOutOfStock && (
            <div className="absolute top-4 right-4 rounded-full bg-rose-600/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md flex flex-col items-center">
              {hasDiscount ? `%${discountPercent}- شگفت‌انگیز` : 'تخفیف ویژه'}
            </div>
          )}
          
          {/* Smart Badges */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-white/90 dark:bg-black/80 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-bold tracking-wider shadow-xl border border-white/20">
                ناموجود
              </span>
            </div>
          )}
          {isLowStock && (
            <div className="absolute top-4 right-4 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              موجودی محدود
            </div>
          )}

          {/* Flash Sale Countdown (Absolute inside Image) */}
          {hasDiscount && product.flashSale && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] max-w-[200px] flex justify-center backdrop-blur-md bg-white/80 dark:bg-black/70 rounded-full border border-white/30 dark:border-white/10 shadow-lg">
              <FlashSaleCountdown endTime={product.flashSale.endTime} className="bg-transparent! w-full justify-center px-1 py-1 text-xs" />
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-5 flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[40px]">
            {product.description}
          </p>
          
          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-col min-h-[52px] justify-end">
              {(product.discount > 0 || hasDiscount) && !isOutOfStock && (
                <span className="text-sm text-gray-400 dark:text-gray-500 line-through leading-none mb-1">
                  {originalPrice.toLocaleString('fa-IR')} تومان
                </span>
              )}
              {isOutOfStock ? (
                <span className="text-xl font-bold text-gray-500 dark:text-gray-400 leading-none">
                  اتمام موجودی
                </span>
              ) : (
                <span className={`text-xl font-bold leading-none ${hasDiscount ? 'text-rose-600 dark:text-rose-400' : 'text-purple-600 dark:text-purple-400'}`}>
                  {finalPrice.toLocaleString('fa-IR')} تومان
                </span>
              )}
            </div>
            {!isOutOfStock && <AddToCartQuick product={product} variants={product.variants || []} />}
          </div>
        </div>
      </div>
    </Link>
  );
}
