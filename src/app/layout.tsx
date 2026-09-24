import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { CartProvider } from "@/store/CartContext";
import { getSession } from "@/lib/session";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import { Footer } from "@/components/layout/Footer";

const vazirmatn = Vazirmatn({ 
  subsets: ["arabic", "latin"], 
  variable: "--font-vazirmatn",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    template: "%s | فروشگاه اکستیم",
    default: "فروشگاه اینترنتی اکستیم",
  },
  description: "تجربه خریدی متفاوت با پلتفرم سریع و مدرن اکستیم",
  openGraph: {
    title: "فروشگاه اینترنتی اکستیم",
    description: "تجربه خریدی متفاوت با پلتفرم سریع و مدرن اکستیم",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "Extim Store",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Extim E-Commerce Platform",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "فروشگاه اینترنتی اکستیم",
    description: "تجربه خریدی متفاوت با پلتفرم سریع و مدرن اکستیم",
    images: ["/og-image.jpg"],
  },
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
            <Footer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
