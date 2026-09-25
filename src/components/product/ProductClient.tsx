"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Check, ShieldCheck, Truck, Star } from "lucide-react";
import { useCart } from "@/store/CartContext";
import { WishlistButton } from "@/components/product/WishlistButton";
import { FlashSaleCountdown } from "@/components/product/FlashSaleCountdown";
import { getEffectivePrice } from "@/lib/price";

const COLOR_DICTIONARY: Record<string, string> = {
  "مشکی": "#111111",
  "سفید": "#f9fafb",
  "قرمز": "#ef4444",
  "آبی": "#3b82f6",
  "سبز": "#22c55e",
  "زرد": "#eab308",
  "صورتی": "#ec4899",
  "بنفش": "#a855f7",
  "نارنجی": "#f97316",
  "خاکستری": "#6b7280",
  "نقره‌ای": "#cbd5e1",
  "طلایی": "#fbbf24",
  "تیتانیوم": "#878681",
  "تیتانیوم مشکی": "#3b3b3b",
  "تیتانیوم طبیعی": "#b6b5b0",
  "تیتانیوم آبی": "#4c5564",
  "سرمه‌ای": "#1e3a8a",
  "قهوه‌ای": "#78350f"
};

interface Variant {
  id: string;
  name: string | null;
  sku: string;
  price: number | null;
  inventory?: { stockQuantity: number; lowStockThreshold: number } | null;
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
    flashSale?: {
      isActive: boolean;
      startTime: string | Date;
      endTime: string | Date;
      discountPercent: number;
    } | null;
  };
  initialIsLiked?: boolean;
}

