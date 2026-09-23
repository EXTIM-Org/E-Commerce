"use client";

import Link from "next/link";
import { useState, useActionState, useEffect } from "react";
import { checkIdentifier, sendOtp, verifyOtp, loginUser, registerUser, setPhonePassword } from "@/actions/auth";
import { ArrowRight, Lock, AlertCircle, KeyRound, Smartphone } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? "لطفا صبر کنید..." : label}
    </button>
  );
}

export default function LoginPage() {
  const [step, setStep] = useState<"IDENTIFIER" | "OTP" | "PASSWORD_LOGIN" | "PASSWORD_REGISTER" | "SET_PHONE_PASSWORD">("IDENTIFIER");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [timer, setTimer] = useState(120);

  // For server actions
  const [otpState, otpAction] = useActionState(verifyOtp, null);
  const [loginState, loginAction] = useActionState(loginUser, null);
  const [registerState, registerAction] = useActionState(registerUser, null);
  const [phonePasswordState, phonePasswordAction] = useActionState(setPhonePassword, null);

  useEffect(() => {
    let interval: any;
    if (step === "OTP" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    if (otpState?.success && otpState?.needsPassword) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep("SET_PHONE_PASSWORD");
    }
  }, [otpState]);

  const handleIdentifierSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    
    try {
      const res = await checkIdentifier(identifier);
      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }
      
      if (res.type === "PHONE") {
        if (res.exists && res.hasPassword) {
          setStep("PASSWORD_LOGIN");
        } else {
          // Send OTP
          const formData = new FormData();
          formData.append("phoneNumber", res.formatted!);
          const otpRes = await sendOtp(null, formData);
          
          if (otpRes?.error) {
            setErrorMsg(otpRes.error);
          } else {
            setIdentifier(res.formatted!); // Keep formatted
            setTimer(120);
            setStep("OTP");
          }
        }
      } else if (res.type === "EMAIL") {
        if (res.exists) {
          setStep("PASSWORD_LOGIN");
        } else {
          setStep("PASSWORD_REGISTER");
        }
      }
    } catch {
      setErrorMsg("خطایی رخ داد.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setErrorMsg("");
    setLoading(true);
    
    const formData = new FormData();
    formData.append("phoneNumber", identifier);
    const otpRes = await sendOtp(null, formData);
    
    if (otpRes?.error) {
      setErrorMsg(otpRes.error);
    } else {
      setTimer(120);
    }
    setLoading(false);
  };

  const handleSwitchToOtp = async () => {
    setErrorMsg("");
    setLoading(true);
    
    const formData = new FormData();
    formData.append("phoneNumber", identifier);
    const otpRes = await sendOtp(null, formData);
    
    if (otpRes?.error) {
      setErrorMsg(otpRes.error);
    } else {
      setTimer(120);
      setStep("OTP");
    }
    setLoading(false);
  };

  const currentError = errorMsg || otpState?.error || loginState?.error || registerState?.error || phonePasswordState?.error;

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
        
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
          {step === "IDENTIFIER" && "ورود / ثبت‌نام"}
          {step === "OTP" && "کد تایید"}
          {step === "PASSWORD_LOGIN" && "رمز عبور"}
          {step === "PASSWORD_REGISTER" && "ایجاد حساب کاربری"}
          {step === "SET_PHONE_PASSWORD" && "تنظیم رمز عبور"}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {step === "IDENTIFIER" && "شماره موبایل یا ایمیل خود را وارد کنید"}
          {step === "OTP" && `کد ۵ رقمی پیامک شده به ${identifier} را وارد کنید`}
          {step === "PASSWORD_LOGIN" && `رمز عبور برای ${identifier} را وارد کنید`}
          {step === "PASSWORD_REGISTER" && `ایمیل ${identifier} ثبت نشده است. برای ثبت‌نام رمز عبور تعیین کنید`}
          {step === "SET_PHONE_PASSWORD" && "برای ورود سریع‌تر در دفعات بعدی، لطفا یک رمز عبور تعیین کنید"}
        </p>
        
        {currentError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{currentError}</span>
          </div>
        )}

        {step === "IDENTIFIER" && (
          <form onSubmit={handleIdentifierSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">موبایل یا ایمیل</label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  dir="ltr"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-left"
                  placeholder="name@example.com یا 09123456789"
                />
              </div>
            </div>
            <div className="mt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "در حال بررسی..." : "ادامه"}
              </button>
            </div>
          </form>
        )}

        {step === "OTP" && (
          <form action={otpAction} className="flex flex-col gap-5">
            <input type="hidden" name="phoneNumber" value={identifier} />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">کد تایید</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <KeyRound className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input 
                  type="text" 
                  name="code"
                  required
                  maxLength={5}
                  dir="ltr"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pr-10 pl-4 text-center tracking-[0.5em] text-xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  placeholder="•••••"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <button 
                type="button" 
                onClick={() => { setStep("IDENTIFIER"); setErrorMsg(""); }}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                تغییر شماره
              </button>
              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={timer > 0 || loading}
                className={`font-medium ${timer > 0 ? "text-gray-400" : "text-violet-600 hover:text-violet-700"}`}
              >
                {timer > 0 ? `ارسال مجدد (${Math.floor(timer/60)}:${(timer%60).toString().padStart(2, '0')})` : "ارسال مجدد کد"}
              </button>
            </div>
            
            <div className="mt-2">
              <SubmitButton label="تایید و ورود" />
            </div>
          </form>
        )}

        {(step === "PASSWORD_LOGIN" || step === "PASSWORD_REGISTER") && (
          <form action={step === "PASSWORD_LOGIN" ? loginAction : registerAction} className="flex flex-col gap-5">
            <input type="hidden" name="email" value={identifier} />
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رمز عبور</label>
                {step === "PASSWORD_LOGIN" && (
                  <Link href="/forgot-password" className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">فراموشی رمز؟</Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input 
                  type="password" 
                  name="password"
                  required
                  dir="ltr"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pr-10 pl-4 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-left"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <button 
                type="button" 
                onClick={() => { setStep("IDENTIFIER"); setErrorMsg(""); }}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                تغییر حساب کاربری
              </button>
              
              {step === "PASSWORD_LOGIN" && /^09[0-9]{9}$/.test(identifier) && (
                <button 
                  type="button" 
                  onClick={handleSwitchToOtp}
                  disabled={loading}
                  className="flex items-center gap-1 text-violet-600 hover:text-violet-700 font-medium"
                >
                  ورود با رمز یک‌بار مصرف
                  <Smartphone className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="mt-2">
              <SubmitButton label={step === "PASSWORD_LOGIN" ? "ورود به حساب" : "ثبت‌نام"} />
            </div>
          </form>
        )}

        {step === "SET_PHONE_PASSWORD" && (
          <form action={phonePasswordAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رمز عبور جدید</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input 
                  type="password" 
                  name="password"
                  required
                  dir="ltr"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pr-10 pl-4 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-left"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">تکرار رمز عبور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input 
                  type="password" 
                  name="confirmPassword"
                  required
                  dir="ltr"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 pr-10 pl-4 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-left"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="mt-2">
              <SubmitButton label="ثبت رمز و ورود" />
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
