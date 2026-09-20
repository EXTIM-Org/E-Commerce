import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { HeartCrack } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "لیست علاقه‌مندی‌ها",
};

export default async function WishlistPage() {
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect("/login");
  }

  const wishlist = await db.orm.public.Wishlist
    .where({ userId: session.userId as string })
    .include("items", (items) => 
      items.include("product", (product) => 
        product.include("variants", (variants) => 
          variants.include("inventory")
        )
      )
    ).all().first();

  const products = wishlist?.items.map(i => i.product).filter(p => p !== null) || [];

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-sm dark:shadow-none">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">علاقه‌مندی‌های من</h2>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              initialIsLiked={true} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 dark:bg-white/5 p-6 rounded-full mb-6">
            <HeartCrack className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لیست علاقه‌مندی‌های شما خالی است</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            محصولاتی که به آن‌ها علاقه دارید را به لیست خود اضافه کنید تا در آینده راحت‌تر به آن‌ها دسترسی داشته باشید.
          </p>
          <Link 
            href="/products" 
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/20"
          >
            مشاهده محصولات
          </Link>
        </div>
      )}
    </div>
  );
}
