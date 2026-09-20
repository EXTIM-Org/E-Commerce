"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/store/CartContext";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, Check } from "lucide-react";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  const shippingCost = totalPrice > 2000000 ? 0 : 45000;
  const finalPayable = totalPrice + (totalItems > 0 ? shippingCost : 0);

  if (items.length === 0) {
    return (
      <main className="min-h-screen py-20 px-6">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6 mt-10">
          <div className="w-32 h-32 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center border border-gray-200 dark:border-white/10 mb-4 shadow-sm dark:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-400 dark:text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">سبد خرید شما خالی است</h1>
          <p className="text-gray-600 dark:text-gray-400">به نظر می‌رسد هنوز محصولی را برای خرید انتخاب نکرده‌اید.</p>
          <Link href="/products" className="mt-4 bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-[0_0_20px_rgba(147,51,234,0.4)]">
            بازگشت به فروشگاه
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">سبد خرید</h1>
          <span className="text-sm bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full font-medium">
            {totalItems} کالا
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm dark:shadow-none">
                
                {/* Item Image */}
                <div className="relative w-full sm:w-32 aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-black/20 flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">بدون تصویر</div>
                  )}
                </div>
                
                {/* Item Details */}
                <div className="flex flex-col flex-1 justify-between gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link href={`/products/${item.productId}`} className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      {item.variantName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          {item.variantName}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors p-2 bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                      title="حذف از سبد"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center gap-4 mt-auto">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/5 rounded-xl p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white disabled:opacity-30 transition-colors shadow-sm dark:shadow-none"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white transition-colors shadow-sm dark:shadow-none"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Item Price */}
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-300">
                      {(item.price * item.quantity).toLocaleString('fa-IR')} <span className="text-sm font-normal text-gray-500">تومان</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md flex flex-col gap-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">خلاصه سفارش</h2>
              
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-white/10 pb-6">
                <div className="flex justify-between items-center">
                  <span>مبلغ کالاها ({totalItems})</span>
                  <span className="font-medium text-gray-900 dark:text-white">{totalPrice.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>هزینه ارسال</span>
                  {shippingCost === 0 ? (
                    <span className="font-bold text-green-500 dark:text-green-400 flex items-center gap-1"><Check className="w-4 h-4" /> رایگان</span>
                  ) : (
                    <span className="font-medium text-gray-900 dark:text-white">{shippingCost.toLocaleString('fa-IR')} تومان</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-end pt-2">
                <span className="font-medium text-gray-700 dark:text-gray-300 text-lg">جمع کل فاکتور:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-500">
                    {finalPayable.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">تومان</span>
                </div>
              </div>
              
              <Link href="/checkout" className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all active:scale-[0.98]">
                تکمیل خرید و پرداخت
              </Link>

              <div className="flex flex-col gap-2 mt-4 text-xs text-gray-500">
                <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gray-400" /> پرداخت امن از درگاه‌های بانکی معتبر</p>
                <p className="flex items-center gap-2"><Truck className="w-4 h-4 text-gray-400" /> ارسال فوری برای سفارشات ثبت شده قبل از ساعت ۱۲</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
