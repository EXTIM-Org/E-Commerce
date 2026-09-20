"use client";

import { useState, useTransition } from "react";
import { CornerDownLeft } from "lucide-react";
import { answerQuestion } from "@/actions/qa";
import toast from "react-hot-toast";

export function AnswerForm({ questionId, isLoggedIn }: { questionId: string, isLoggedIn: boolean }) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  if (!isLoggedIn) {
    return null; // Don't show reply button for guests, they can't reply anyway.
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.length < 3) {
      toast.error("متن پاسخ باید حداقل ۳ کاراکتر باشد.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("questionId", questionId);
      formData.append("text", text);
      
      const result = await answerQuestion(formData);
      if (result.success) {
        toast.success("پاسخ شما با موفقیت ثبت شد!");
        setText("");
        setIsOpen(false); // Close the form on success
      } else {
        toast.error(result.error || "خطا در ثبت پاسخ");
      }
    });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-3 text-sm flex items-center gap-1 text-gray-500 hover:text-fuchsia-500 transition-colors"
      >
        <CornerDownLeft className="w-4 h-4" />
        پاسخ به این پرسش
      </button>
    );
  }

  return (
    <div className="mt-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all resize-none"
          placeholder="پاسخ خود را بنویسید..."
          required
          minLength={3}
          maxLength={1000}
        ></textarea>

        <div className="flex gap-2 justify-end">
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            انصراف
          </button>
          <button 
            type="submit" 
            disabled={isPending || text.length < 3}
            className="bg-gray-900 hover:bg-gray-800 dark:bg-white/10 dark:hover:bg-white/20 border border-transparent dark:border-white/10 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "ثبت پاسخ"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
