import { ShieldCheck, Scale, CreditCard, Truck, RefreshCcw } from "lucide-react";

export const metadata = {
  title: 'شرایط و قوانین',
  description: 'شرایط و قوانین استفاده از فروشگاه اکستیم',
};

const terms = [
  {
    icon: <Scale className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
    title: "قوانین عمومی",
    content: "تمامی اصول و رویه‌های سایت اکستیم منطبق با قوانین جمهوری اسلامی ایران، قانون تجارت الکترونیک و قانون حمایت از حقوق مصرف‌کننده است. ورود کاربران به وب‌سایت و استفاده از خدمات به معنای آگاه بودن و پذیرفتن این شرایط است."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
    title: "حریم خصوصی و امنیت",
    content: "اکستیم به اطلاعات خصوصی اشخاصی که از خدمات سایت استفاده می‌کنند احترام گذاشته و از آن محافظت می‌کند. ما متعهد می‌شویم که اطلاعات شما را در اختیار شخص ثالثی قرار ندهیم و از پیشرفته‌ترین پروتکل‌های امنیتی برای حفظ داده‌های شما استفاده کنیم."
  },
  {
    icon: <CreditCard className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
    title: "ثبت و پردازش سفارش",
    content: "روز کاری به معنی روز شنبه تا پنج‌شنبه هر هفته، به استثنای تعطیلات عمومی در ایران است. کلیه سفارش‌های ثبت شده در طول روزهای کاری و اولین روز پس از تعطیلات پردازش می‌شوند. در صورت بروز هرگونه مشکل در پردازش نهایی سبد خرید، مبلغ پرداخت شده طی ۲۴ الی ۴۸ ساعت کاری به حساب مشتری عودت داده خواهد شد."
  },
  {
    icon: <Truck className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
    title: "ارسال و تحویل",
    content: "سفارشات در شهر تهران توسط پیک و در سایر شهرها از طریق پست پیشتاز یا تیپاکس ارسال می‌شوند. کاربر موظف است هنگام دریافت کالا، سلامت فیزیکی بسته‌بندی را بررسی نماید. امضای رسید تحویل به منزله تایید سلامت ظاهری کالاست."
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
    title: "شرایط مرجوعی و گارانتی",
    content: "مشتریان عزیز می‌توانند در صورت وجود نقص فنی در کالا یا مغایرت با مشخصات درج شده، تا ۷ روز کاری پس از دریافت، کالا را جهت تعویض یا مرجوعی به پشتیبانی اطلاع دهند. توجه داشته باشید که کالاهای مصرفی، نرم‌افزارها و محصولات بهداشتی در صورت باز شدن پلمپ به هیچ وجه قابل مرجوع نیستند."
  }
];

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4 bg-violet-500/10 dark:bg-violet-500/20 px-4 py-2 rounded-full border border-violet-500/20">
            <Scale className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">آخرین به‌روزرسانی: مهر ۱۴۰۵</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 mb-6">
            شرایط و قوانین استفاده
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            لطفاً پیش از استفاده از خدمات سایت اکستیم، موارد زیر را به دقت مطالعه فرمایید. عضویت و خرید از سایت به منزله پذیرش کامل این قوانین است.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-violet-500/20 before:via-fuchsia-500/20 before:to-transparent">
          {terms.map((term, index) => (
            <div key={index} className="relative flex items-start md:justify-between group">
              
              {/* Timeline dot */}
              <div className="absolute left-5 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] border-4 border-background z-10 mt-6 group-hover:scale-125 group-hover:bg-fuchsia-500 transition-all duration-300"></div>

              {/* Card - alternating sides on desktop */}
              <div className={`w-full md:w-[calc(50%-2rem)] pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-12 md:text-left rtl:md:text-right' : 'md:ml-auto md:pl-12'}`}>
                <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-sm hover:shadow-xl dark:shadow-none hover:border-violet-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {term.icon}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {term.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base text-justify">
                    {term.content}
                  </p>
                </div>
              </div>
              
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-24 p-8 bg-violet-50 dark:bg-white/5 border border-violet-100 dark:border-white/10 rounded-3xl text-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">سوال دیگری دارید؟</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            در صورت وجود هرگونه ابهام در قوانین، می‌توانید با تیم پشتیبانی ما تماس بگیرید.
          </p>
          <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity">
            تماس با پشتیبانی
          </a>
        </div>
      </div>
    </main>
  );
}
