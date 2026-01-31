import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryMarquee from "@/components/CategoryMarquee";
import WhatsAppButton from "@/components/WhatsAppButton";
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
  title: "STN Golden Healthy Foods - Traditional Oils & Spices",
  description: "Authentic traditional oils, spices, and healthy products from STN Golden Healthy Foods",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Toaster position="top-center" richColors closeButton />
          <Header />
          <CategoryMarquee />
          <main className="min-h-screen min-w-0 overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
