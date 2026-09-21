"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, Star, ThumbsUp, ThumbsDown, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { toggleReviewLike } from "@/actions/reviews";

type ReviewVote = {
  isLike: boolean;
  userId: string;
};

type ReviewType = {
  id: string;
  comment: string | null;
  rating: number;
  isVerifiedBuyer: boolean;
  purchasedVariantName: string | null;
  createdAt: string;
  adminReply: string | null;
  adminReplyAt: string | null;
  user: { name: string | null };
  votes: ReviewVote[];
};

interface ReviewItemProps {
  review: ReviewType;
  currentUserId?: string | null;
}

export function ReviewItem({ review, currentUserId }: ReviewItemProps) {
  const [isPending, startTransition] = useTransition();

  const userVote = currentUserId 
    ? review.votes?.find(v => v.userId === currentUserId)
    : undefined;
    
  const initialLikeStatus = userVote ? (userVote.isLike ? "LIKE" : "DISLIKE") : "NONE";
  
  const initialLikesCount = review.votes?.filter(v => v.isLike).length || 0;
  const initialDislikesCount = review.votes?.filter(v => !v.isLike).length || 0;

  const [likeStatus, setLikeStatus] = useState<"LIKE" | "DISLIKE" | "NONE">(initialLikeStatus);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [dislikesCount, setDislikesCount] = useState(initialDislikesCount);

  const handleVote = (isLike: boolean) => {
    if (!currentUserId) {
      toast.error("برای ثبت بازخورد ابتدا وارد حساب کاربری شوید.");
      return;
    }
    
    // Optimistic Update
    const newStatus = isLike ? "LIKE" : "DISLIKE";
    
    if (likeStatus === newStatus) {
      // Toggle off
      setLikeStatus("NONE");
      if (isLike) setLikesCount(p => p - 1);
      else setDislikesCount(p => p - 1);
    } else {
      // Switch or new vote
      if (likeStatus === "LIKE") setLikesCount(p => p - 1);
      if (likeStatus === "DISLIKE") setDislikesCount(p => p - 1);
      
      setLikeStatus(newStatus);
      if (isLike) setLikesCount(p => p + 1);
      else setDislikesCount(p => p + 1);
    }

    startTransition(async () => {
      const res = await toggleReviewLike(review.id, isLike);
      if (!res.success) {
        toast.error(res.error || "خطا در ثبت بازخورد");
        // Revert on error
        setLikeStatus(initialLikeStatus);
        setLikesCount(initialLikesCount);
        setDislikesCount(initialDislikesCount);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm dark:shadow-none backdrop-blur-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-white">{review.user?.name || "کاربر ناشناس"}</span>
            {review.isVerifiedBuyer && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                <BadgeCheck className="w-3 h-3" />
                خریدار این محصول
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString("fa-IR")}
            </span>
            {review.isVerifiedBuyer && review.purchasedVariantName && review.purchasedVariantName !== "Default" && (
              <span className="text-xs text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600 pr-2">
                {review.purchasedVariantName}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center" dir="ltr">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star 
              key={s} 
              className={`w-4 h-4 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} 
            />
          ))}
        </div>
      </div>
      
      {review.comment && (
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mt-2">{review.comment}</p>
      )}

      {/* Admin Reply */}
      {review.adminReply && (
        <div className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold flex items-center gap-1 text-fuchsia-600 dark:text-fuchsia-400">
              <ShieldCheck className="w-3 h-3" />
              پاسخ فروشگاه
            </span>
            {review.adminReplyAt && (
              <span className="text-[10px] text-gray-400">{new Date(review.adminReplyAt).toLocaleDateString("fa-IR")}</span>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{review.adminReply}</p>
        </div>
      )}

      {/* Interaction Buttons */}
      <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
        <span className="text-xs text-gray-500">آیا این نظر برایتان مفید بود؟</span>
        <button 
          onClick={() => handleVote(true)}
          disabled={isPending}
          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
            likeStatus === "LIKE" 
              ? "text-green-600 bg-green-500/10" 
              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${likeStatus === "LIKE" ? "fill-current" : ""}`} />
          {likesCount}
        </button>
        <button 
          onClick={() => handleVote(false)}
          disabled={isPending}
          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
            likeStatus === "DISLIKE" 
              ? "text-red-600 bg-red-500/10" 
              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
        >
          <ThumbsDown className={`w-3.5 h-3.5 ${likeStatus === "DISLIKE" ? "fill-current" : ""}`} />
          {dislikesCount}
        </button>
      </div>
    </div>
  );
}
