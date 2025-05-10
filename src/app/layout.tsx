import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Menbee",
  description: "Menbee - 面接日程調整ツール",
  openGraph: {
    type: "website",
    title: "Menbee",
    description:
      "あなたのGoogleカレンダーと連携して、面接日程調整を楽にするツール",
    siteName: "Menbee",
    url: "https://menbee.vercel.app/",
    images: {
      url: "https://menbee.vercel.app/image/ogp.webp",
      type: "image/webp",
      width: 640,
      height: 360,
    },
  },
  twitter: {
    title: "Menbee",
    description:
      "あなたのGoogleカレンダーと連携して、面接日程調整を楽にするツール",
    site: "Menbee",
    images: {
      url: "https://menbee.vercel.app/image/ogp.webp",
      type: "image/webp",
      width: 640,
      height: 360,
    },
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
