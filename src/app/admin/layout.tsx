import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, Tags, ShoppingCart, HelpCircle, MessageSquare, LayoutList, Users, PackageMinus, BellRing } from "lucide-react";
import { hasAdminPanelAccess, canManageStore, canManageBlog, canManageRoles, canManageSupport } from "@/lib/permissions";
import { AdminSidebarWrapper } from "@/components/admin/layout/AdminSidebarWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session || !session.userId || !hasAdminPanelAccess(session.role as string)) {
    redirect("/");
  }

  const isStoreAdmin = canManageStore(session.role as string);
  const isBlogAdmin = canManageBlog(session.role as string);
  const isSuperAdmin = canManageRoles(session.role as string);
  const isSupportAdmin = canManageSupport(session.role as string);

  return (
    <div className="container mx-auto px-4 py-12 max-w-screen-2xl min-h-[80vh]">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <AdminSidebarWrapper>
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
                {session.role === "SUPER_ADMIN" ? "سوپر ادمین" : session.role === "BLOG_ADMIN" ? "مدیر وبلاگ" : session.role === "SUPPORT" ? "پشتیبانی" : "مدیریت سیستم"}
              </span>
            </div>

            <nav className="flex flex-col gap-6">
              
              {/* گروه اصلی */}
              {isStoreAdmin && (
                <div className="flex flex-col gap-1">
                  <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <LayoutDashboard className="w-5 h-5 text-violet-500" />
                    <span className="font-medium">داشبورد</span>
                  </Link>
                </div>
              )}

              {/* فروشگاه */}
              {isStoreAdmin && (
                <div className="flex flex-col gap-1">
                  <h3 className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">فروشگاه</h3>
                  <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ShoppingCart className="w-5 h-5 text-emerald-500" />
                    <span>سفارشات</span>
                  </Link>
                  <Link href="/admin/returns" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <PackageMinus className="w-5 h-5 text-red-500" />
                    <span>مرجوعی‌ها</span>
                  </Link>
                  <Link href="/admin/products" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>محصولات</span>
                  </Link>
                  <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <LayoutList className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span>دسته‌بندی‌ها</span>
                  </Link>
                  <Link href="/admin/flash-sales" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Tags className="w-5 h-5 text-rose-500" />
                    <span>فروش ویژه</span>
                  </Link>
                  <Link href="/admin/coupons" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Tags className="w-5 h-5 text-amber-500" />
                    <span>کدهای تخفیف</span>
                  </Link>
                </div>
              )}

              {/* تعاملات */}
              {(isStoreAdmin || isBlogAdmin || isSupportAdmin) && (
                <div className="flex flex-col gap-1">
                  <h3 className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-2">تعاملات</h3>
                  {isStoreAdmin && (
                    <>
                      <Link href="/admin/reviews" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        <span>نظرات کاربران</span>
                      </Link>
                      <Link href="/admin/qa" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <HelpCircle className="w-5 h-5 text-orange-500" />
                        <span>پرسش و پاسخ</span>
                      </Link>
                    </>
                  )}
                  {isSupportAdmin && (
                    <Link href="/admin/tickets" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <MessageSquare className="w-5 h-5 text-teal-500" />
                      <span>تیکت‌های پشتیبانی</span>
                    </Link>
                  )}
                  {isBlogAdmin && (
                    <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <MessageSquare className="w-5 h-5 text-fuchsia-500" />
                      <span>وبلاگ و مقالات</span>
                    </Link>
                  )}
                </div>
              )}

              {/* سیستم */}
              {isSuperAdmin && (
                <div className="flex flex-col gap-1">
                  <h3 className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-2">سیستم</h3>
                  <Link href="/admin/users" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <span>مدیریت کاربران</span>
                  </Link>
                  <Link href="/admin/settings/notifications" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <BellRing className="w-5 h-5 text-rose-500" />
                    <span>تنظیمات اطلاع‌رسانی</span>
                  </Link>
                </div>
              )}
            </nav>
            
            </div>
          </AdminSidebarWrapper>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
        
      </div>
    </div>
  );
}
