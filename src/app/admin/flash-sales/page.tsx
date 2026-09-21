import { db } from "@/prisma/db";
import Link from "next/link";
import { Plus, Trash2, Power, PowerOff } from "lucide-react";
import { toggleFlashSale, deleteFlashSale } from "@/actions/flashSale";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminFlashSalesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const sales = await db.orm.public.FlashSale
    .include("product")
    .orderBy((f) => f.createdAt.desc())
    .all();

  const now = new Date().toISOString();

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مدیریت فروش ویژه</h1>
          <p className="text-gray-500 mt-2">کمپین‌های تخفیف زمان‌دار (پیشنهاد شگفت‌انگیز) را مدیریت کنید.</p>
        </div>
        <Link 
          href="/admin/flash-sales/new" 
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          کمپین جدید
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400">
              <th className="py-4 px-4 font-medium">محصول</th>
              <th className="py-4 px-4 font-medium">تخفیف</th>
              <th className="py-4 px-4 font-medium">زمان شروع</th>
              <th className="py-4 px-4 font-medium">زمان پایان</th>
              <th className="py-4 px-4 font-medium">وضعیت</th>
              <th className="py-4 px-4 font-medium text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {sales.map((sale) => {
              
              const isExpired = now > sale.endTime;
              const isPending = now < sale.startTime;

              return (
                <tr key={sale.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-white line-clamp-1">{sale.product?.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-rose-500/20 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-sm font-bold">
                      %{sale.discountPercent}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300" dir="ltr">
                    {new Date(sale.startTime).toLocaleString("fa-IR")}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300" dir="ltr">
                    {new Date(sale.endTime).toLocaleString("fa-IR")}
                  </td>
                  <td className="py-4 px-4">
                    {!sale.isActive ? (
                      <span className="text-gray-500 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full text-xs font-medium">غیرفعال دستی</span>
                    ) : isExpired ? (
                      <span className="text-gray-500 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full text-xs font-medium">منقضی شده</span>
                    ) : isPending ? (
                      <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full text-xs font-medium">در انتظار شروع</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-medium">در حال اجرا</span>
                    )}
                  </td>
                  <td className="py-4 px-4 flex items-center justify-center gap-2">
                    <form action={async () => {
                      "use server";
                      await toggleFlashSale(sale.id, !sale.isActive);
                    }}>
                      <button 
                        type="submit"
                        className={`p-2 rounded-xl border transition-colors ${sale.isActive ? 'border-orange-500/30 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10' : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                        title={sale.isActive ? "غیرفعال کردن" : "فعال کردن"}
                      >
                        {sale.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await deleteFlashSale(sale.id);
                    }}>
                      <button 
                        type="submit"
                        className="p-2 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            
            {sales.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">هیچ کمپین فروش ویژه‌ای ثبت نشده است.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
