import { getSession } from "@/lib/session";
import { db } from "@/prisma/db";
import { PackageOpen, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";

export default async function OrdersHistoryPage(props: { searchParams: Promise<{ page?: string }> }) {
  const session = await getSession();
  
  if (!session?.userId) return null;

  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = 5; // Smaller limit for user profile
  const offset = (page - 1) * limit;

  // Fetch orders from DB ordered by newest first
  // In Prisma 8 we use the `db.orm` client for these simple relation queries
  const query = db.orm.public.Order.where({ userId: session.userId as string })
    .include("items", (i) => i.include("variant", (v) => v.include("product")).include("returnRequest"));
    
  const agg = await query.aggregate(a => ({ total: a.count() }));
  const totalCount = agg.total;
  const totalPages = Math.ceil(totalCount / limit);

  const orders = await query
    .orderBy((f) => f.createdAt.desc())
    .limit(limit)
    .offset(offset)
    .all();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">تاریخچه سفارشات</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 shadow-sm dark:shadow-none">
          <PackageOpen className="w-20 h-20 text-gray-400 dark:text-gray-500/50" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-gray-300">هیچ سفارشی یافت نشد!</h2>
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">تا کنون هیچ خریدی از فروشگاه ما نداشته‌اید.</p>
          <Link href="/products" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-xl transition-colors">
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group shadow-sm dark:shadow-none">
                
                {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="bg-gray-100 dark:bg-black/30 px-3 py-1 rounded-lg border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 font-mono text-xs">
                          #{order.id.split('-')[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        مبلغ: <span className="font-bold text-gray-900 dark:text-white">{order.totalAmount.toLocaleString('fa-IR')} تومان</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <Link href={`/profile/orders/${order.id}`} className="text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 px-4 py-2 rounded-lg font-medium hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors">
                        جزئیات و رهگیری
                      </Link>
                    </div>
                  </div>
                
                {/* Receiver Info */}
                <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                  <MapPin className="w-5 h-5 flex-shrink-0 text-purple-500 dark:text-purple-400 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-900 dark:text-gray-300 font-medium">گیرنده: {order.receiverName} ({order.phone})</span>
                    <span>{order.shippingAddress}</span>
                    {order.postalCode && <span>کد پستی: {order.postalCode}</span>}
                  </div>
                </div>

                {/* Order Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative overflow-hidden">
                      {item.returnRequest?.status === 'REFUNDED' && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10 shadow-sm">
                          مرجوع شده
                        </div>
                      )}
                      <div className={`w-16 h-16 bg-gray-200 dark:bg-white/5 rounded-lg overflow-hidden flex-shrink-0 relative ${item.returnRequest?.status === 'REFUNDED' ? 'opacity-50 grayscale' : ''}`}>
                        <img 
                          src={item.variant?.product?.images[0] || "https://picsum.photos/seed/placeholder/100"} 
                          alt={item.variant?.product?.name || "Product"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={`flex flex-col flex-1 overflow-hidden ${item.returnRequest?.status === 'REFUNDED' ? 'opacity-60' : ''}`}>
                        <span className="text-gray-900 dark:text-white font-medium text-sm truncate">{item.variant?.product?.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.variant?.name !== "Default" ? item.variant?.name : "بدون تنوع"}</span>
                        <div className={`flex items-center justify-between mt-2 ${item.returnRequest?.status === 'REFUNDED' ? 'line-through decoration-red-500' : ''}`}>
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{item.unitPrice.toLocaleString('fa-IR')} تومان</span>
                          <span className="text-xs bg-gray-200 dark:bg-black/30 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">{item.quantity} عدد</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
          
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            limit={limit}
            buildHrefPattern="?page=__PAGE__"
            className="rounded-t-none"
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string, color: string }> = {
    'PENDING': { label: 'در انتظار پرداخت', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    'PAID': { label: 'پرداخت شده', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    'PROCESSING': { label: 'در حال پردازش', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    'SHIPPED': { label: 'ارسال شده', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    'DELIVERED': { label: 'تحویل داده شده', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    'CANCELLED': { label: 'لغو شده', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };

  const badge = statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };

  return (
    <div className={`px-3 py-1 rounded-full border text-xs font-bold ${badge.color}`}>
      {badge.label}
    </div>
  );
}
