"use client";

import { useState } from "react";

export default function SentryTestPage() {
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const triggerClientError = () => {
    setErrorStatus("Triggering Client Error...");
    throw new Error("Sentry Test Error (Client-Side)");
  };

  const triggerServerError = async () => {
    setErrorStatus("Triggering Server Error...");
    try {
      await fetch("/api/sentry-test-api");
      setErrorStatus("Server error triggered! Check your terminal or Sentry dashboard.");
    } catch (e) {
      setErrorStatus("Failed to call API.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 p-8">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 border border-gray-100 dark:border-zinc-700">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
          تست Sentry
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          با کلیک روی دکمه‌های زیر، یک خطای عمدی ایجاد می‌شود تا اتصال شما به داشبورد Sentry بررسی گردد.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={triggerClientError}
            className="w-full px-6 py-3 rounded-full bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 font-medium transition-colors shadow-sm"
          >
            تولید خطای کلاینت (مرورگر)
          </button>
          
          <button
            onClick={triggerServerError}
            className="w-full px-6 py-3 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 dark:text-violet-400 font-medium transition-colors shadow-sm"
          >
            تولید خطای سرور (API Route)
          </button>
        </div>

        {errorStatus && (
          <div className="p-4 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-sm font-medium animate-in fade-in zoom-in duration-300">
            {errorStatus}
          </div>
        )}
      </div>
    </div>
  );
}
