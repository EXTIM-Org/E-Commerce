import { getUsers } from "@/actions/users";
import { getSession } from "@/lib/session";
import { canManageRoles } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { UserRoleForm } from "./UserRoleForm";
import Link from "next/link";

import { AdminUsersFilter } from "@/components/admin/AdminUsersFilter";
import { Pagination } from "@/components/ui/Pagination";

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
  const qParam = searchParams?.q;
  const q = typeof qParam === "string" ? qParam : "";
  const limit = 10;

  const { users, totalUsers, totalPages, currentPage } = await getUsers(page, limit, q);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مدیریت کاربران</h1>
      </div>

      <AdminUsersFilter />

      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-b border-black/10 dark:border-white/10">
                <th className="px-6 py-4 font-medium">نام و ایمیل</th>
                <th className="px-6 py-4 font-medium w-[15%]">شماره همراه</th>
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
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 dir-ltr text-right">
                    {user.phoneNumber || <span className="text-gray-400 text-sm">ثبت نشده</span>}
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
                    {user.role === "SUPER_ADMIN" || (user.role === "ADMIN" && session.role !== "SUPER_ADMIN") ? (
                      <span className="text-xs text-gray-500">غیرقابل تغییر</span>
                    ) : (
                      <UserRoleForm userId={user.id} currentRole={user.role as any} sessionRole={session.role as string} />
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    کاربری یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalUsers}
          limit={limit}
          buildHrefPattern={`?page=__PAGE__${q ? `&q=${q}` : ''}`}
          className="rounded-t-none"
        />
      </div>
    </div>
  );
}
