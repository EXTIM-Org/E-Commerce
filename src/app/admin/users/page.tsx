import { getUsers } from "@/actions/users";
import { getSession } from "@/lib/session";
import { canManageRoles } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { UserRoleForm } from "./UserRoleForm";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

export const metadata = {
  title: "مدیریت کاربران - پنل ادمین",
};

export default async function UsersPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await getSession();
  
  if (!session || !canManageRoles(session.role as string)) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const pageParam = searchParams?.page;
  const page = parseInt(Array.isArray(pageParam) ? pageParam[0] : (pageParam || "1"), 10);
  const limit = 10;

  const { users, totalUsers, totalPages, currentPage } = await getUsers(page, limit);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مدیریت کاربران</h1>
      </div>

      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-b border-black/10 dark:border-white/10">
                <th className="px-6 py-4 font-medium">نام و ایمیل</th>
                <th className="px-6 py-4 font-medium">تاریخ ثبت‌نام</th>
                <th className="px-6 py-4 font-medium">نقش فعلی</th>
                <th className="px-6 py-4 font-medium">عملیات (تغییر نقش)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/users/${user.id}`} className="flex flex-col hover:opacity-80 transition-opacity">
                      <span className="font-medium text-gray-900 dark:text-white group-hover:text-violet-600 transition-colors">{user.name || "کاربر ناشناس"}</span>
                      <span className="text-sm text-gray-500 dir-ltr text-left mt-1">{user.email}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === "SUPER_ADMIN" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                      user.role === "ADMIN" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" :
                      user.role === "BLOG_ADMIN" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                      user.role === "SUPPORT" ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" :
                      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      {user.role === "SUPER_ADMIN" ? "سوپر ادمین" :
                       user.role === "ADMIN" ? "ادمین" :
                       user.role === "BLOG_ADMIN" ? "مدیر وبلاگ" : 
                       user.role === "SUPPORT" ? "پشتیبانی" : "کاربر عادی"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role !== "SUPER_ADMIN" ? (
                      <UserRoleForm userId={user.id} currentRole={user.role as any} />
                    ) : (
                      <span className="text-xs text-gray-500">غیرقابل تغییر</span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    کاربری یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            نمایش {totalUsers === 0 ? 0 : (currentPage - 1) * limit + 1} تا {Math.min(currentPage * limit, totalUsers)} از {totalUsers} کاربر
          </span>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2" dir="ltr">
              {currentPage > 1 ? (
                <Link
                  href={`?page=${currentPage - 1}`}
                  prefetch={false}
                  className="p-2 rounded-lg border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              ) : (
                <button disabled className="p-2 rounded-lg border border-black/10 dark:border-white/10 text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages })
                  .map((_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((p, index, array) => {
                    const isGap = index > 0 && p - array[index - 1] > 1;
                    return (
                      <div key={p} className="flex items-center">
                        {isGap && <span className="px-2 text-gray-400">...</span>}
                        <Link
                          href={`?page=${p}`}
                          prefetch={false}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            currentPage === p
                              ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          {p}
                        </Link>
                      </div>
                    );
                  })}
              </div>

              {currentPage < totalPages ? (
                <Link
                  href={`?page=${currentPage + 1}`}
                  prefetch={false}
                  className="p-2 rounded-lg border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <button disabled className="p-2 rounded-lg border border-black/10 dark:border-white/10 text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed">
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
