import Link from "next/link";
import { Store, ShieldCheck, Truck, Headphones, Users, Zap, ChevronLeft } from "lucide-react";

export const metadata = {
  title: 'درباره ما | EXTIM',
  description: 'داستان شکل‌گیری و ارزش‌های اکستیم، فروشگاه پیشرو در ارائه محصولات با کیفیت.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f111a] text-gray-900 dark:text-gray-100 selection:bg-violet-500/30">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-violet-600/20 dark:bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-fuchsia-600/10 dark:bg-fuchsia-600/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 font-medium text-sm mb-8 border border-violet-200 dark:border-violet-500/20">
            <Store className="w-4 h-4" />
            <span>آشنایی با اکستیم</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">
            بیشتر از یک فروشگاه، <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
              یک تجربه بی‌نظیر
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            ما در اکستیم تلاش می‌کنیم با ارائه محصولات اورجینال، قیمت‌های رقابتی و پشتیبانی ۲۴ ساعته، تجربه‌ای متفاوت و لذت‌بخش از خرید اینترنتی را برای شما رقم بزنیم.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "مشتری فعال", value: "۵۰,۰۰۰+", icon: Users },
              { label: "محصول متنوع", value: "۲,۰۰۰+", icon: Store },
              { label: "رضایت مشتریان", value: "۹۹٪", icon: ShieldCheck },
              { label: "ارسال موفق", value: "۱۰۰,۰۰۰+", icon: Truck },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                داستان <span className="text-violet-600 dark:text-violet-400">شروع ما</span>
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed text-lg text-justify">
                <p>
                  همه چیز از یک نیاز ساده شروع شد؛ نیاز به بستری امن، سریع و قابل اعتماد برای خرید کالاهای باکیفیت. اکستیم در سال ۱۴۰۰ با تیمی کوچک اما رویاهایی بزرگ متولد شد.
                </p>
                <p>
                  در دنیایی که زمان ارزشمندترین دارایی انسان‌هاست، ما پلتفرمی را خلق کردیم تا فرایند انتخاب تا تحویل کالا را به کوتاه‌ترین و لذت‌بخش‌ترین شکل ممکن برساند. امروز، اکستیم با افتخار به هزاران کاربر در سراسر کشور خدمت‌رسانی می‌کند و هر روز برای بهتر شدن تلاش می‌کند.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative rounded-3xl overflow-hidden aspect-video group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-fuchsia-600 opacity-20 group-hover:opacity-10 transition-opacity duration-500 z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="تیم اکستیم" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ارزش‌های کلیدی اکستیم</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">اصولی که هر روز ما را به سمت جلو هدایت می‌کنند و چراغ راه ما در خدمت‌رسانی به شما هستند.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "تضمین اصالت و کیفیت",
                desc: "تمامی محصولات ارائه شده در اکستیم اورجینال بوده و با ضمانت اصالت کالا به دست شما می‌رسند. ما کیفیت را فدای قیمت نمی‌کنیم.",
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-100 dark:bg-emerald-500/10",
                border: "border-emerald-200 dark:border-emerald-500/20"
              },
              {
                icon: Zap,
                title: "سرعت در ارسال",
                desc: "ما ارزش زمان شما را می‌دانیم. سیستم لجستیک اکستیم بهینه‌سازی شده تا در سریع‌ترین زمان ممکن، خرید شما را درب منزل تحویل دهد.",
                color: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-100 dark:bg-amber-500/10",
                border: "border-amber-200 dark:border-amber-500/20"
              },
              {
                icon: Headphones,
                title: "همیشه پاسخگو",
                desc: "تیم پشتیبانی ما به صورت ۲۴ ساعته در ۷ روز هفته آماده شنیدن صدای شما، راهنمایی پیش از خرید و حل مشکلات پس از خرید است.",
                color: "text-blue-600 dark:text-blue-400",
                bg: "bg-blue-100 dark:bg-blue-500/10",
                border: "border-blue-200 dark:border-blue-500/20"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-[#1a1b26] p-8 rounded-3xl border border-black/5 dark:border-white/10 hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-black/5 dark:shadow-none">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${feature.bg} ${feature.color} ${feature.border}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-violet-600 dark:bg-violet-900/50" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-fuchsia-500/40 to-transparent rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">آماده تجربه‌ای متفاوت هستید؟</h2>
          <p className="text-violet-100 text-lg mb-10 max-w-2xl mx-auto">
            همین حالا به جمع هزاران مشتری راضی اکستیم بپیوندید و از خرید کالاهای باکیفیت لذت ببرید.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/products" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-violet-900 hover:bg-gray-50 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              مشاهده محصولات
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact" 
              className="w-full sm:w-auto px-8 py-4 bg-violet-700/50 hover:bg-violet-700 text-white border border-violet-500/50 rounded-2xl font-bold transition-colors flex items-center justify-center"
            >
              تماس با ما
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
