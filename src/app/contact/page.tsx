import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { MessageSquare, ArrowLeft } from "lucide-react";

export const metadata = {
  title: 'تماس با ما',
  description: 'راه‌های ارتباطی و فرم تماس با فروشگاه اکستیم',
};

export default async function ContactPage() {
  const session = await getSession();
  const isLoggedIn = !!session?.userId;

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "آدرس ما",
      details: "تهران، خیابان ولیعصر، نرسیده به میدان ونک، برج نگار، طبقه ۱۵، واحد ۴",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-100 dark:border-blue-900/30"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "تماس تلفنی",
      details: "۰۲۱-۸۸۸۸۸۸۸۸ \n ۰۲۱-۸۸۸۸۸۸۸۹",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-100 dark:border-emerald-900/30"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "پست الکترونیک",
      details: "support@extim.com \n info@extim.com",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-500/10",
      border: "border-rose-100 dark:border-rose-900/30"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "ساعات کاری",
      details: "شنبه تا چهارشنبه: ۹ صبح تا ۱۸ عصر \n پنج‌شنبه‌ها: ۹ صبح تا ۱۴ ظهر",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-100 dark:border-amber-900/30"
    }
  ];

  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4 bg-teal-500/10 dark:bg-teal-500/20 px-4 py-2 rounded-full border border-teal-500/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">پشتیبانی آنلاین و تلفنی</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 mb-6">
            تماس با اکستیم
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            مشتاقانه منتظر شنیدن صدای شما هستیم! سوالات، پیشنهادات و انتقادات خود را از طریق فرم زیر یا راه‌های ارتباطی با ما در میان بگذارید.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Right Column: Contact Info Cards */}
          <div className="w-full lg:w-5/12 space-y-6">
            {contactInfo.map((info, index) => (
              <div key={index} className={`flex items-start gap-4 p-6 rounded-3xl border backdrop-blur-md transition-transform hover:-translate-y-1 ${info.bg} ${info.border}`}>
                <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center shrink-0 ${info.color}`}>
                  {info.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{info.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-loose whitespace-pre-line font-medium">
                    {info.details}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Left Column: Ticketing System */}
          <div className="w-full lg:w-7/12">
            <div className="bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl p-8 md:p-12 text-center backdrop-blur-sm h-full flex flex-col justify-center items-center">
              <div className="w-20 h-20 bg-violet-100 dark:bg-violet-500/20 rounded-full flex items-center justify-center mb-6 text-violet-600 dark:text-violet-400">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">سیستم تیکتینگ یکپارچه</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md leading-relaxed">
                برای پیگیری بهتر درخواست‌ها، ارسال فایل و ارتباط دوطرفه با کارشناسان ما، لطفاً از سیستم تیکتینگ استفاده کنید.
              </p>
              
              {isLoggedIn ? (
                <Link 
                  href="/profile/tickets/new" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl transition-all font-bold shadow-lg shadow-violet-600/20 hover:-translate-y-1"
                >
                  ثبت تیکت جدید
                  <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Link 
                    href="/login?callbackUrl=/profile/tickets/new" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl transition-all font-bold shadow-lg shadow-violet-600/20 hover:-translate-y-1"
                  >
                    ورود به حساب و ثبت تیکت
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                  </Link>
                  <p className="text-sm text-gray-500">
                    حساب کاربری ندارید؟ <Link href="/register" className="text-violet-600 font-bold hover:underline">ثبت‌نام کنید</Link>
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
