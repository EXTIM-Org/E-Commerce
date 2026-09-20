"use client";

import { useState } from "react";
import { Plus, X, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/store/CartContext";

interface Variant {
  id: string;
  name: string | null;
  price: number | null;
  inventory?: { stockQuantity: number } | null;
}

interface AddToCartQuickProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    discount: number;
    images: readonly string[] | string[];
  };
  variants: Variant[];
}

export function AddToCartQuick({ product, variants }: AddToCartQuickProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const { addToCart } = useCart();
  
  // A product is considered "simple" if it only has 1 variant (or 0 variants which is impossible in our schema, but just in case)
  // and its name is Default or null, or we just treat 1 variant as simple.
  const isSimpleProduct = variants.length <= 1;
  const hasInStockVariants = variants.some(v => (v.inventory?.stockQuantity || 0) > 0);

  const finalPrice = product.basePrice - product.discount;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasInStockVariants) {
      alert("این محصول در حال حاضر ناموجود است.");
      return;
    }

    if (isSimpleProduct) {
      // Add directly
      const variant = variants[0];
      const price = variant?.price ? variant.price - product.discount : finalPrice;
      
      addToCart({
        id: variant ? variant.id : product.id,
        productId: product.id,
        variantId: variant ? variant.id : product.id,
        name: product.name,
        variantName: variant?.name || null,
        price: price,
        image: product.images[0] || '',
      });
      
      // Optional visual feedback can be added here
    } else {
      // Open modal
      setSelectedVariant(variants.find(v => (v.inventory?.stockQuantity || 0) > 0) || variants[0]);
      setIsOpen(true);
    }
  };

  const handleModalAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedVariant) return;

    const price = selectedVariant.price ? selectedVariant.price - product.discount : finalPrice;

    addToCart({
      id: selectedVariant.id,
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.name,
      price: price,
      image: product.images[0] || '',
    });
    
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={handleQuickAdd}
        className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform hover:scale-110 active:scale-95 ${
          hasInStockVariants ? "bg-purple-600 hover:bg-purple-500" : "bg-gray-600 cursor-not-allowed opacity-50"
        }`}
        title={hasInStockVariants ? "افزودن سریع به سبد خرید" : "ناموجود"}
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Quick View Modal */}
      {isOpen && !isSimpleProduct && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div 
            className="bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm relative shadow-xl dark:shadow-2xl"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="absolute top-4 left-4 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 ml-8 pr-2">انتخاب متغیر محصول</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 pr-2">{product.name}</p>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">لطفا یک گزینه را انتخاب کنید:</label>
                <div className="flex flex-wrap gap-2">
                  {variants.map(variant => {
                    const stock = variant.inventory?.stockQuantity || 0;
                    const inStock = stock > 0;
                    
                    return (
                      <button
                        key={variant.id}
                        disabled={!inStock}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedVariant(variant);
                        }}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                          selectedVariant?.id === variant.id
                            ? "bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-600/20 dark:text-purple-300"
                            : inStock 
                              ? "bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-500/50 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10" 
                              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-black/20 dark:border-white/5 dark:text-gray-600"
                        }`}
                      >
                        {selectedVariant?.id === variant.id && <Check className="w-4 h-4" />}
                        {variant.name || "ساده"}
                        {!inStock && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded ml-2">ناموجود</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {((selectedVariant?.price || product.basePrice) - product.discount).toLocaleString("fa-IR")} تومان
                </span>
                
                <button
                  onClick={handleModalAdd}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  افزودن به سبد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
