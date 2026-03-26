import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import DevPerformanceMeasureGuard from "@/components/DevPerformanceMeasureGuard";
import SessionProvider from "@/components/SessionProvider";
import { auth } from "@/auth";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "PGH Local Grocers",
  description:
    "Discover what nearby Pittsburgh grocery stores have in stock before you leave home.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {process.env.NODE_ENV === "development" ? <DevPerformanceMeasureGuard /> : null}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black"
        >
          Skip to main content
        </a>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