export function ProductClient({ product, initialIsLiked }: ProductClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);

  // Parse variants
  const colors = Array.from(new Set(
    product.variants?.flatMap(v => 
      v.name?.split(" - ").map(p => p.trim()).filter(p => COLOR_DICTIONARY[p]) || []
    )
  ));
  
  const sizes = Array.from(new Set(
    product.variants?.flatMap(v => 
      v.name?.split(" - ").map(p => p.trim()).filter(p => !COLOR_DICTIONARY[p] && p !== "پیش‌فرض") || []
    )
  ));

  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] || null);

  // Update selected variant when color/size changes
  if (colors.length > 0 || sizes.length > 0) {
    const matched = product.variants?.find(v => {
      if (!v.name) return false;
      const parts = v.name.split(" - ").map(p => p.trim());
      const matchC = colors.length > 0 ? parts.includes(selectedColor!) : true;
      const matchS = sizes.length > 0 ? parts.includes(selectedSize!) : true;
      return matchC && matchS;
    });
    
    if (matched && matched.id !== selectedVariant?.id) {
      setSelectedVariant(matched);
    }
  }

  const basePriceForCalculation = selectedVariant?.price ?? product.basePrice;
  const { originalPrice, finalPrice, hasDiscount, discountPercent } = getEffectivePrice(basePriceForCalculation, product.discount, product.flashSale);

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

  const currentStock = selectedVariant?.inventory?.stockQuantity ?? 0;
  const isOutOfStock = product.variants && product.variants.length > 0 && currentStock === 0;
  const isLowStock = !isOutOfStock && currentStock > 0 && currentStock <= (selectedVariant?.inventory?.lowStockThreshold ?? 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">
      
      {/* Right Column: Images */}
      <div className="flex flex-col gap-4">
        {/* Main Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-4">
          <WishlistButton productId={product.id} initialIsLiked={initialIsLiked || false} />
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
          
          {(product.discount > 0 || hasDiscount) && (
            <div className={`absolute top-6 right-6 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-md ${hasDiscount ? 'bg-rose-600/90 shadow-[0_0_20px_rgba(225,29,72,0.5)]' : 'bg-pink-600/90 shadow-[0_0_20px_rgba(219,39,119,0.5)]'}`}>
              {hasDiscount ? `%${discountPercent}- شگفت‌انگیز` : 'فروش ویژه'}
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
        <div className="flex items-center justify-between">
          <div className="text-purple-400 text-sm font-medium tracking-wide">
            {product.category?.name || 'دسته‌بندی نشده'}
          </div>
          {hasDiscount && product.flashSale && (
            <FlashSaleCountdown endTime={product.flashSale.endTime} />
          )}
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
            onClick={() => document.getElementById('interaction')?.scrollIntoView({ behavior: 'smooth' })} 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            ({reviewCount} دیدگاه)
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          {isOutOfStock ? (
            <span className="flex items-center gap-1 text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full border border-red-200 dark:border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> ناموجود
            </span>
          ) : isLowStock ? (
            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-500/20">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> تنها {currentStock} عدد باقی مانده!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full border border-green-200 dark:border-green-500/20">
              <Check className="w-4 h-4" /> موجود در انبار
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-blue-500" /> تضمین اصالت کالا
          </span>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg my-2">
          {product.description}
        </p>

        {/* Advanced Variants Selection */}
        {(colors.length > 0 || sizes.length > 0) ? (
          <div className="flex flex-col gap-6 mt-4">
            
            {/* Colors */}
            {colors.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-900 dark:text-white font-medium">رنگ:</h3>
                  <span className="text-gray-500 text-sm">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? "ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900 scale-110" 
                            : "ring-1 ring-black/10 dark:ring-white/10 hover:scale-105"
                        }`}
                        style={{ backgroundColor: COLOR_DICTIONARY[color] || "#ccc" }}
                      >
                        {isSelected && (
                          <Check className={`w-5 h-5 ${
                            color === 'سفید' || color === 'نقره‌ای' ? 'text-black' : 'text-white'
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes / Storage */}
            {sizes.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-gray-900 dark:text-white font-medium">سایز / مدل:</h3>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    
                    // Check if this size is available for the currently selected color
                    const isAvailable = product.variants?.some(v => {
                      if (!v.name) return false;
                      const parts = v.name.split(" - ").map(p => p.trim());
                      const hasColor = colors.length > 0 ? parts.includes(selectedColor!) : true;
                      return hasColor && parts.includes(size);
                    });

                    return (
                      <button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-2.5 rounded-xl border font-medium transition-all ${
                          !isAvailable
                            ? "opacity-40 cursor-not-allowed bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-400"
                            : isSelected
                              ? "bg-purple-100 dark:bg-purple-600/20 border-purple-500 text-purple-700 dark:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                              : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {(!selectedVariant && (colors.length > 0 || sizes.length > 0)) && (
               <p className="text-red-500 text-sm">ترکیب انتخاب شده موجود نیست. لطفاً گزینه دیگری را انتخاب کنید.</p>
            )}
            
          </div>
        ) : (
          product.variants && product.variants.length > 0 && product.variants[0].name !== "پیش‌فرض" && (
            <div className="flex flex-col gap-3 mt-4">
              <h3 className="text-gray-900 dark:text-white font-medium">انتخاب مدل:</h3>
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
          )
        )}

        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-white/10 to-transparent my-6"></div>

        {/* Pricing & Add to Cart */}
        <div className="flex flex-col gap-6 bg-white dark:bg-white/5 rounded-3xl p-8 border border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-sm dark:shadow-xl">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              {(product.discount > 0 || hasDiscount) && (
                <span className="text-gray-400 dark:text-gray-500 line-through text-lg">
                  {originalPrice.toLocaleString('fa-IR')} تومان
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${hasDiscount ? 'from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-500' : 'from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-500'}`}>
                  {finalPrice.toLocaleString('fa-IR')}
                </span>
                <span className="text-xl text-gray-500 dark:text-gray-400 font-medium">تومان</span>
              </div>
            </div>
            {(!hasDiscount && product.discount > 0) && (
              <div className="bg-pink-600/20 text-pink-400 px-3 py-1 rounded-lg text-sm font-bold border border-pink-500/30">
                {(product.discount / originalPrice * 100).toFixed(0)}% تخفیف
              </div>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || isOutOfStock}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all active:scale-[0.98]"
          >
            <ShoppingCart className="w-6 h-6" />
            {!selectedVariant ? "ترکیب نامعتبر" : isOutOfStock ? "ناموجود در انبار" : "افزودن به سبد خرید"}
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
