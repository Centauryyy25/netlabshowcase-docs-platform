import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const parkinsans = localFont({
  variable: "--font-parkinsans",
  display: "swap",
  src: [
    { path: "./fonts/Parkinsans-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Parkinsans-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Parkinsans-600.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Parkinsans-700.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Ether Docs Networkers",
  description:
    "A modern web for documentation Labs Networkers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${parkinsans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
