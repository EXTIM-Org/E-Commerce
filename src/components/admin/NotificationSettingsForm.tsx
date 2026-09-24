"use client";

import { useState } from "react";
import { updateNotificationSetting } from "@/actions/settings";
import { BellRing, Smartphone, Mail, RefreshCcw, ShoppingCart, CheckCircle2, XCircle, DollarSign, Package, Truck, Home } from "lucide-react";
import toast from "react-hot-toast";

type SettingsType = {
  globalSms: boolean;
  globalEmail: boolean;
  
  returns_submitted_sms: boolean;
  returns_submitted_email: boolean;
  returns_pending_sms: boolean;
  returns_pending_email: boolean;
  returns_approved_sms: boolean;
  returns_approved_email: boolean;
  returns_rejected_sms: boolean;
  returns_rejected_email: boolean;
  returns_refunded_sms: boolean;
  returns_refunded_email: boolean;
  
  orders_paid_sms: boolean;
  orders_paid_email: boolean;
  orders_processing_sms: boolean;
  orders_processing_email: boolean;
  orders_shipped_sms: boolean;
  orders_shipped_email: boolean;
  orders_delivered_sms: boolean;
  orders_delivered_email: boolean;
  orders_cancelled_sms: boolean;
  orders_cancelled_email: boolean;
};

