import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { User, ShoppingBag, MapPin, Heart, LogOut, MessageSquare } from "lucide-react";
import { logoutUser } from "@/actions/auth";
import { AvatarUpload } from "@/components/profile/AvatarUpload";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl min-h-[80vh]">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md sticky top-24">
            
            <div className="flex flex-col items-center gap-3 mb-8">
              <AvatarUpload currentImage={session.image as string | null} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{(session.name as string) || "کاربر"}</h2>
              <span className="text-xs font-medium bg-purple-500/20 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-full">
                کاربر سایت
              </span>
            </div>

            <nav className="flex flex-col gap-2">
              <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <User className="w-5 h-5" />
                مشخصات حساب
              </Link>
              <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ShoppingBag className="w-5 h-5" />
                تاریخچه سفارشات
              </Link>
              <Link href="/profile/addresses" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
                آدرس‌های من
              </Link>
              <Link href="/profile/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
                علاقه‌مندی‌ها
              </Link>
              <Link href="/profile/tickets" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
                تیکت‌های پشتیبانی
              </Link>
              
              <div className="h-px w-full bg-black/10 dark:bg-white/10 my-2"></div>
              
              <form action={logoutUser}>
                <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  <LogOut className="w-5 h-5" />
                  خروج از حساب
                </button>
              </form>
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
