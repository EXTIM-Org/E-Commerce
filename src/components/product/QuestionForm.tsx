"use client";

import { useState, useTransition } from "react";
import { HelpCircle } from "lucide-react";
import { askQuestion } from "@/actions/qa";
import toast from "react-hot-toast";
import Link from "next/link";

export function QuestionForm({ productId, isLoggedIn }: { productId: string, isLoggedIn: boolean }) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center shadow-sm dark:shadow-none">
        <HelpCircle className="w-12 h-12 text-gray-400 dark:text-gray-500/50 mb-2" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">پرسش درباره این محصول</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">برای ثبت پرسش، لطفاً ابتدا وارد حساب کاربری شوید.</p>
        <Link href={`/login?callbackUrl=/products/${productId}`} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md dark:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
          ورود به حساب کاربری
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.length < 3) {
      toast.error("متن پرسش باید حداقل ۳ کاراکتر باشد.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("text", text);
      
      const result = await askQuestion(formData);
      if (result.success) {
        toast.success("پرسش شما با موفقیت ثبت شد!");
        setText("");
      } else {
        toast.error(result.error || "خطا در ثبت پرسش");
      }
    });
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-md shadow-sm dark:shadow-none mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-fuchsia-500 dark:text-fuchsia-400" />
        پرسش خود را درباره این محصول مطرح کنید
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all resize-none"
            placeholder="پرسش خود را بنویسید..."
            required
            minLength={3}
            maxLength={1000}
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isPending || text.length < 3}
          className="w-full sm:w-auto self-end bg-gray-900 hover:bg-gray-800 dark:bg-white/10 dark:hover:bg-white/20 border border-transparent dark:border-white/10 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              در حال ثبت...
            </>
          ) : (
            "ثبت پرسش"
          )}
        </button>
      </form>
    </div>
  );
}
