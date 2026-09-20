"use client";

import { useCart } from "@/store/CartContext";
import { useActionState, useEffect } from "react";
import { processCheckout } from "@/actions/checkout";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, CreditCard, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? "در حال پردازش..." : "پرداخت و ثبت نهایی سفارش"}
    </button>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [state, formAction] = useActionState(processCheckout, null);
  const router = useRouter();

  const shippingCost = totalPrice > 2000000 ? 0 : 45000;
  const finalPayable = totalPrice + (totalItems > 0 ? shippingCost : 0);

  // If order is successful, clear cart and show success message
  useEffect(() => {
    if (state?.success) {
      clearCart();
    }
  }, [state?.success]);

  if (state?.success) {
    return (
      <main className="min-h-screen py-20 px-6 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">سفارش شما با موفقیت ثبت شد!</h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          کد رهگیری سفارش: <span className="font-mono text-white bg-white/10 px-2 py-1 rounded">{state.orderId}</span>
        </p>
        <Link href="/" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full transition-colors border border-white/10">
          بازگشت به صفحه اصلی
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">تکمیل اطلاعات و پرداخت</h1>
        </div>

        <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Address and Data */}
          <div className="flex flex-col gap-6">
            
            {state?.error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {state.error}
              </div>
            )}

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                اطلاعات گیرنده
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">نام و نام خانوادگی</label>
                  <input 
                    type="text" 
                    name="receiverName"
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="نام تحویل گیرنده"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">شماره همراه</label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    dir="ltr"
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-left"
                    placeholder="09123456789"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-300">آدرس دقیق</label>
                <textarea 
                  name="address"
                  required
                  rows={3}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                  placeholder="استان، شهر، خیابان، کوچه، پلاک، واحد..."
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">کد پستی (اختیاری)</label>
                <input 
                  type="text" 
                  name="postalCode"
                  dir="ltr"
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-left"
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                درگاه پرداخت
              </h2>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-4 border border-purple-500/50 bg-purple-500/10 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="text-purple-500 focus:ring-purple-500" />
                  <span className="text-white font-medium">پرداخت اینترنتی (زرین‌پال)</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-white/10 bg-black/20 rounded-xl cursor-pointer opacity-50">
                  <input type="radio" name="payment" disabled className="text-purple-500" />
                  <span className="text-gray-400 font-medium">پرداخت در محل (موقتاً غیرفعال)</span>
                </label>
              </div>
            </div>
            
            {/* Hidden field to pass cart items to server */}
            <input type="hidden" name="items" value={JSON.stringify(items)} />

          </div>

          {/* Right Column: Order Summary */}
          <div className="flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-sm flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white mb-2">فاکتور نهایی</h2>
              
              <div className="flex flex-col gap-3 text-sm text-gray-300 border-b border-white/10 pb-6">
                <div className="flex justify-between items-center">
                  <span>مبلغ کل ({totalItems} کالا)</span>
                  <span className="font-medium text-white">{totalPrice.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>هزینه بسته‌بندی و ارسال</span>
                  <span className="font-medium text-white">{shippingCost.toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end pt-2 mb-4">
                <span className="font-medium text-gray-300 text-lg">مبلغ قابل پرداخت:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                    {finalPayable.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-sm text-gray-400">تومان</span>
                </div>
              </div>
              
              <SubmitButton />
              
              <p className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-green-500/70" />
                تراکنش شما با پروتکل SSL کاملاً ایمن است
              </p>
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}
