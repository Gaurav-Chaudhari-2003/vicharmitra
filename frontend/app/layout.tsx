import "./globals.css";
import React from "react";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: "Vicharmitra AI",
  description: "AI-Powered Digital Library for students and researchers — grounded, citation-backed answers from your own books.",
  icons: {
    icon: [
      { url: "/vicharmitra-logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/vicharmitra-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/vicharmitra-icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className="bg-canvas min-h-screen text-text-main antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
