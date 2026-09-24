import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { AdminOrderControls } from "@/components/admin/AdminOrderControls";
import { MapPin, Clock, ArrowRight, User } from "lucide-react";
import { canManageStore } from "@/lib/permissions";
import Link from "next/link";

export default async function AdminOrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canManageStore(session.role as string)) {
    redirect("/login");
  }

  const params = await props.params;
  const orderId = params.id;

  const order = await db.orm.public.Order.where({ id: orderId })
    .include("user")
    .include("items", (i) => i.include("variant", (v) => v.include("product")).include("returnRequest"))
    .first();

  if (!order) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/orders" className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مدیریت سفارش #{order.id.split('-')[0]}</h1>
      </div>

      <OrderTimeline status={order.status} trackingCode={order.trackingCode} />

      <AdminOrderControls 
        orderId={order.id} 
        currentStatus={order.status} 
        trackingCode={order.trackingCode} 
      />

      <div className="bg-white dark:bg-black/10 border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/10 dark:border-white/10 pb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">تاریخ ثبت سفارش</span>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                <Clock className="w-4 h-4 text-violet-500" />
                {new Date(order.createdAt).toLocaleDateString('fa-IR')}
              </div>
            </div>
            
            <div className="w-px h-8 bg-black/10 dark:bg-white/10 hidden md:block" />
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">مبلغ کل سفارش</span>
              <div className="text-gray-900 dark:text-white font-bold text-lg">
                {order.totalAmount.toLocaleString('fa-IR')} <span className="text-sm font-normal">تومان</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-4 text-sm text-gray-600 dark:text-gray-400 bg-black/5 dark:bg-black/20 p-5 rounded-2xl border border-black/10 dark:border-white/5">
            <User className="w-6 h-6 flex-shrink-0 text-violet-500 mt-0.5" />
            <div className="flex flex-col gap-2">
              <span className="text-gray-900 dark:text-gray-200 font-bold text-base">اطلاعات کاربری (خریدار)</span>
              <span>نام: {order.user?.name || "بدون نام"}</span>
              <span>ایمیل: {order.user?.email}</span>
            </div>
          </div>

          <div className="flex items-start gap-4 text-sm text-gray-600 dark:text-gray-400 bg-black/5 dark:bg-black/20 p-5 rounded-2xl border border-black/10 dark:border-white/5">
            <MapPin className="w-6 h-6 flex-shrink-0 text-violet-500 mt-0.5" />
            <div className="flex flex-col gap-2">
              <span className="text-gray-900 dark:text-gray-200 font-bold text-base">اطلاعات پستی (گیرنده)</span>
              <div className="flex flex-col gap-1">
                <span>گیرنده: {order.receiverName}</span>
                <span>شماره تماس: {order.phone}</span>
                {order.postalCode && <span>کد پستی: {order.postalCode}</span>}
              </div>
              <p className="leading-relaxed mt-1 border-t border-black/5 dark:border-white/5 pt-2">{order.shippingAddress}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 mt-2">اقلام سفارش</h3>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden">
                {item.returnRequest?.status === 'REFUNDED' && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                    مرجوع شده
                  </div>
                )}
                
                <div className={`w-16 h-16 bg-white dark:bg-black/20 rounded-xl overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/5 relative ${item.returnRequest?.status === 'REFUNDED' ? 'opacity-50 grayscale' : ''}`}>
                  <img 
                    src={item.variant?.product?.images[0] || "https://picsum.photos/seed/placeholder/100"} 
                    alt={item.variant?.product?.name || "Product"} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`flex flex-col flex-1 ${item.returnRequest?.status === 'REFUNDED' ? 'opacity-60' : ''}`}>
                  <span className="text-gray-900 dark:text-white font-medium text-base">{item.variant?.product?.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.variant?.name !== "Default" ? item.variant?.name : "بدون تنوع"} | SKU: {item.variant?.sku}
                  </span>
                </div>
                <div className={`flex flex-col items-end gap-1 ${item.returnRequest?.status === 'REFUNDED' ? 'opacity-60 line-through decoration-red-500' : ''}`}>
                  <span className="font-bold text-gray-900 dark:text-white">{item.unitPrice.toLocaleString('fa-IR')} تومان</span>
                  <span className="text-sm bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-md text-gray-700 dark:text-gray-300">
                    {item.quantity} عدد
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
