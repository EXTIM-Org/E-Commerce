import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories, getOrCreateDefaultCategory } from "@/actions/product";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function NewProductPage() {
  await getOrCreateDefaultCategory(); // ensure at least one category exists
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">افزودن محصول جدید</h1>
          <p className="text-gray-600 dark:text-gray-400">اطلاعات محصول جدید را با دقت وارد کنید.</p>
        </div>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
