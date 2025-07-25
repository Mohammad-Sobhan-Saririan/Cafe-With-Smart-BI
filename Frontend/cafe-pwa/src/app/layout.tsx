import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { AuthInitializer } from '@/components/AuthInitializer'; // Import it
import './globals.css';
import { AppContent } from '@/components/AppContent'; // 1. Import AppContent
import { Toaster } from "@/components/ui/sonner";
import { NotificationListener } from '@/components/NotificationListener';
import localFont from 'next/font/local'; // 1. Import 'localFont'

// YekanBakhFaNum-Black.woff
// YekanBakhFaNum-Bold.woff
// YekanBakhFaNum-ExtraBlack.woff
// YekanBakhFaNum-ExtraBold.woff
// YekanBakhFaNum-Light.woff
// YekanBakhFaNum-Regular.woff
// YekanBakhFaNum-SemiBold.woff

const yekanBakhFaNum = localFont({
  src: [
    {
      // The path is relative from this file to your font file
      path: '../assets/fonts/YekanBakhFaNum-Regular.woff',
      weight: '400', // Normal weight
      style: 'normal',
    },

  ],
  display: 'swap', // Use 'swap' for better performance
  variable: '--font-yekan-bakh-fa-num', // Assign a unique CSS variable
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "RASA Cafe",
  description: "Cafe for RASA Motors",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning={true} className={`${yekanBakhFaNum.variable}`}>
      <body>
        {/* 2. Add the loader here with some custom styling */}
        {/* <NextTopLoader
          color="#4f46e5" // An indigo color that matches our theme
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false} // We don't need the big circular spinner
          easing="ease"
          speed={200}
          shadow="0 0 10px #4f46e5,0 0 5px #4f46e5"
        /> */}
        <Toaster />
        <AuthInitializer />
        <NotificationListener />
        <AppContent>
          {children}
        </AppContent>
      </body >
    </ html >
  );
}
