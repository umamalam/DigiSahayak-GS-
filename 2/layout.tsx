import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavBar from "@/components/ConditionalNavBar";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DigiSahayak - Your Digital Companion for Government Schemes",
  description: "Aapka Digital Saathi for Every Sarkari Yojna - An initiative under Digital Empowerment Project",
  manifest: "/manifest.json",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4568F0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-white dark:bg-gray-900`}>
        <ThemeProvider>
          <LanguageProvider>
            <SessionProvider>
              <div className="min-h-screen pb-16">
                {children}
              </div>
              <ConditionalNavBar />
            </SessionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
