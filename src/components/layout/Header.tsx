"use client";

import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCart } from "@/store/CartContext";
import { useEffect, useState } from "react";
import { logoutUser } from "@/actions/auth";

const navLinks = [
  { name: "فروشگاه", href: "/products" },
  { name: "دسته‌بندی‌ها", href: "/categories" },
  { name: "پیشنهادهای ویژه", href: "/offers" },
  { name: "درباره ما", href: "/about" },
];

export function Header({ session }: { session: any }) {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/10 bg-background/70 backdrop-blur-lg transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Right Section: Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
              EXTIM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors py-2 group relative"
              >
                {link.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Left Section: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          
          <Link href="/cart" className="p-2 text-foreground/80 hover:text-violet-600 dark:hover:text-violet-400 transition-colors relative" aria-label="سبد خرید">
            <ShoppingCart className="w-5 h-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg">
                {totalItems}
              </span>
            )}
          </Link>
          
          {session ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <Link href="/profile" className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-400">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline text-gray-200">سلام، {session.name.split(' ')[0]}</span>
              </Link>
              <div className="w-px h-4 bg-white/10 mx-1"></div>
              <form action={logoutUser}>
                <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">خروج</button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] text-sm font-medium">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">حساب کاربری</span>
            </Link>
          )}
        </div>
        
      </div>
    </header>
  );
}
