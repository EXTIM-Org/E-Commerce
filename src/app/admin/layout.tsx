import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, HelpCircle, MessageSquare } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session || !session.userId || session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl min-h-[80vh]">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md sticky top-24">
            
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[2px]">
                <div className="w-full h-full bg-background rounded-full overflow-hidden flex items-center justify-center">
                  {session.image ? (
                    <img src={session.image as string} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <LayoutDashboard className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{(session.name as string) || "مدیر"}</h2>
              <span className="text-xs font-medium bg-rose-500/20 text-rose-700 dark:text-rose-400 px-3 py-1 rounded-full">
                مدیریت سیستم
              </span>
            </div>

            <nav className="flex flex-col gap-2">
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <LayoutDashboard className="w-5 h-5" />
                داشبورد
              </Link>
              <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Package className="w-5 h-5" />
                محصولات
              </Link>
              <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Tags className="w-5 h-5" />
                دسته‌بندی‌ها
              </Link>
              <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ShoppingCart className="w-5 h-5" />
                سفارشات
              </Link>
              <Link href="/admin/coupons" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Tags className="w-5 h-5" />
                کدهای تخفیف
              </Link>
              <Link href="/admin/qa" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5" />
                پرسش و پاسخ
              </Link>
              <Link href="/admin/reviews" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
                نظرات کاربران
              </Link>
              

            </nav>
            
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
        
      </div>
    </div>
  );
}
