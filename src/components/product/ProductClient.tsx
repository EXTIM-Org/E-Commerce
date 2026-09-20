"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Check, ShieldCheck, Truck, Star } from "lucide-react";
import { useCart } from "@/store/CartContext";

interface Variant {
  id: string;
  name: string | null;
  sku: string;
  price: number | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    discount: number;
    images: readonly string[] | string[];
    variants?: Variant[];
    category?: Category | null;
    reviews?: { rating: number }[];
  };
}

export function ProductClient({ product }: ProductClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);

  const basePrice = selectedVariant?.price ?? product.basePrice;
  const finalPrice = basePrice - product.discount;

  const reviewCount = product.reviews?.length || 0;
  const averageRating = reviewCount > 0 
    ? product.reviews!.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount
    : 0;

  const handleAddToCart = () => {
    addToCart({
      id: selectedVariant ? selectedVariant.id : product.id,
      productId: product.id,
      variantId: selectedVariant ? selectedVariant.id : product.id,
      name: product.name,
      variantName: selectedVariant ? selectedVariant.name : null,
      price: finalPrice,
      image: product.images[0] || '',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">
      
      {/* Right Column: Images */}
      <div className="flex flex-col gap-4">
        {/* Main Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-4">
          {product.images[selectedImage] ? (
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-500">
              بدون تصویر
            </div>
          )}
          
          {product.discount > 0 && (
            <div className="absolute top-6 right-6 rounded-full bg-pink-600/90 px-4 py-2 text-sm font-bold text-white shadow-[0_0_20px_rgba(219,39,119,0.5)] backdrop-blur-md">
              فروش ویژه
            </div>
          )}
        </div>
        
        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx ? "border-purple-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`تصویر ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Left Column: Product Details */}
      <div className="flex flex-col gap-6 pt-4">
        
        {/* Breadcrumb / Category */}
        <div className="text-purple-400 text-sm font-medium tracking-wide">
          {product.category?.name || 'دسته‌بندی نشده'}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {product.name}
        </h1>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center" dir="ltr">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                className={`w-4 h-4 ${s <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`} 
              />
            ))}
          </div>
          <span className="text-sm font-bold text-yellow-400">{averageRating > 0 ? averageRating.toFixed(1) : ""}</span>
          <button 
            onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })} 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            ({reviewCount} دیدگاه)
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> موجود در انبار</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-blue-500" /> تضمین اصالت کالا</span>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg my-2">
          {product.description}
        </p>

        {/* Variants Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            <h3 className="text-gray-900 dark:text-white font-medium">انتخاب مدل / سایز:</h3>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-5 py-2.5 rounded-xl border font-medium transition-all ${
                    selectedVariant?.id === variant.id
                      ? "bg-purple-100 dark:bg-purple-600/20 border-purple-500 text-purple-700 dark:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                      : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-white/10 to-transparent my-6"></div>

        {/* Pricing & Add to Cart */}
        <div className="flex flex-col gap-6 bg-white dark:bg-white/5 rounded-3xl p-8 border border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-sm dark:shadow-xl">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              {product.discount > 0 && (
                <span className="text-gray-400 dark:text-gray-500 line-through text-lg">
                  {basePrice.toLocaleString('fa-IR')} تومان
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-500">
                  {finalPrice.toLocaleString('fa-IR')}
                </span>
                <span className="text-xl text-gray-500 dark:text-gray-400 font-medium">تومان</span>
              </div>
            </div>
            {product.discount > 0 && (
              <div className="bg-pink-600/20 text-pink-400 px-3 py-1 rounded-lg text-sm font-bold border border-pink-500/30">
                {(product.discount / basePrice * 100).toFixed(0)}% تخفیف
              </div>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all active:scale-[0.98]"
          >
            <ShoppingCart className="w-6 h-6" />
            افزودن به سبد خرید
          </button>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-2">
            <Truck className="w-4 h-4" />
            ارسال رایگان برای سفارش‌های بالای ۲ میلیون تومان
          </div>
        </div>
        
      </div>
    </div>
  );
}
