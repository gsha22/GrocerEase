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

const appOrigin =
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(appOrigin),
  title: {
    default: "GrocerEase — Local grocery discovery",
    template: "%s · GrocerEase",
  },
  description:
    "GrocerEase connects shoppers with neighborhood grocers: fresh posts, specials, and store discovery. No cart, no checkout — visit in person.",
  applicationName: "GrocerEase",
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
