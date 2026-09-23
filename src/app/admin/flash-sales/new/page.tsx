import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { FlashSaleForm } from "@/components/admin/FlashSaleForm";
import { ArrowRight } from "lucide-react";
import { canManageStore } from "@/lib/permissions";
import Link from "next/link";

export default async function NewFlashSalePage() {
  const session = await getSession();
  if (!session || !canManageStore(session.role as string)) {
    redirect("/");
  }

  // Fetch all products to select from
  const products = await db.orm.public.Product.all();

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ایجاد کمپین جدید</h1>
          <p className="text-gray-500 mt-2">یک محصول را برای فروش شگفت‌انگیز انتخاب کنید.</p>
        </div>
        <Link 
          href="/admin/flash-sales" 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          بازگشت
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <FlashSaleForm products={products} />
    </div>
  );
}
