import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";

const hankenGrotesk = Hanken_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduResource",
  description: "Educational resources platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </head>
      <body
        className={`${hankenGrotesk.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-center" richColors />
        <SpeedInsights />

        <NextTopLoader
          color="#FFC2ED"
          initialPosition={0.08}
          crawlSpeed={200}
          height={5}
          crawl={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #FFC2ED, 0 0 5px #FFC2ED"
        />
      </body>
    </html>
  );
}
