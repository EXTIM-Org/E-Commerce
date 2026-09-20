"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { resetPassword } from "@/actions/auth";
import { ArrowRight, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? "در حال تغییر رمز..." : "تغییر رمز عبور"}
    </button>
  );
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [state, formAction] = useActionState(resetPassword, null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (state?.success) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state?.success, router]);

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md bg-white dark:bg-white/5 border border-red-200 dark:border-red-500/20 rounded-3xl p-8 backdrop-blur-xl text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لینک نامعتبر</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">توکن بازیابی در آدرس وجود ندارد.</p>
          <Link href="/forgot-password" className="text-violet-600 font-medium hover:underline">
            درخواست مجدد لینک بازیابی
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-md bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-xl dark:shadow-2xl relative z-10">
        
        {state?.success ? (
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">رمز عبور تغییر کرد</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              شما در {countdown} ثانیه به صفحه ورود هدایت می‌شوید...
            </p>
            <Link href="/login" className="text-violet-600 font-medium hover:underline">
              ورود به حساب کاربری
            </Link>
          </div>
        ) : (
          <>
            <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8">
              <ArrowRight className="w-4 h-4" />
              <span className="text-sm font-medium">بازگشت به ورود</span>
            </Link>
            
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">تغییر رمز عبور</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">لطفاً رمز عبور جدید خود را وارد کنید.</p>
            
            <form action={formAction} className="flex flex-col gap-5">
              <input type="hidden" name="token" value={token} />
              
              {state?.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">رمز عبور جدید</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input 
                    type="password" 
                    id="password" 
                    name="password"
                    required
                    dir="ltr"
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pr-10 pl-4 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-left"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">تکرار رمز عبور جدید</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword"
                    required
                    dir="ltr"
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pr-10 pl-4 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-left"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="mt-2">
                <SubmitButton />
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
