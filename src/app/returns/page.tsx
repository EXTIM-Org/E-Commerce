import { PackageOpen, Headset, Truck, CreditCard, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'شرایط مرجوعی',
  description: 'رویه و شرایط بازگرداندن کالا در فروشگاه اکستیم',
};

const steps = [
  {
    icon: <Headset className="w-8 h-8" />,
    title: "ثبت درخواست مرجوعی",
    desc: "از طریق پنل کاربری یا تماس با پشتیبانی، درخواست مرجوعی خود را به همراه دلیل و عکس (در صورت وجود مشکل ظاهری) ثبت کنید."
  },
  {
    icon: <CheckCircle2 className="w-8 h-8" />,
    title: "بررسی توسط کارشناسان",
    desc: "کارشناسان ما درخواست شما را در کمتر از ۲۴ ساعت کاری بررسی کرده و در صورت تایید، هماهنگی‌های لازم را انجام می‌دهند."
  },
  {
    icon: <Truck className="w-8 h-8" />,
    title: "ارسال کالا برای اکستیم",
    desc: "کالا را دقیقاً با همان بسته‌بندی اولیه، فاکتور و کلیه ملحقات بسته‌بندی کرده و از طریق پست یا پیک برای ما ارسال کنید."
  },
  {
    icon: <CreditCard className="w-8 h-8" />,
    title: "تست کالا و واریز وجه",
    desc: "پس از رسیدن کالا به انبار و تایید سلامت (توسط تیم فنی)، مبلغ پرداختی طی ۲۴ تا ۴۸ ساعت به حساب شما واریز می‌شود."
  }
];

const returnableConditions = [
  "وجود ایراد یا اشکال فنی در کالا",
  "مغایرت محصول با توضیحات و عکس‌های سایت",
  "آسیب دیدگی در اثر حمل و نقل (باید هنگام تحویل صورتجلسه شود)",
  "انصراف از خرید (به شرط باز نشدن پلمپ کالا)"
];

const nonReturnableConditions = [
  "کالاهای مصرفی و بهداشتی که پلمپ آن‌ها باز شده باشد",
  "لباس زیر و حوله (به دلایل بهداشتی)",
  "نرم‌افزارها و لایسنس‌های دیجیتال",
  "کالاهایی که در اثر استفاده نادرست کاربر آسیب دیده‌اند"
];

export default function ReturnsPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4 bg-orange-500/10 dark:bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/20">
            <PackageOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">ضمانت بازگشت ۷ روزه کالا</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-orange-600 to-rose-600 dark:from-orange-400 dark:to-rose-400 mb-6">
            شرایط و رویه مرجوعی کالا
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            آرامش خاطر شما در خرید برای ما اهمیت دارد. در صورتی که از خرید خود منصرف شدید یا کالا مشکلی داشت، طبق مراحل زیر می‌توانید آن را مرجوع کنید.
          </p>
        </div>

        {/* Steps Flow (Horizontal/Vertical) */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
            مراحل بازگرداندن کالا
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-orange-200 via-rose-200 to-orange-200 dark:from-orange-900 dark:via-rose-900 dark:to-orange-900 z-0"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 border-4 border-orange-100 dark:border-white/10 shadow-xl flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 group-hover:border-orange-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-all duration-300">
                  {step.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg absolute top-0 right-1/2 translate-x-12 -translate-y-2 shadow-lg border-2 border-white dark:border-gray-900">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed px-4">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Conditions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Allowed */}
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400">کالاهای قابل مرجوع</h3>
            </div>
            <ul className="space-y-4">
              {returnableConditions.map((cond, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{cond}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Allowed */}
          <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-400">کالاهای غیرقابل مرجوع</h3>
            </div>
            <ul className="space-y-4">
              {nonReturnableConditions.map((cond, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{cond}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Note / Call to Action */}
        <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">توجه داشته باشید</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xl">
                هزینه ارسال کالای مرجوعی در صورت اثبات خرابی یا مغایرت، بر عهده اکستیم خواهد بود. اما در صورت انصراف از خرید، هزینه ارسال بر عهده مشتری است.
              </p>
            </div>
          </div>
          <Link href="/profile/orders" className="shrink-0 px-8 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors shadow-lg shadow-orange-500/25">
            ثبت مرجوعی سفارش
          </Link>
        </div>
        
      </div>
    </main>
  );
}
