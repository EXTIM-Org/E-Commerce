import Link from 'next/link';
import Image from 'next/image';
import { AddToCartQuick } from './AddToCartQuick';
import { WishlistButton } from './WishlistButton';

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
  };
  initialIsLiked?: boolean;
}

export function ProductCard({ product, initialIsLiked = false }: ProductCardProps) {
  const finalPrice = product.basePrice - product.discount;
  
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(147,51,234,0.1)] dark:hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] shadow-sm dark:shadow-none">
        
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
          {product.discount > 0 && (
            <div className="absolute top-4 right-4 rounded-full bg-purple-600/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md">
              تخفیف ویژه
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
            <div className="flex flex-col">
              {product.discount > 0 && (
                <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                  {product.basePrice.toLocaleString('fa-IR')} تومان
                </span>
              )}
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {finalPrice.toLocaleString('fa-IR')} تومان
              </span>
            </div>
            <AddToCartQuick product={product} variants={product.variants || []} />
          </div>
        </div>
      </div>
    </Link>
  );
}
