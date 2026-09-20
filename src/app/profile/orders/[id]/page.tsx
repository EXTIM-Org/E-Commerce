import { getSession } from "@/lib/session";
import { db } from "@/prisma/db";
import { notFound, redirect } from "next/navigation";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ProfileOrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const params = await props.params;
  const orderId = params.id;

  const order = await db.orm.public.Order.where({ id: orderId, userId: session.userId as string })
    .include("items", (i) => i.include("variant", (v) => v.include("product")))
    .first();

  if (!order) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/profile/orders" className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">جزئیات سفارش #{order.id.split('-')[0]}</h1>
      </div>

      <OrderTimeline status={order.status} trackingCode={order.trackingCode} />

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">تاریخ ثبت سفارش</span>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                <Clock className="w-4 h-4 text-violet-500" />
                {new Date(order.createdAt).toLocaleDateString('fa-IR')}
              </div>
            </div>
            
            <div className="w-px h-8 bg-gray-200 dark:bg-white/10 hidden md:block" />
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">مبلغ کل پرداخت شده</span>
              <div className="text-gray-900 dark:text-white font-bold text-lg">
                {order.totalAmount.toLocaleString('fa-IR')} <span className="text-sm font-normal">تومان</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-200 dark:border-white/5">
          <MapPin className="w-6 h-6 flex-shrink-0 text-violet-500 mt-0.5" />
          <div className="flex flex-col gap-2">
            <span className="text-gray-900 dark:text-gray-200 font-bold text-base">گیرنده: {order.receiverName}</span>
            <div className="flex items-center gap-4 flex-wrap">
              <span>شماره تماس: {order.phone}</span>
              {order.postalCode && <span>کد پستی: {order.postalCode}</span>}
            </div>
            <p className="leading-relaxed text-gray-600 dark:text-gray-400 mt-1">{order.shippingAddress}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">اقلام سفارش</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/5">
                <div className="w-20 h-20 bg-white dark:bg-black/20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/5 relative">
                  <img 
                    src={item.variant?.product?.images[0] || "https://picsum.photos/seed/placeholder/100"} 
                    alt={item.variant?.product?.name || "Product"} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-gray-900 dark:text-white font-medium truncate text-base">{item.variant?.product?.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {item.variant?.name !== "Default" ? item.variant?.name : "بدون تنوع"}
                  </span>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-violet-600 dark:text-violet-400">{item.unitPrice.toLocaleString('fa-IR')} تومان</span>
                    <span className="text-sm bg-gray-200 dark:bg-white/10 px-3 py-1 rounded-lg text-gray-700 dark:text-gray-300">
                      {item.quantity} عدد
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
