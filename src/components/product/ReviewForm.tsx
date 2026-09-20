"use client";

import { useState, useTransition } from "react";
import { Star, MessageSquare } from "lucide-react";
import { submitReview } from "@/actions/reviews";
import toast from "react-hot-toast";
import Link from "next/link";

export function ReviewForm({ productId, isLoggedIn }: { productId: string, isLoggedIn: boolean }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center shadow-sm dark:shadow-none">
        <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500/50 mb-2" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">ثبت نظر برای این محصول</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">برای ثبت امتیاز و نظر خود، لطفاً ابتدا وارد حساب کاربری شوید.</p>
        <Link href={`/login?callbackUrl=/products/${productId}`} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md dark:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
          ورود به حساب کاربری
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("لطفاً یک امتیاز بین ۱ تا ۵ ستاره انتخاب کنید.");
      return;
    }

    startTransition(async () => {
      const result = await submitReview(productId, rating, comment);
      if (result.success) {
        toast.success("نظر شما با موفقیت ثبت شد!");
        setRating(0);
        setComment("");
      } else {
        toast.error(result.error || "خطا در ثبت نظر");
      }
    });
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-md shadow-sm dark:shadow-none">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-fuchsia-500 dark:text-fuchsia-400" />
        ثبت نظر جدید
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Rating Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">امتیاز شما به این محصول</label>
          <div className="flex items-center gap-1" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star 
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating) 
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" 
                      : "text-gray-300 dark:text-gray-600"
                  }`} 
                />
              </button>
            ))}
            <span className="ml-4 text-sm font-bold text-gray-600 dark:text-gray-400 w-20 text-right" dir="rtl">
              {rating === 1 && "خیلی ضعیف"}
              {rating === 2 && "ضعیف"}
              {rating === 3 && "متوسط"}
              {rating === 4 && "خوب"}
              {rating === 5 && "عالی"}
            </span>
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">متن نظر (اختیاری)</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all resize-none"
            placeholder="تجربه خرید یا استفاده از این محصول را بنویسید..."
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full sm:w-auto self-end bg-gray-900 hover:bg-gray-800 dark:bg-white/10 dark:hover:bg-white/20 border border-transparent dark:border-white/10 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              در حال ثبت...
            </>
          ) : (
            "ثبت نظر"
          )}
        </button>
      </form>
    </div>
  );
}
