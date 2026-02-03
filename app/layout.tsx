import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STN GOLDEN HEALTHY FOODS - Traditional Oils & Spices",
  description: "Authentic traditional oils, spices, and healthy products from STN GOLDEN HEALTHY FOODS",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-w-0 overflow-x-hidden`}
      >
        <AuthProvider>
          <Toaster position="top-center" richColors closeButton />
          <Header />
          <main className="min-h-screen min-w-0 overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <ScrollToTop />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
