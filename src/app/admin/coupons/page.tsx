import { getCoupons, deleteCoupon, toggleCouponStatus } from "@/actions/coupon";
import { CouponForm } from "@/components/admin/CouponForm";
import { Trash2, CheckCircle, XCircle } from "lucide-react";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "مدیریت کدهای تخفیف | پنل ادمین",
};

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">مدیریت کدهای تخفیف</h1>
        <p className="text-gray-500 dark:text-gray-400">کدهای تخفیف فروشگاه را ایجاد و مدیریت کنید.</p>
      </div>

      <CouponForm />

      <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 dark:bg-black/50 text-gray-700 dark:text-gray-300 border-b border-black/10 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">کد تخفیف</th>
                <th className="px-6 py-4 font-semibold">نوع و مقدار</th>
                <th className="px-6 py-4 font-semibold">استفاده شده</th>
                <th className="px-6 py-4 font-semibold">وضعیت</th>
                <th className="px-6 py-4 font-semibold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">هیچ کد تخفیفی یافت نشد.</td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-violet-600 dark:text-violet-400" dir="ltr">{coupon.code}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {coupon.type === "PERCENTAGE" 
                        ? `${coupon.value} درصد ${coupon.maxDiscount ? `(تا سقف ${coupon.maxDiscount.toLocaleString()})` : ''}`
                        : `${coupon.value.toLocaleString()} تومان`}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-400">
                          <XCircle className="w-3.5 h-3.5" />
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-3">
                      <form action={async () => {
                        "use server";
                        await toggleCouponStatus(coupon.id, !coupon.isActive);
                      }}>
                        <button type="submit" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                          {coupon.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                        </button>
                      </form>
                      <form action={async () => {
                        "use server";
                        await deleteCoupon(coupon.id);
                      }}>
                        <button type="submit" className="text-red-500 hover:text-red-600 transition-colors" title="حذف">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </form>
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
