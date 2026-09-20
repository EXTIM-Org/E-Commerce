"use client";

import { useState, useTransition } from "react";
import { Trash2, ExternalLink, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { deleteQuestion, answerQuestion, deleteAnswer } from "@/actions/qa";

type QAData = {
  id: string;
  text: string;
  createdAt: string;
  user: { name: string | null };
  product: { id: string; name: string; slug: string };
  answers: {
    id: string;
    text: string;
    createdAt: string;
    isAdmin: boolean;
    user: { name: string | null };
  }[];
};

export function QAList({ initialQuestions }: { initialQuestions: QAData[] }) {
  const [isPending, startTransition] = useTransition();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleDeleteQuestion = (id: string) => {
    if (!confirm("آیا از حذف این پرسش مطمئن هستید؟ تمام پاسخ‌های آن نیز حذف خواهند شد.")) return;
    
    startTransition(async () => {
      const res = await deleteQuestion(id);
      if (res.success) {
        toast.success("پرسش با موفقیت حذف شد.");
      } else {
        toast.error(res.error || "خطا در حذف پرسش");
      }
    });
  };
  
  const handleDeleteAnswer = (id: string) => {
    if (!confirm("آیا از حذف این پاسخ مطمئن هستید؟")) return;
    
    startTransition(async () => {
      const res = await deleteAnswer(id);
      if (res.success) {
        toast.success("پاسخ با موفقیت حذف شد.");
      } else {
        toast.error(res.error || "خطا در حذف پاسخ");
      }
    });
  };

  const handleReplySubmit = (e: React.FormEvent, questionId: string) => {
    e.preventDefault();
    if (replyText.length < 3) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("questionId", questionId);
      formData.append("text", replyText);

      const res = await answerQuestion(formData);
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
      {initialQuestions.map((q) => (
        <div key={q.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link href={`/products/${q.product.slug}#qa`} target="_blank" className="text-sm text-fuchsia-600 hover:text-fuchsia-500 font-bold flex items-center gap-1 mb-2">
                محصول: {q.product.name}
                <ExternalLink className="w-3 h-3" />
              </Link>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  <User className="w-4 h-4 text-gray-500" />
                  {q.user.name || "کاربر"}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">
                  {new Date(q.createdAt).toLocaleDateString("fa-IR")}
                </span>
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed font-medium">
                پرسش: {q.text}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setReplyingTo(replyingTo === q.id ? null : q.id)}
                className="text-xs bg-gray-900 hover:bg-gray-800 dark:bg-white/10 dark:hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                پاسخ دادن
              </button>
              <button 
                onClick={() => handleDeleteQuestion(q.id)}
                disabled={isPending}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                title="حذف پرسش"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reply Form */}
          {replyingTo === q.id && (
            <form onSubmit={(e) => handleReplySubmit(e, q.id)} className="mt-4 mb-4 bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10">
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
                  ارسال پاسخ
                </button>
              </div>
            </form>
          )}

          {/* Answers */}
          {q.answers.length > 0 && (
            <div className="mt-4 border-t border-gray-100 dark:border-white/5 pt-4 flex flex-col gap-3">
              {q.answers.map((a) => (
                <div key={a.id} className={`p-4 rounded-xl flex justify-between items-start ${a.isAdmin ? 'bg-fuchsia-50/50 dark:bg-fuchsia-500/10 border border-fuchsia-100 dark:border-fuchsia-500/20' : 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold flex items-center gap-1 ${a.isAdmin ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {a.isAdmin ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {a.isAdmin ? "پاسخ فروشگاه" : (a.user.name || "کاربر")}
                      </span>
                      <span className="text-[10px] text-gray-400">{new Date(a.createdAt).toLocaleDateString("fa-IR")}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{a.text}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteAnswer(a.id)}
                    disabled={isPending}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                    title="حذف پاسخ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {initialQuestions.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
          <p className="text-gray-500 dark:text-gray-400">هیچ پرسشی یافت نشد.</p>
        </div>
      )}
    </div>
  );
}
