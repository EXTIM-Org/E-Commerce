import { getAdminReturnRequests } from "@/actions/returns";
import { ReturnStatusUpdater } from "@/components/admin/ReturnStatusUpdater";
import Link from "next/link";
import { PackageX } from "lucide-react";

export const metadata = {
  title: 'مدیریت مرجوعی‌ها | داشبورد ادمین',
};

export default async function AdminReturnsPage() {
  const requests = await getAdminReturnRequests();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">مدیریت مرجوعی کالا</h1>
          <p className="text-gray-500 text-sm mt-1">بررسی درخواست‌های مرجوعی، تایید و استرداد وجه</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium">
            <tr>
              <th className="px-6 py-4">کاربر</th>
              <th className="px-6 py-4">محصول</th>
              <th className="px-6 py-4">دلیل مرجوعی</th>
              <th className="px-6 py-4">مستندات (عکس)</th>
              <th className="px-6 py-4">وضعیت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  <PackageX className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  هیچ درخواست مرجوعی یافت نشد.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold">{req.user?.name || 'بدون نام'}</span>
                      <span className="text-xs text-gray-500">{req.user?.phoneNumber || req.user?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <Link href={`/products/${req.orderItem?.variant?.product?.slug}`} target="_blank" className="font-medium text-violet-600 dark:text-violet-400 hover:underline">
                        {req.orderItem?.variant?.product?.name}
                      </Link>
                      <Link href={`/admin/orders/${req.orderItem?.orderId}`} target="_blank" className="text-xs text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1">
                        سفارش: <span className="font-mono">{req.orderItem?.orderId.slice(0,8)}</span>
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{req.reason}</div>
                    {req.description && (
                      <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={req.description}>
                        {req.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {req.images.length > 0 ? (
                      <div className="flex -space-x-2 space-x-reverse relative group cursor-pointer">
                        {req.images.map((img, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-100">
                            <img src={img} alt="return proof" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">ندارد</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <ReturnStatusUpdater requestId={req.id} currentStatus={req.status as any} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
