"use client";

import Link from "next/link";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Hide footer in admin panel
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full border-t border-black/5 dark:border-white/10 bg-background/50 backdrop-blur-xl transition-colors duration-300 mt-20">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
                EXTIM
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              اکستیم، تجربه‌ای نوین در خرید آنلاین. ما با ارائه بهترین محصولات و خدمات، سعی در جلب رضایت شما داریم. تضمین اصالت کالا و پشتیبانی ۲۴ ساعته.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-violet-100 dark:bg-white/5 flex items-center justify-center text-violet-600 dark:text-violet-400 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all shadow-sm hover:shadow-violet-500/25">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-violet-100 dark:bg-white/5 flex items-center justify-center text-violet-600 dark:text-violet-400 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all shadow-sm hover:shadow-violet-500/25">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-violet-100 dark:bg-white/5 flex items-center justify-center text-violet-600 dark:text-violet-400 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all shadow-sm hover:shadow-violet-500/25">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-violet-100 dark:bg-white/5 flex items-center justify-center text-violet-600 dark:text-violet-400 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all shadow-sm hover:shadow-violet-500/25">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white relative inline-block">
              دسترسی سریع
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "محصولات جدید", href: "/products?sort=newest" },
                { name: "تخفیف‌ها و پیشنهادها", href: "/offers" },
                { name: "پیگیری سفارش", href: "/profile/orders" },
                { name: "وبلاگ آموزشی", href: "/blog" },
                { name: "درباره ما", href: "/about" },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400/50 shrink-0"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white relative inline-block">
              خدمات مشتریان
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "سوالات متداول (FAQ)", href: "/faq" },
                { name: "شرایط و قوانین", href: "/terms" },
                { name: "حریم خصوصی", href: "/privacy" },
                { name: "رویه بازگرداندن کالا", href: "/returns" },
                { name: "تماس با پشتیبانی", href: "/contact" },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400/50 shrink-0"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Trust */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white relative inline-block">
              ارتباط با ما
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">تهران، خیابان ولیعصر، بالاتر از میدان ونک، مجتمع تجاری اطلس، طبقه ۵، واحد ۵۰۲</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                <span dir="ltr" className="font-medium">۰۲۱ - ۸۸۸۸ ۸۸۸۸</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                <span dir="ltr" className="font-medium">support@extim.com</span>
              </li>
            </ul>
            
            <div className="pt-2 flex items-center gap-3">
              <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/10 p-2 hover:shadow-violet-500/20 transition-all group cursor-pointer">
                <div className="text-center">
                  <div className="text-[10px] font-bold text-gray-400 group-hover:text-violet-500 transition-colors">نماد اعتماد</div>
                </div>
              </div>
              <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/10 p-2 hover:shadow-violet-500/20 transition-all group cursor-pointer">
                <div className="text-center">
                  <div className="text-[10px] font-bold text-gray-400 group-hover:text-violet-500 transition-colors">ساماندهی</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/5 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-right">
            تمامی حقوق این سایت متعلق به <span className="text-violet-600 dark:text-violet-400 font-bold">EXTIM</span> می‌باشد. © {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-8 w-12 bg-gray-200 dark:bg-white/10 rounded-md flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-black/5 dark:border-white/10">شتاب</div>
            <div className="h-8 w-14 bg-gray-200 dark:bg-white/10 rounded-md flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-black/5 dark:border-white/10">زرین‌پال</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
