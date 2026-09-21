import { getUsers } from "@/actions/users";
import { getSession } from "@/lib/session";
import { canManageRoles } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { UserRoleForm } from "./UserRoleForm";

export const metadata = {
  title: "مدیریت کاربران - پنل ادمین",
};

export default async function UsersPage() {
  const session = await getSession();
  
  if (!session || !canManageRoles(session.role as string)) {
    redirect("/admin");
  }

  const users = await getUsers();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مدیریت کاربران</h1>
      </div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 dark:bg-black/20 border-b border-gray-200 dark:border-white/10">
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">نام و ایمیل</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">تاریخ ثبت‌نام</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">نقش فعلی</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">عملیات (تغییر نقش)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">{user.name || "کاربر ناشناس"}</span>
                      <span className="text-sm text-gray-500 dir-ltr text-left mt-1">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === "SUPER_ADMIN" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                      user.role === "ADMIN" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" :
                      user.role === "BLOG_ADMIN" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      {user.role === "SUPER_ADMIN" ? "سوپر ادمین" :
                       user.role === "ADMIN" ? "ادمین" :
                       user.role === "BLOG_ADMIN" ? "مدیر وبلاگ" : "کاربر عادی"}
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
      </div>
    </div>
  );
}