export function NotificationSettingsForm({ initialSettings }: { initialSettings: SettingsType }) {
  const [settings, setSettings] = useState(initialSettings);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const toggleSetting = async (key: keyof SettingsType) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    setLoadingKey(key);
    
    try {
      await updateNotificationSetting(key, newValue);
      toast.success("تنظیمات با موفقیت بروزرسانی شد");
    } catch (error) {
      toast.error("خطا در بروزرسانی تنظیمات");
      setSettings(prev => ({ ...prev, [key]: !newValue })); // revert
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Global Toggles */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">تنظیمات اصلی اطلاع‌رسانی</h2>
            <p className="text-sm text-gray-500 mt-1">فعال یا غیرفعال‌سازی کلی پیامک‌ها و ایمیل‌ها</p>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          <SettingRow 
            icon={<Smartphone className="w-5 h-5" />}
            title="ارسال پیامک (SMS) در کل سایت"
            description="اگر این گزینه غیرفعال شود، هیچ پیامکی از طرف سایت ارسال نخواهد شد."
            enabled={settings.globalSms}
            loading={loadingKey === "globalSms"}
            onToggle={() => toggleSetting("globalSms")}
            color="emerald"
          />
          <SettingRow 
            icon={<Mail className="w-5 h-5" />}
            title="ارسال ایمیل در کل سایت"
            description="اگر این گزینه غیرفعال شود، هیچ ایمیلی (به جز موارد حیاتی) ارسال نخواهد شد."
            enabled={settings.globalEmail}
            loading={loadingKey === "globalEmail"}
            onToggle={() => toggleSetting("globalEmail")}
            color="blue"
          />
        </div>
      </div>

      {/* Returns Toggles */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <RefreshCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">اطلاع‌رسانی مرجوعی‌ها</h2>
            <p className="text-sm text-gray-500 mt-1">تنظیم پیامک و ایمیل به تفکیک مراحل استرداد کالا</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4 text-center">مرحله مرجوعی</th>
                <th className="px-6 py-4 text-center">پیامک (SMS)</th>
                <th className="px-6 py-4 text-center">ایمیل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              <ToggleTableRow 
                label="ثبت شده (Submitted)"
                icon={<RefreshCcw className="w-4 h-4 text-indigo-500" />}
                smsEnabled={settings.returns_submitted_sms}
                emailEnabled={settings.returns_submitted_email}
                smsLoading={loadingKey === "returns_submitted_sms"}
                emailLoading={loadingKey === "returns_submitted_email"}
                onSmsToggle={() => toggleSetting("returns_submitted_sms")}
                onEmailToggle={() => toggleSetting("returns_submitted_email")}
                disabled={!settings.globalSms && !settings.globalEmail}
              />
              <ToggleTableRow 
                label="در حال بررسی (Pending)"
                icon={<RefreshCcw className="w-4 h-4 text-yellow-500" />}
                smsEnabled={settings.returns_pending_sms}
                emailEnabled={settings.returns_pending_email}
                smsLoading={loadingKey === "returns_pending_sms"}
                emailLoading={loadingKey === "returns_pending_email"}
                onSmsToggle={() => toggleSetting("returns_pending_sms")}
                onEmailToggle={() => toggleSetting("returns_pending_email")}
                disabled={!settings.globalSms && !settings.globalEmail}
              />
              <ToggleTableRow 
                label="تایید شده (Approved)"
                icon={<CheckCircle2 className="w-4 h-4 text-blue-500" />}
                smsEnabled={settings.returns_approved_sms}
                emailEnabled={settings.returns_approved_email}
                smsLoading={loadingKey === "returns_approved_sms"}
                emailLoading={loadingKey === "returns_approved_email"}
                onSmsToggle={() => toggleSetting("returns_approved_sms")}
                onEmailToggle={() => toggleSetting("returns_approved_email")}
                disabled={!settings.globalSms && !settings.globalEmail}
              />
              <ToggleTableRow 
                label="رد شده (Rejected)"
                icon={<XCircle className="w-4 h-4 text-red-500" />}
                smsEnabled={settings.returns_rejected_sms}
                emailEnabled={settings.returns_rejected_email}
                smsLoading={loadingKey === "returns_rejected_sms"}
                emailLoading={loadingKey === "returns_rejected_email"}
                onSmsToggle={() => toggleSetting("returns_rejected_sms")}
                onEmailToggle={() => toggleSetting("returns_rejected_email")}
                disabled={!settings.globalSms && !settings.globalEmail}
              />
              <ToggleTableRow 
                label="مسترد شده / واریز وجه (Refunded)"
                icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
                smsEnabled={settings.returns_refunded_sms}
                emailEnabled={settings.returns_refunded_email}
                smsLoading={loadingKey === "returns_refunded_sms"}
                emailLoading={loadingKey === "returns_refunded_email"}
                onSmsToggle={() => toggleSetting("returns_refunded_sms")}
                onEmailToggle={() => toggleSetting("returns_refunded_email")}
                disabled={!settings.globalSms && !settings.globalEmail}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Toggles */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">اطلاع‌رسانی سفارشات</h2>
            <p className="text-sm text-gray-500 mt-1">تنظیم پیامک و ایمیل به تفکیک مراحل پردازش تا تحویل سفارش</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4 text-center">وضعیت سفارش</th>
                <th className="px-6 py-4 text-center">پیامک (SMS)</th>
                <th className="px-6 py-4 text-center">ایمیل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              <ToggleTableRow 
                label="پرداخت شده (Paid)"
                icon={<DollarSign className="w-4 h-4 text-teal-500" />}
                smsEnabled={settings.orders_paid_sms}
                emailEnabled={settings.orders_paid_email}
                smsLoading={loadingKey === "orders_paid_sms"}
                emailLoading={loadingKey === "orders_paid_email"}
                onSmsToggle={() => toggleSetting("orders_paid_sms")}
                onEmailToggle={() => toggleSetting("orders_paid_email")}
                disabled={!settings.globalSms && !settings.globalEmail}
              />
              <ToggleTableRow 
                label="در حال پردازش (Processing)"
                icon={<Package className="w-4 h-4 text-blue-500" />}
                smsEnabled={settings.orders_processing_sms}
                emailEnabled={settings.orders_processing_email}
                smsLoading={loadingKey === "orders_processing_sms"}
                emailLoading={loadingKey === "orders_processing_email"}
                onSmsToggle={() => toggleSetting("orders_processing_sms")}
                onEmailToggle={() => toggleSetting("orders_processing_email")}
                disabled={!settings.globalSms && !settings.globalEmail}
              />
              <ToggleTableRow 
                label="ارسال شده (Shipped)"
                icon={<Truck className="w-4 h-4 text-purple-500" />}
                smsEnabled={settings.orders_shipped_sms}
                emailEnabled={settings.orders_shipped_email}
                smsLoading={loadingKey === "orders_shipped_sms"}
                emailLoading={loadingKey === "orders_shipped_email"}
                onSmsToggle={() => toggleSetting("orders_shipped_sms")}
                onEmailToggle={() => toggleSetting("orders_shipped_email")}
                disabled={!settings.globalSms && !settings.globalEmail}
              />
              <ToggleTableRow 
                label="تحویل داده شده (Delivered)"
                icon={<Home className="w-4 h-4 text-emerald-500" />}
                smsEnabled={settings.orders_delivered_sms}
                emailEnabled={settings.orders_delivered_email}
                smsLoading={loadingKey === "orders_delivered_sms"}
                emailLoading={loadingKey === "orders_delivered_email"}
                onSmsToggle={() => toggleSetting("orders_delivered_sms")}
                onEmailToggle={() => toggleSetting("orders_delivered_email")}
                disabled={!settings.globalSms && !settings.globalEmail}
              />
              <ToggleTableRow 
                label="لغو شده (Cancelled)"
                icon={<XCircle className="w-4 h-4 text-red-500" />}
                smsEnabled={settings.orders_cancelled_sms}
                emailEnabled={settings.orders_cancelled_email}
                smsLoading={loadingKey === "orders_cancelled_sms"}
                emailLoading={loadingKey === "orders_cancelled_email"}
                onSmsToggle={() => toggleSetting("orders_cancelled_sms")}
                onEmailToggle={() => toggleSetting("orders_cancelled_email")}
                disabled={!settings.globalSms && !settings.globalEmail}
              />
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}

function SettingRow({ 
  icon, 
  title, 
  description, 
  enabled, 
  loading, 
  onToggle, 
  color = "violet",
  disabled = false
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  enabled: boolean, 
  loading: boolean, 
  onToggle: () => void,
  color?: "violet" | "emerald" | "blue",
  disabled?: boolean
}) {
  return (
    <div className={`p-6 flex items-center justify-between gap-4 transition-colors ${disabled ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          enabled && !disabled 
            ? color === 'violet' ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400' 
            : color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
        }`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
      
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        disabled={loading || disabled}
        className={`${
          enabled && !disabled 
            ? color === 'violet' ? 'bg-violet-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500' 
            : 'bg-gray-300 dark:bg-gray-700'
        } relative inline-flex h-[28px] w-[52px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500 disabled:opacity-50`}
      >
        <span className="sr-only">Toggle setting</span>
        <span
          aria-hidden="true"
          className={`${enabled ? '-translate-x-[24px]' : 'translate-x-0'}
            pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${loading ? 'animate-pulse' : ''}`}
        />
      </button>
    </div>
  );
}

function ToggleTableRow({
  label,
  icon,
  smsEnabled,
  emailEnabled,
  smsLoading,
  emailLoading,
  onSmsToggle,
  onEmailToggle,
  disabled
}: {
  label: string,
  icon: React.ReactNode,
  smsEnabled: boolean,
  emailEnabled: boolean,
  smsLoading: boolean,
  emailLoading: boolean,
  onSmsToggle: () => void,
  onEmailToggle: () => void,
  disabled: boolean
}) {
  return (
    <tr className={`transition-colors ${disabled ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
          {icon}
          <span>{label}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <button
          type="button"
          role="switch"
          aria-checked={smsEnabled}
          onClick={onSmsToggle}
          disabled={smsLoading || disabled}
          className={`${smsEnabled && !disabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}
            relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 disabled:opacity-50 mx-auto`}
        >
          <span className="sr-only">Toggle SMS</span>
          <span
            aria-hidden="true"
            className={`${smsEnabled ? '-translate-x-[20px]' : 'translate-x-0'}
              pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${smsLoading ? 'animate-pulse' : ''}`}
          />
        </button>
      </td>
      <td className="px-6 py-4 text-center">
        <button
          type="button"
          role="switch"
          aria-checked={emailEnabled}
          onClick={onEmailToggle}
          disabled={emailLoading || disabled}
          className={`${emailEnabled && !disabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}
            relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-50 mx-auto`}
        >
          <span className="sr-only">Toggle Email</span>
          <span
            aria-hidden="true"
            className={`${emailEnabled ? '-translate-x-[20px]' : 'translate-x-0'}
              pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${emailLoading ? 'animate-pulse' : ''}`}
          />
        </button>
      </td>
    </tr>
  );
}
