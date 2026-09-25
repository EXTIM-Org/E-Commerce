"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { submitTicketFeedback } from "@/actions/ticket";

export function TicketFeedbackForm({ ticketId, existingFeedback }: { ticketId: string, existingFeedback?: any }) {
  const [isLike, setIsLike] = useState<boolean | null>(existingFeedback?.isLike ?? null);
  const [rating, setRating] = useState<number>(existingFeedback?.rating || 0);
  const [comment, setComment] = useState(existingFeedback?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(!!existingFeedback);
  const [hoverRating, setHoverRating] = useState(0);

  if (isSuccess && existingFeedback) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-2xl mt-6">
        <h3 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2">بازخورد شما ثبت شده است</h3>
        <p className="text-emerald-600 dark:text-emerald-500 text-sm">از اینکه نظر خود را با ما در میان گذاشتید سپاسگزاریم.</p>
        <div className="flex gap-4 mt-4">
          {existingFeedback.isLike !== null && (
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              {existingFeedback.isLike ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
            </div>
          )}
          {existingFeedback.rating && (
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: existingFeedback.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
          )}
        </div>
        {existingFeedback.comment && (
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-black/5 dark:border-white/5">
            {existingFeedback.comment}
          </p>
        )}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLike === null && rating === 0 && !comment.trim()) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    if (isLike !== null) formData.append("isLike", String(isLike));
    if (rating > 0) formData.append("rating", String(rating));
    if (comment.trim()) formData.append("comment", comment);
    
    const res = await submitTicketFeedback(ticketId, formData);
    setIsSubmitting(false);
    if (res.success) {
      setIsSuccess(true);
    }
  };

  if (isSuccess && !existingFeedback) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-2xl mt-6 text-center">
        <h3 className="font-bold text-emerald-800 dark:text-emerald-400">بازخورد شما با موفقیت ثبت شد</h3>
        <p className="text-emerald-600 dark:text-emerald-500 text-sm mt-1">از اینکه برای بهبود خدمات ما وقت گذاشتید سپاسگزاریم.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 p-6 rounded-2xl mt-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">نظرسنجی پشتیبانی</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">از عملکرد پشتیبانی در این تیکت رضایت داشتید؟</p>
      
      <div className="flex flex-wrap gap-8 mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsLike(true)}
            className={`p-3 rounded-xl border transition-all ${isLike === true ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'border-black/10 dark:border-white/10 text-gray-400 hover:border-emerald-500 hover:text-emerald-500'}`}
          >
            <ThumbsUp className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => setIsLike(false)}
            className={`p-3 rounded-xl border transition-all ${isLike === false ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600' : 'border-black/10 dark:border-white/10 text-gray-400 hover:border-red-500 hover:text-red-500'}`}
          >
            <ThumbsDown className="w-6 h-6" />
          </button>
        </div>

        <div className="h-12 w-px bg-black/10 dark:bg-white/10 hidden sm:block"></div>

        <div className="flex items-center flex-row-reverse gap-1" dir="ltr" onMouseLeave={() => setHoverRating(0)}>
          {[5, 4, 3, 2, 1].map((star) => {
            const currentRating = hoverRating || rating;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                className={`p-1 transition-colors ${currentRating >= star ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}`}
              >
                <Star className={`w-8 h-8 ${currentRating >= star ? 'fill-current' : ''}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">توضیحات تکمیلی (اختیاری)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="اگر پیشنهاد یا انتقادی دارید بنویسید..."
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || (isLike === null && rating === 0 && !comment.trim())}
        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
      >
        {isSubmitting ? "در حال ثبت..." : "ثبت بازخورد"}
      </button>
    </form>
  );
}
