import { getUserById } from "@/actions/users";
import { getSession } from "@/lib/session";
import { canManageRoles } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, User, ShoppingBag, MessageSquare, Star, MapPin, Smartphone, Mail, Calendar, CreditCard, Clock, CheckCircle2, XCircle, ShoppingCart, PackageX } from "lucide-react";
import { UserRoleForm } from "../UserRoleForm";
import { UserCrmControls } from "@/components/admin/UserCrmControls";
import { e2p } from "@/lib/persian";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return {
    title: `پروفایل کاربر ${params.id.substring(0, 8)} - پنل ادمین`,
  };
}

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  PAID: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  PROCESSING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  SHIPPED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  DELIVERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  RETURNED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const statusLabels: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت شده",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELLED: "لغو شده",
  RETURNED: "مرجوع شده",
};

export default async function UserProfilePage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  
  if (!session || !canManageRoles(session.role as string)) {
    redirect("/admin");
  }

  const params = await props.params;
  const user = await getUserById(params.id);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-2" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">کاربر یافت نشد</h2>
        <Link href="/admin/users" className="text-violet-600 dark:text-violet-400 hover:underline">بازگشت به لیست کاربران</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* Header section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/users" className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">پروفایل کاربری</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">مشاهده اطلاعات، سفارشات و تاریخچه کاربر در یک نگاه</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user.role !== "SUPER_ADMIN" ? (
             <UserRoleForm userId={user.id} currentRole={user.role as any} />
          ) : (
            <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-4 py-2 rounded-xl text-sm font-medium">سوپر ادمین (غیرقابل تغییر)</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Identity Card */}
        <div className="lg:col-span-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl backdrop-blur-md p-6">
          <div className="flex flex-col items-center text-center pb-6 border-b border-black/10 dark:border-white/10">
            {user.image ? (
              <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl shadow-fuchsia-500/20 mb-4 border-2 border-white dark:border-gray-800">
                <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl shadow-fuchsia-500/20 mb-4">
                {user.name ? user.name.charAt(0) : <User />}
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{user.name || "کاربر ناشناس"}</h2>
            <span className="text-gray-500 dark:text-gray-400 text-sm dir-ltr">{user.email || "بدون ایمیل"}</span>
          </div>
          
          <div className="pt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="p-2 bg-black/5 dark:bg-white/10 rounded-lg"><Smartphone className="w-4 h-4" /></div>
              <span className="dir-ltr flex-1 text-right">{user.phoneNumber ? e2p(user.phoneNumber) : "ثبت نشده"}</span>
              {user.phoneNumber && (
                user.phoneVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="p-2 bg-black/5 dark:bg-white/10 rounded-lg"><Calendar className="w-4 h-4" /></div>
              <span>عضویت: {new Date(user.createdAt).toLocaleDateString("fa-IR")}</span>
            </div>
          </div>
          
          {/* CRM Controls */}
          <UserCrmControls user={user} />
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors"></div>
            <ShoppingBag className="w-6 h-6 text-blue-500 mb-3" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{e2p(user.stats.ordersCount)}</span>
            <Link 
              href={`/admin/orders?q=${encodeURIComponent(user.email || user.phoneNumber || user.name || "")}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline w-fit"
            >
              کل سفارشات
            </Link>
          </div>
          
          <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-fuchsia-500/10 rounded-full blur-xl group-hover:bg-fuchsia-500/20 transition-colors"></div>
            <Star className="w-6 h-6 text-fuchsia-500 mb-3" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{e2p(user.stats.reviewsCount)}</span>
            <Link 
              href={`/admin/reviews?q=${encodeURIComponent(user.email || user.phoneNumber || user.name || "")}`}
              className="text-sm text-fuchsia-600 dark:text-fuchsia-400 hover:underline w-fit"
            >
              نظرات ثبت شده
            </Link>
          </div>

          <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors"></div>
            <CreditCard className="w-6 h-6 text-emerald-500 mb-3" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user.stats.totalSpent.toLocaleString('fa-IR')}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">مجموع خرید (تومان)</span>
          </div>

          <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-colors"></div>
            <MessageSquare className="w-6 h-6 text-amber-500 mb-3" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{e2p(user.stats.ticketsCount)}</span>
            <Link 
              href={`/admin/tickets?q=${encodeURIComponent(user.email || user.phoneNumber || user.name || "")}`}
              className="text-sm text-amber-600 dark:text-amber-400 hover:underline w-fit"
            >
              تیکت‌های پشتیبانی
            </Link>
          </div>
          
          <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-colors"></div>
            <PackageX className="w-6 h-6 text-rose-500 mb-3" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{e2p(user.stats.returnedItemsCount ?? 0)}</span>
            <Link 
              href={`/admin/returns?q=${encodeURIComponent(user.email || user.phoneNumber || user.name || "")}`}
              className="text-sm text-rose-600 dark:text-rose-400 hover:underline w-fit"
            >
              کل کالاهای مرجوع شده
            </Link>
          </div>

          <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-colors"></div>
            <XCircle className="w-6 h-6 text-red-500 mb-3" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{e2p(user.stats.cancelledOrdersCount ?? 0)}</span>
            <Link 
              href={`/admin/orders?status=CANCELLED&q=${encodeURIComponent(user.email || user.phoneNumber || user.name || "")}`}
              className="text-sm text-red-600 dark:text-red-400 hover:underline w-fit"
            >
              کل سفارشات لغو شده
            </Link>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl backdrop-blur-md overflow-hidden flex flex-col">
          <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-violet-500" />
              آخرین سفارشات
            </h3>
            <Link href={`/admin/orders?q=${encodeURIComponent(user.email || user.phoneNumber || user.name || "")}`} className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
              همه سفارشات
            </Link>
          </div>
          <div className="divide-y divide-black/5 dark:divide-white/5 flex-1">
            {user.orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <ShoppingBag className="w-8 h-8 opacity-20 mb-2" />
                <span>سفارشی یافت نشد</span>
              </div>
            ) : (
              user.orders.map(order => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  <div>
                    <div className="text-sm text-gray-500 dir-ltr text-left mb-1">#{order.id.substring(0, 8).toUpperCase()}</div>
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-violet-500 transition-colors">{order.totalAmount.toLocaleString('fa-IR')} تومان</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("fa-IR")}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl backdrop-blur-md overflow-hidden flex flex-col">
          <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              تیکت‌های اخیر
            </h3>
            <Link href={`/admin/tickets?q=${encodeURIComponent(user.email || user.phoneNumber || user.name || "")}`} className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
              همه تیکت‌ها
            </Link>
          </div>
          <div className="divide-y divide-black/5 dark:divide-white/5 flex-1">
            {user.tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <MessageSquare className="w-8 h-8 opacity-20 mb-2" />
                <span>تیکتی یافت نشد</span>
              </div>
            ) : (
              user.tickets.map(ticket => (
                <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`} className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  <div className="max-w-[70%]">
                    <div className="font-medium text-gray-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">{ticket.subject}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span>بخش {ticket.department === 'SALES' ? 'فروش' : ticket.department === 'SUPPORT' ? 'پشتیبانی' : 'فنی'}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString("fa-IR")}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      ticket.status === 'IN_PROGRESS' || ticket.status === 'SEEN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      ticket.status === 'WAITING_FOR_USER' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {ticket.status === 'OPEN' ? 'باز' :
                       ticket.status === 'SEEN' ? 'دیده شده' :
                       ticket.status === 'IN_PROGRESS' ? 'در حال بررسی' :
                       ticket.status === 'WAITING_FOR_USER' ? 'منتظر پاسخ کاربر' :
                       ticket.status === 'RESOLVED' ? 'حل شده' : 'بسته شده'}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Addresses and Cart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abandoned Cart Section */}
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl backdrop-blur-md overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-black/10 dark:border-white/10">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-fuchsia-500" />
              سبد خرید کاربر
            </h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {!user.cart || user.cart.items.length === 0 ? (
              <div className="text-center text-gray-500 py-8 flex flex-col items-center">
                <ShoppingCart className="w-8 h-8 opacity-20 mb-2" />
                <span>سبد خرید کاربر خالی است.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-fuchsia-50 dark:bg-fuchsia-900/10 text-fuchsia-600 dark:text-fuchsia-400 p-3 rounded-xl text-sm font-medium">
                  <span>وضعیت: رها شده</span>
                  <span>آخرین بروزرسانی: {new Date(user.cart.updatedAt).toLocaleDateString("fa-IR")}</span>
                </div>
                <div className="divide-y divide-black/5 dark:divide-white/5">
                  {user.cart.items.map((item: any) => (
                    <div key={item.id} className="py-3 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{item.variant?.product?.name || "محصول نامشخص"}</span>
                        {item.variant?.name && item.variant.name !== "Default" && (
                          <span className="text-xs text-gray-500 mt-0.5">{item.variant.name}</span>
                        )}
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300">
                        {e2p(item.quantity)} عدد
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Addresses Section */}
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl backdrop-blur-md overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-black/10 dark:border-white/10">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              آدرس‌های ثبت شده
            </h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {user.addresses.length === 0 ? (
              <div className="text-center text-gray-500 py-8 flex flex-col items-center">
                <MapPin className="w-8 h-8 opacity-20 mb-2" />
                <span>هیچ آدرسی ثبت نشده است.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {user.addresses.map((address: any) => (
                  <div key={address.id} className="p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 relative">
                    {address.isDefault && (
                      <span className="absolute top-4 left-4 bg-violet-500 text-white text-[10px] px-2 py-0.5 rounded-full">پیش‌فرض</span>
                    )}
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{address.title || "آدرس"}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">{address.fullAddress}</p>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{address.city}، {address.province}</span>
                      {address.postalCode && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                          <span className="dir-ltr">{e2p(address.postalCode)}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
