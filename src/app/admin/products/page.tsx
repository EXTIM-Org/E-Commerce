import { db } from "@/prisma/db";
import Link from "next/link";
import { Plus, Edit2, ArrowUp, ArrowDown } from "lucide-react";
import { deleteProduct } from "@/actions/product";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ProductFilters } from "@/components/admin/ProductFilters";

function SortableHeader({ 
  label, 
  field, 
  currentSort, 
  currentOrder,
  searchParams
}: { 
  label: string; 
  field: string; 
  currentSort: string; 
  currentOrder: string;
  searchParams: Record<string, any>;
}) {
  const isActive = currentSort === field;
  const nextOrder = isActive && currentOrder === "desc" ? "asc" : "desc"; // Default to desc for new sorts
  
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(searchParams)) {
    if (val !== undefined && val !== null) {
      params.set(key, String(val));
    }
  }
  params.set("sort", field);
  params.set("order", nextOrder);
  
  return (
    <Link href={`?${params.toString()}`} className="flex items-center gap-1.5 hover:text-violet-500 transition-colors w-fit">
      {label}
      {isActive && (
        currentOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
      )}
    </Link>
  );
}

export default async function AdminProductsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const categoryId = typeof searchParams.category === 'string' ? searchParams.category : '';
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : '';
  const order = typeof searchParams.order === 'string' ? searchParams.order : 'desc';

  const categories = await db.orm.public.Category.all();

  let query = db.orm.public.Product
    .include("category")
    .include("variants", (v) => v.include("inventory"));

  if (sort === "basePrice") {
    query = query.orderBy((p) => order === "asc" ? p.basePrice.asc() : p.basePrice.desc());
  } else if (sort === "salesCount") {
    query = query.orderBy((p) => order === "asc" ? p.salesCount.asc() : p.salesCount.desc());
  } else if (sort !== "inventory") {
    query = query.orderBy((p) => p.createdAt.desc());
  }

  if (q) {
    query = query.where((p) => p.name.ilike(`%${q}%`));
  }
  if (categoryId) {
    query = query.where({ categoryId });
  }

  const products = await query.all();

  // Handle inventory sort in JS since it's a nested aggregate
  if (sort === "inventory") {
    products.sort((a, b) => {
      const stockA = a.variants?.reduce((acc: number, v: any) => acc + (v.inventory?.stockQuantity || 0), 0) || 0;
      const stockB = b.variants?.reduce((acc: number, v: any) => acc + (v.inventory?.stockQuantity || 0), 0) || 0;
      return order === "asc" ? stockA - stockB : stockB - stockA;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">مدیریت محصولات</h1>
          <p className="text-gray-600 dark:text-gray-400">مشاهده و ویرایش لیست محصولات فروشگاه</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-medium">
          <Plus className="w-5 h-5" />
          افزودن محصول جدید
        </Link>
      </div>

      <ProductFilters categories={categories} />

      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-b border-black/10 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">تصویر</th>
                <th className="px-6 py-4 font-medium">نام محصول</th>
                <th className="px-6 py-4 font-medium">دسته‌بندی</th>
                <th className="px-6 py-4 font-medium">
                  <SortableHeader label="قیمت پایه" field="basePrice" currentSort={sort} currentOrder={order} searchParams={searchParams} />
                </th>
                <th className="px-6 py-4 font-medium">
                  <SortableHeader label="موجودی انبار" field="inventory" currentSort={sort} currentOrder={order} searchParams={searchParams} />
                </th>
                <th className="px-6 py-4 font-medium">
                  <SortableHeader label="فروش" field="salesCount" currentSort={sort} currentOrder={order} searchParams={searchParams} />
                </th>
                <th className="px-6 py-4 font-medium text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                    هیچ محصولی یافت نشد.
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded-lg border border-black/10 dark:border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-black/5 dark:bg-white/10 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                          بدون عکس
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <span className="bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md text-xs">
                        {product.category?.name || "بدون دسته"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {product.basePrice.toLocaleString()} تومان
                      {product.discount > 0 && (
                        <span className="block text-xs text-red-600 dark:text-red-400 mt-1">
                          {product.discount}% تخفیف
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {product.variants?.reduce((acc: number, v: any) => acc + (v.inventory?.stockQuantity || 0), 0) || 0} عدد
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{product.salesCount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link href={`/admin/products/${product.id}/edit`} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors" title="ویرایش">
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <form action={async () => { "use server"; await deleteProduct(product.id); }}>
                          <DeleteButton />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-black/10 dark:border-white/10 text-center text-sm text-gray-500">
          نمایش {products.length} محصول
        </div>
      </div>
    </div>
  );
}
