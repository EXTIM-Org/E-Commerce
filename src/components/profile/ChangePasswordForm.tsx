"use client";

import { useState, useActionState, useEffect } from "react";
import { changePassword } from "@/actions/profile";
import { KeyRound, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success("رمز عبور با موفقیت تغییر یافت");
      setIsFormVisible(false);
      // Reset form
      const form = document.getElementById("change-password-form") as HTMLFormElement;
      if (form) form.reset();
    } else if (state?.error && !isPending) {
      toast.error(state.error);
    }
  }, [state, isPending]);

  if (!isFormVisible) {
    return (
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm mt-6 flex justify-between items-center shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">تغییر رمز عبور</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">برای حفظ امنیت، رمز عبور خود را به صورت دوره‌ای تغییر دهید</p>
          </div>
        </div>
        <button 
          onClick={() => setIsFormVisible(true)}
          className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          تغییر رمز
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm mt-6 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
        <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="font-bold text-gray-900 dark:text-white">تغییر رمز عبور</h3>
      </div>
      
      <form id="change-password-form" action={formAction} className="flex flex-col gap-5 max-w-md">
        
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">رمز عبور فعلی</label>
          <input 
            type="password" 
            name="currentPassword" 
            required
            className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-left"
            dir="ltr"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">رمز عبور جدید</label>
          <input 
            type="password" 
            name="newPassword" 
            required
            minLength={6}
            className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-left"
            dir="ltr"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">تکرار رمز عبور جدید</label>
          <input 
            type="password" 
            name="confirmPassword" 
            required
            minLength={6}
            className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-left"
            dir="ltr"
          />
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button 
            type="button" 
            onClick={() => setIsFormVisible(false)}
            className="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            انصراف
          </button>
          <button 
            type="submit" 
            disabled={isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            بروزرسانی رمز عبور
          </button>
        </div>
      </form>
    </div>
  );
}
