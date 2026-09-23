"use client";

import { useState, useActionState, useEffect } from "react";
import { updateProfile } from "@/actions/profile";
import { Mail, Calendar, Shield, User, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

interface UserProfile {
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  joinDate: string;
}

export function ProfileForm({ user }: { user: UserProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  useEffect(() => {
    if (state?.success && isEditing) {
      toast.success("اطلاعات با موفقیت بروزرسانی شد");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditing(false);
    } else if (state?.error && isEditing && !isPending) {
      toast.error(state.error);
    }
  }, [state, isEditing, isPending]);

  return (
    <form action={formAction} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-sm dark:shadow-none">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-400 flex items-center gap-2"><User className="w-4 h-4" /> نام و نام خانوادگی</span>
          {isEditing ? (
            <input 
              name="name" 
              defaultValue={user.name || ""} 
              required
              className="bg-gray-50 dark:bg-black/20 border border-purple-500/50 p-4 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          ) : (
            <div className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-900 dark:text-white font-medium">
              {user.name || 'ثبت نشده'}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-400 flex items-center gap-2"><Mail className="w-4 h-4" /> ایمیل</span>
          <div className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-500 dark:text-gray-400 font-medium" dir="ltr">
            {user.email || 'ثبت نشده'}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> 
            شماره موبایل
          </span>
          {isEditing ? (
            <input 
              name="phoneNumber" 
              defaultValue={user.phoneNumber || ""} 
              dir="ltr"
              placeholder="09123456789"
              className="bg-gray-50 dark:bg-black/20 border border-purple-500/50 p-4 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-left"
            />
          ) : (
            <div className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-900 dark:text-white font-medium" dir="ltr">
              {user.phoneNumber || 'ثبت نشده'}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> تاریخ عضویت</span>
          <div className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-500 dark:text-gray-400 font-medium">
            {user.joinDate}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-400 flex items-center gap-2"><Shield className="w-4 h-4" /> وضعیت اکانت</span>
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-4 rounded-xl text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
            <Check className="w-5 h-5" />
            تایید شده و فعال
          </div>
        </div>
        
      </div>
      
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3">
        {isEditing ? (
          <>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              انصراف
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            >
              {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
              ذخیره تغییرات
            </button>
          </>
        ) : (
          <button 
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            ویرایش مشخصات
          </button>
        )}
      </div>
      
    </form>
  );
}
