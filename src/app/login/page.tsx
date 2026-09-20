"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginUser } from "@/actions/auth";
import { ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? "در حال ورود..." : "ورود به حساب کاربری"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginUser, null);

  return (
    <main className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-md bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-xl dark:shadow-2xl relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8">
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm font-medium">بازگشت به فروشگاه</span>
        </Link>
        
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">خوش آمدید!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">برای دسترسی به سبد خرید و پیگیری سفارشات وارد شوید.</p>
        
        <form action={formAction} className="flex flex-col gap-5">
          
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">ایمیل</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input 
                type="email" 
                id="email" 
                name="email"
                required
                dir="ltr"
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pr-10 pl-4 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-left"
                placeholder="name@example.com"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">رمز عبور</label>
              <Link href="/forgot-password" className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">فراموشی رمز؟</Link>
            </div>
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
          
          <div className="mt-2">
            <SubmitButton />
          </div>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          حساب کاربری ندارید؟{' '}
          <Link href="/register" className="text-violet-600 dark:text-violet-400 font-bold hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </main>
  );
}
