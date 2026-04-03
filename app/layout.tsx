import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shelfmate - Your Reading Life, Together",
  description: "A private book club for people who love to read and share.",
  openGraph: {
    title: "Shelfmate",
    description: "Track what you read. Share what you love.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
