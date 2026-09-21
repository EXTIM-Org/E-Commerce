import { Shield, Lock, Eye, Fingerprint, Database, Cookie, Server } from "lucide-react";

export const metadata = {
  title: 'حریم خصوصی',
  description: 'سیاست‌های حفظ حریم خصوصی و امنیت اطلاعات کاربران در اکستیم',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-4 overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-fuchsia-500/10 dark:bg-fuchsia-500/5 blur-[150px] rounded-full"></div>
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4 bg-violet-500/10 dark:bg-white/5 px-4 py-2 rounded-full border border-violet-500/20 dark:border-white/10 backdrop-blur-md">
            <Shield className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">امنیت شما اولویت ماست</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-violet-600 to-fuchsia-600 dark:from-white dark:to-gray-400 mb-6">
            سیاست حفظ حریم خصوصی
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            در اکستیم، ما به حفظ و نگهداری اطلاعات خصوصی شما اهمیت می‌دهیم. این صفحه به شما می‌گوید چه اطلاعاتی جمع‌آوری می‌شود و چگونه از آن‌ها محافظت می‌کنیم.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Wide Card - What we collect */}
          <div className="md:col-span-2 bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-4 mb-6 relative">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-white/10 flex items-center justify-center shrink-0 text-violet-600 dark:text-white group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">چه اطلاعاتی دریافت می‌کنیم؟</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify relative">
              هنگام ثبت نام، خرید یا استفاده از خدمات ما، اطلاعاتی نظیر نام و نام خانوادگی، شماره تماس، آدرس ایمیل و آدرس پستی شما دریافت می‌شود. همچنین سیستم به صورت خودکار اطلاعاتی مانند نوع مرورگر، آدرس IP و صفحات بازدید شده را جهت بهینه‌سازی تجربه کاربری (UX) در سیستم ثبت می‌کند. 
              هیچ‌گونه اطلاعات بانکی یا رمز دوم در سرورهای ما ذخیره نمی‌شود و تمام تراکنش‌ها در بستر امن درگاه‌های بانکی (شاپرک) انجام می‌پذیرد.
            </p>
          </div>

          {/* Tall Card - Security */}
          <div className="md:col-span-1 md:row-span-2 bg-gradient-to-br from-violet-600 to-fuchsia-600 dark:from-violet-900 dark:to-fuchsia-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -bottom-10 -left-10 text-white/10 group-hover:scale-110 group-hover:text-white/20 transition-all duration-500">
              <Fingerprint className="w-48 h-48" />
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">امنیت در سطح سازمانی</h2>
              <p className="text-white/80 leading-relaxed text-sm flex-grow">
                سرورهای اکستیم از پروتکل‌های رمزنگاری پیشرفته (SSL/TLS) بهره می‌برند. اطلاعات هویتی و پسوردهای شما با استفاده از الگوریتم‌های درهم‌سازی (Hashing) قوی مانند bcrypt محافظت شده و حتی پرسنل اکستیم نیز به آن‌ها دسترسی ندارند. ما تضمین می‌کنیم که داده‌های شما در برابر حملات سایبری مصون بماند.
              </p>
            </div>
          </div>

          {/* Square Card - How we use it */}
          <div className="md:col-span-1 bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">نحوه استفاده</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              اطلاعات شما صرفاً برای پردازش سفارشات، ارسال کالا، اطلاع‌رسانی وضعیت سفارش، و بهبود کیفیت خدمات مورد استفاده قرار می‌گیرد. ما به هیچ عنوان این داده‌ها را به شرکت‌های تبلیغاتی یا اشخاص ثالث نمی‌فروشیم.
            </p>
          </div>

          {/* Square Card - Cookies */}
          <div className="md:col-span-1 bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-400">
                <Cookie className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">سیاست کوکی‌ها</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              برای حفظ نشست کاربری (Login Session) و ارائه سبد خرید بهینه، اکستیم از کوکی‌های ایمن (Secure Cookies) استفاده می‌کند. این کوکی‌ها حاوی هیچگونه اطلاعات حساس نیستند و مرورگر شما آن‌ها را کنترل می‌کند.
            </p>
          </div>

        </div>

        {/* Footer Info / Data Rights */}
        <div className="mt-6 bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Server className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">حقوق قانونی شما</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              شما به عنوان کاربر اکستیم حق دارید در هر زمان درخواست کنید که یک کپی از اطلاعاتتان برایتان ارسال شود و یا اطلاعات حساب کاربریتان به طور کامل از سرورهای ما حذف (Wipe) گردد.
            </p>
          </div>
          <a href="mailto:privacy@extim.com" className="shrink-0 px-8 py-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors">
            ارسال درخواست حذف
          </a>
        </div>
        
      </div>
    </main>
  );
}
