"use client";

import { useState, useTransition } from "react";
import { ExternalLink, ShieldCheck, User, Star } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminReplyToReview } from "@/actions/reviews";

type ReviewData = {
  id: string;
  comment: string | null;
  rating: number;
  createdAt: string;
  adminReply: string | null;
  adminReplyAt: string | null;
  user: { name: string | null };
  product: { id: string; name: string; slug: string };
};

export function ReviewList({ initialReviews }: { initialReviews: ReviewData[] }) {
  const [isPending, startTransition] = useTransition();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    if (replyText.length < 3) return;

    startTransition(async () => {
      const res = await adminReplyToReview(reviewId, replyText);
      if (res.success) {
        toast.success("پاسخ شما ثبت شد.");
        setReplyText("");
        setReplyingTo(null);
      } else {
        toast.error(res.error || "خطا در ثبت پاسخ");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {initialReviews.map((r) => (
        <div key={r.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link href={`/products/${r.product.slug}#interaction`} target="_blank" className="text-sm text-fuchsia-600 hover:text-fuchsia-500 font-bold flex items-center gap-1 mb-2">
                محصول: {r.product.name}
                <ExternalLink className="w-3 h-3" />
              </Link>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  <User className="w-4 h-4 text-gray-500" />
                  {r.user.name || "کاربر"}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">
                  {new Date(r.createdAt).toLocaleDateString("fa-IR")}
                </span>
                <div className="flex items-center mr-2" dir="ltr">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-3 h-3 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed font-medium">
                {r.comment || "بدون متن"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setReplyingTo(replyingTo === r.id ? null : r.id);
                  setReplyText(r.adminReply || "");
                }}
                className="text-xs bg-gray-900 hover:bg-gray-800 dark:bg-white/10 dark:hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                {r.adminReply ? "ویرایش پاسخ" : "پاسخ دادن"}
              </button>
            </div>
          </div>

          {/* Reply Form */}
          {replyingTo === r.id && (
            <form onSubmit={(e) => handleReplySubmit(e, r.id)} className="mt-4 mb-4 bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10">
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 mb-3 resize-none"
                placeholder="پاسخ ادمین..."
                required
                minLength={3}
              ></textarea>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReplyingTo(null)} className="px-3 py-1.5 text-sm text-gray-500">انصراف</button>
                <button type="submit" disabled={isPending || replyText.length < 3} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50">
                  ثبت پاسخ
                </button>
              </div>
            </form>
          )}

          {/* Admin Reply Display */}
          {r.adminReply && replyingTo !== r.id && (
            <div className="mt-4 border-t border-gray-100 dark:border-white/5 pt-4 flex flex-col gap-3">
              <div className="p-4 rounded-xl flex justify-between items-start bg-fuchsia-50/50 dark:bg-fuchsia-500/10 border border-fuchsia-100 dark:border-fuchsia-500/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold flex items-center gap-1 text-fuchsia-600 dark:text-fuchsia-400">
                      <ShieldCheck className="w-3 h-3" />
                      پاسخ فروشگاه
                    </span>
                    {r.adminReplyAt && (
                      <span className="text-[10px] text-gray-400">{new Date(r.adminReplyAt).toLocaleDateString("fa-IR")}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{r.adminReply}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {initialReviews.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
          <p className="text-gray-500 dark:text-gray-400">هیچ نظری یافت نشد.</p>
        </div>
      )}
    </div>
  );
}
