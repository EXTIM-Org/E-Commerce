import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/actions/product";
import { db } from "@/prisma/db";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

// Next.js 15 requires async params
export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const categories = await getCategories();
  
  const product = await db.orm.public.Product.first({ id: params.id });
  
  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ویرایش محصول</h1>
          <p className="text-gray-600 dark:text-gray-400">تغییرات مورد نظر را در محصول اعمال کنید.</p>
        </div>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
