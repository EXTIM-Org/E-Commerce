import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { CartProvider } from "@/store/CartContext";
import { getSession } from "@/lib/session";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const vazirmatn = Vazirmatn({ 
  subsets: ["arabic", "latin"], 
  variable: "--font-vazirmatn",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "EXTIM E-Commerce Platform",
  description: "A high-performance, SEO-optimized e-commerce platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body className="font-vazirmatn antialiased bg-background text-foreground min-h-screen transition-colors duration-300 flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <CartProvider isLoggedIn={!!session?.userId}>
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                style: {
                  background: '#333',
                  color: '#fff',
                  fontFamily: 'var(--font-vazirmatn)',
                  borderRadius: '16px',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Header session={session} />
            <main className="flex-1 flex flex-col relative">
              {children}
            </main>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
