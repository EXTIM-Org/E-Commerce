"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/actions/wishlist";
import toast from "react-hot-toast";

interface WishlistButtonProps {
  productId: string;
  initialIsLiked: boolean;
  className?: string;
}

export function WishlistButton({ productId, initialIsLiked, className = "" }: WishlistButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI update
    setIsLiked(!isLiked);

    startTransition(async () => {
      const result = await toggleWishlist(productId);
      
      if (result.error) {
        // Revert on error
        setIsLiked(isLiked);
        toast.error(result.error);
      } else if (result.success) {
        setIsLiked(result.isLiked || false);
        if (result.isLiked) {
          toast.success("به علاقه‌مندی‌ها اضافه شد ❤️", {
            icon: '❤️',
            style: {
              background: '#333',
              color: '#fff',
            }
          });
        } else {
          toast("از علاقه‌مندی‌ها حذف شد", {
            icon: '💔',
            style: {
              background: '#333',
              color: '#fff',
            }
          });
        }
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border transition-all ${
        isLiked 
          ? "bg-rose-500/20 border-rose-500/50 text-rose-500" 
          : "bg-black/30 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
      } ${isPending ? "opacity-50 cursor-not-allowed" : "hover:scale-110 active:scale-95"} ${className}`}
      title={isLiked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
    >
      <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2} />
    </button>
  );
}
