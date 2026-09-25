import { db } from "@/prisma/db";
import { or } from "@prisma/orm-postgres/orm-client";
import { PackageOpen, MapPin, Clock, Eye, ChevronLeft } from "lucide-react";
import { StatusUpdater } from "@/components/admin/StatusUpdater";
import Link from "next/link";
import { AdminOrdersFilter } from "@/components/admin/AdminOrdersFilter";
import { Pagination } from "@/components/ui/Pagination";

export default async function AdminOrdersPage(props: { searchParams: Promise<{ user?: string, q?: string, status?: string, page?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q?.toLowerCase();
  const status = searchParams.status;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = db.orm.public.Order
    .include("user")
    .include("items", (i) => i.include("variant", (v) => v.include("product")).include("returnRequest"));
    
  if (status) {
    query = query.where({ status: status as any }) as typeof query;
  }

  if (q) {
    const matchingUserIds = (await db.orm.public.User
      .where(u => or(u.name.ilike(`%${q}%`), u.email.ilike(`%${q}%`), u.phoneNumber.ilike(`%${q}%`)))
      .select("id")
      .all()).map(u => u.id);

    query = query.where((o) => {
      const baseCond = or(
        o.id.ilike(`%${q}%`),
        o.receiverName.ilike(`%${q}%`),
        o.phone.ilike(`%${q}%`)
      );
      if (matchingUserIds.length > 0) {
        return or(baseCond, o.userId.in(matchingUserIds));
      }
      return baseCond;
    });
  }

  const agg = await query.aggregate(a => ({ total: a.count() }));
  const totalCount = agg.total;
  const totalPages = Math.ceil(totalCount / limit);

  const orders = await query
    .orderBy((o) => o.createdAt.desc())
    .limit(limit)
    .offset(offset)
    .all();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مدیریت سفارشات</h1>
          <p className="text-gray-500 text-sm mt-1">تعداد کل سفارشات ثبت شده: {totalCount}</p>
        </div>
      </div>
      
      <AdminOrdersFilter />

      {orders.length === 0 ? (
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center gap-4 text-center">
          <PackageOpen className="w-20 h-20 text-gray-400 opacity-50 mb-2" />
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">سفارشی یافت نشد</h2>
          <p className="text-gray-500">تا این لحظه هیچ کاربری سفارشی ثبت نکرده است.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 flex flex-col gap-4 relative">
              
              {/* Header: ID, Date, Total, Status */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">شماره سفارش</span>
                    <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200 bg-black/10 dark:bg-white/10 px-2 py-1 rounded">
                      #{order.id.split('-')[0]}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">تاریخ ثبت</span>
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                      <Clock className="w-4 h-4 text-violet-500" />
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">مبلغ کل فاکتور</span>
                    <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
                      {order.totalAmount.toLocaleString('fa-IR')} تومان
                    </div>
                  </div>
                </div>

                {/* Status Updater Component & Details Link */}
                <div className="flex flex-col gap-2 min-w-[200px] shrink-0">
                  <span className="text-xs text-gray-500">وضعیت سفارش</span>
                  <StatusUpdater orderId={order.id} currentStatus={order.status} />
                  
                  <Link 
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-center gap-1.5 w-full mt-2 py-2 px-4 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/10 dark:hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-sm font-bold transition-colors border border-violet-500/20"
                  >
                    <Eye className="w-4 h-4" />
                    جزئیات سفارش
                    <ChevronLeft className="w-4 h-4 mr-auto" />
                  </Link>
                </div>
              </div>

              {/* Customer and Shipping Info */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      گیرنده: {order.receiverName}
                    </span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      موبایل: {order.phone}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      حساب کاربری: {order.user?.email}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
                    {order.shippingAddress} {order.postalCode && `(کد پستی: ${order.postalCode})`}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="mt-2">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 px-2">اقلام سفارش</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/5 relative overflow-hidden">
                      {item.returnRequest?.status === 'REFUNDED' && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10 shadow-sm">
                          مرجوع شده
                        </div>
                      )}
                      
                      <div className={`w-14 h-14 rounded-lg bg-black/5 dark:bg-black/30 overflow-hidden flex-shrink-0 ${item.returnRequest?.status === 'REFUNDED' ? 'opacity-50 grayscale' : ''}`}>
                        <img 
                          src={item.variant?.product?.images[0] || "https://picsum.photos/seed/placeholder/100"} 
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={`flex flex-col flex-1 overflow-hidden ${item.returnRequest?.status === 'REFUNDED' ? 'opacity-60' : ''}`}>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                          {item.variant?.product?.name}
                        </span>
                        <div className={`flex items-center justify-between mt-2 ${item.returnRequest?.status === 'REFUNDED' ? 'line-through decoration-red-500' : ''}`}>
                          <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                            {item.unitPrice.toLocaleString('fa-IR')} تومان
                          </span>
                          <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300 font-medium">
                            {item.quantity} عدد
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            limit={limit}
            buildHrefPattern={`?page=__PAGE__${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
}
