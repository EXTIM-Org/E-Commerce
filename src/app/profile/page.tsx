import { getSession } from "@/lib/session";
import { db } from "@/prisma/db";
import { Mail, Calendar, Shield } from "lucide-react";

export default async function ProfileDashboardPage() {
  const session = await getSession();
  
  if (!session?.userId) return null;

  // Fetch fresh user data from DB
  const user = await db.orm.public.User.where({ id: session.userId as string }).first();
  if (!user) return null;

  // Since Prisma 8 returns timestamps, we can format them
  const joinDate = new Date(user.createdAt).toLocaleDateString('fa-IR');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white mb-2">مشخصات حساب کاربری</h1>
      
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-400 flex items-center gap-2"><UserIcon /> نام و نام خانوادگی</span>
            <div className="bg-black/20 border border-white/10 p-4 rounded-xl text-white font-medium">
              {user.name || 'ثبت نشده'}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-400 flex items-center gap-2"><Mail className="w-4 h-4" /> ایمیل</span>
            <div className="bg-black/20 border border-white/10 p-4 rounded-xl text-white font-medium" dir="ltr">
              {user.email}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> تاریخ عضویت</span>
            <div className="bg-black/20 border border-white/10 p-4 rounded-xl text-white font-medium">
              {joinDate}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-400 flex items-center gap-2"><Shield className="w-4 h-4" /> وضعیت اکانت</span>
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 font-medium flex items-center gap-2">
              تایید شده و فعال
            </div>
          </div>
          
        </div>
        
        <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
          <button className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-medium transition-colors opacity-50 cursor-not-allowed" disabled>
            ویرایش مشخصات (به زودی)
          </button>
        </div>
        
      </div>
    </div>
  );
}

// Inline UserIcon to avoid importing from lucide again since we used it in layout
function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  );
}
