"use client";

import { useState, useActionState, useEffect } from "react";
import { addAddress } from "@/actions/address";
import { Plus, X } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 mt-2"
    >
      {pending ? "در حال ثبت..." : "ذخیره آدرس"}
    </button>
  );
}

export function NewAddressForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(addAddress, null);

  // Close modal on success
  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(false);
    }
  }, [state]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        افزودن آدرس جدید
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md relative shadow-xl dark:shadow-2xl">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 left-4 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">ثبت آدرس جدید</h2>
            
            <form action={formAction} className="flex flex-col gap-4">
              
              {state?.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {state.error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">عنوان آدرس (اختیاری - مثلا خانه)</label>
                <input 
                  type="text" 
                  name="title"
                  className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  placeholder="منزل"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">آدرس دقیق پستی</label>
                <textarea 
                  name="fullAddress"
                  required
                  rows={3}
                  className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="تهران، خیابان..."
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">کد پستی (اختیاری)</label>
                <input 
                  type="text" 
                  name="postalCode"
                  dir="ltr"
                  className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 text-left"
                  placeholder="1234567890"
                />
              </div>

              <SubmitButton />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
