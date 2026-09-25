import { db } from "@/prisma/db";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { getRevenueData, getTopProducts } from "@/actions/analytics";

// Lazy load heavy chart components (with disabled SSR to prevent hydration errors and reduce server load)
const RevenueChart = dynamic(() => import("@/components/admin/charts/RevenueChart").then((mod) => mod.RevenueChart), { 
  loading: () => <div className="animate-pulse h-[400px] w-full bg-black/5 dark:bg-white/5 rounded-3xl" /> 
});
const TopProductsChart = dynamic(() => import("@/components/admin/charts/TopProductsChart").then((mod) => mod.TopProductsChart), { 
  loading: () => <div className="animate-pulse h-[400px] w-full bg-black/5 dark:bg-white/5 rounded-3xl" /> 
});
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await getSession();
  if (session?.role === "BLOG_ADMIN") {
    redirect("/admin/blog");
  }
  
  if (session?.role === "SUPPORT") {
    redirect("/admin/messages");
  }

  // Fetch stats using Prisma 8
  const { count: productsCount } = await db.orm.public.Product.aggregate(a => ({ count: a.count() }));
  const { count: ordersCount } = await db.orm.public.Order.aggregate(a => ({ count: a.count() }));
  const { count: usersCount } = await db.orm.public.User.aggregate(a => ({ count: a.count() }));
  
  // Calculate real total revenue
  const revenueAgg = await db.orm.public.Order
    .where((o) => o.status.neq('CANCELLED'))
    .aggregate((a) => ({ total: a.sum('totalAmount') }));
    
  // Calculate refunded amount
  const refundedRequests = await db.orm.public.ReturnRequest
    .where((r) => r.status.eq('REFUNDED'))
    .include('orderItem')
    .all();
    
  const totalRefunded = refundedRequests.reduce((acc, req) => {
    if (req.orderItem) {
      return acc + (req.orderItem.unitPrice * req.orderItem.quantity);
    }
    return acc;
  }, 0);
  
  const totalRevenue = (revenueAgg.total ?? 0) - totalRefunded;
  
  // Fetch chart data
  const initialRevenueData = await getRevenueData(7);
  const topProductsData = await getTopProducts();

  // Get recent 5 orders
  const recentOrders = await db.orm.public.Order
    .include("user")
    .orderBy((o) => o.createdAt.desc())
    .all()
    .then(orders => orders.slice(0, 5)); // Taking first 5

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">داشبورد مدیریت</h1>
        <p className="text-gray-600 dark:text-gray-400">نمای کلی از وضعیت فروشگاه شما</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="کل محصولات" 
          value={productsCount} 
          icon={<Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />} 
          bg="bg-blue-500/10"
        />
        <StatCard 
          title="تعداد سفارشات" 
          value={ordersCount} 
          icon={<ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />} 
          bg="bg-green-500/10"
        />
        <StatCard 
          title="تعداد کاربران" 
          value={usersCount} 
          icon={<Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />} 
          bg="bg-purple-500/10"
        />
        <StatCard 
          title="درآمد کل" 
          value={(totalRevenue / 1000000).toLocaleString('fa-IR', { maximumFractionDigits: 1 }) + ' میلیون تومان'} 
          icon={<DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />} 
          bg="bg-amber-500/10"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart initialData={initialRevenueData} />
        </div>
        <div>
          <TopProductsChart data={topProductsData} />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">آخرین سفارشات</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            مشاهده همه
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-gray-600 dark:text-gray-400 border-b border-black/10 dark:border-white/10">
              <tr>
                <th className="pb-3 font-medium">شناسه سفارش</th>
                <th className="pb-3 font-medium">کاربر</th>
                <th className="pb-3 font-medium">مبلغ کل</th>
                <th className="pb-3 font-medium">وضعیت</th>
                <th className="pb-3 font-medium">تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-600 dark:text-gray-400">
                    هیچ سفارشی یافت نشد.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 text-gray-700 dark:text-gray-300 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                    <td className="py-4 text-gray-700 dark:text-gray-300">{order.receiverName}</td>
                    <td className="py-4 text-gray-900 dark:text-white font-medium">{order.totalAmount.toLocaleString('fa-IR')} تومان</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        order.status === 'PENDING' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                        order.status === 'PAID' ? 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20' :
                        order.status === 'PROCESSING' ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' :
                        order.status === 'SHIPPED' ? 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20' :
                        order.status === 'DELIVERED' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        order.status === 'CANCELLED' ? 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20' :
                        'text-gray-600 dark:text-gray-400 bg-gray-500/10 border-gray-500/20'
                      }`}>
                        {order.status === 'PENDING' ? 'در انتظار پرداخت' :
                         order.status === 'PAID' ? 'پرداخت شده' :
                         order.status === 'PROCESSING' ? 'در حال پردازش' :
                         order.status === 'SHIPPED' ? 'ارسال شده' :
                         order.status === 'DELIVERED' ? 'تحویل داده شده' :
                         order.status === 'CANCELLED' ? 'لغو شده' :
                         order.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bg }: { title: string, value: string | number, icon: React.ReactNode, bg: string }) {
  return (
    <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md flex items-center gap-4 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
      <div className={`p-4 rounded-2xl ${bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
