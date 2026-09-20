"use client";

import { useRef } from "react";
import { ProductCard } from "./ProductCard";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface ProductCarouselProps {
  title: string;
  products: any[];
  userWishlistIds?: Set<string>;
}

export function ProductCarousel({ title, products, userWishlistIds = new Set() }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "right" ? 300 : -300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="my-12 relative w-full">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white relative inline-block">
          {title}
          <div className="absolute -bottom-2 right-0 w-1/2 h-1 bg-gradient-to-l from-purple-600 to-transparent dark:from-purple-500 rounded-full" />
        </h2>
        
        <div className="flex gap-2">
          <button 
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:border-purple-500/50 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button 
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:border-purple-500/50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden w-full px-2 py-4">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map(product => (
            <div key={product.id} className="min-w-[280px] max-w-[280px] snap-start flex-shrink-0">
              <ProductCard 
                product={product} 
                initialIsLiked={userWishlistIds.has(product.id)}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Hide scrollbar CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  );
}
