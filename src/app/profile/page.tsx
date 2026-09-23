import { getSession } from "@/lib/session";
import { db } from "@/prisma/db";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";

export default async function ProfileDashboardPage() {
  const session = await getSession();
  
  if (!session?.userId) return null;

  // Fetch fresh user data from DB
  const user = await db.orm.public.User.where({ id: session.userId as string }).first();
  if (!user) return null;

  // Since Prisma 8 returns timestamps, we can format them
  const joinDate = new Date(user.createdAt).toLocaleDateString('fa-IR');

  const userData = {
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    joinDate: joinDate,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">مشخصات حساب کاربری</h1>
      <ProfileForm user={userData} />
      <ChangePasswordForm />
    </div>
  );
}
