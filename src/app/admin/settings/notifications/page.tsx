import { getNotificationSettings } from "@/actions/settings";
import { NotificationSettingsForm } from "@/components/admin/NotificationSettingsForm";

export const metadata = {
  title: 'تنظیمات اطلاع‌رسانی | داشبورد ادمین',
};

export default async function NotificationsSettingsPage() {
  const settings = await getNotificationSettings();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">تنظیمات اطلاع‌رسانی</h1>
        <p className="text-gray-600 dark:text-gray-400">
          مدیریت ارسال پیامک (SMS) و ایمیل در بخش‌های مختلف فروشگاه. این بخش فقط برای سوپر ادمین قابل دسترسی است.
        </p>
      </div>

      <NotificationSettingsForm initialSettings={settings} />
    </div>
  );
}
