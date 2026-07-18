import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import { buildThemeScript } from "@/lib/theme";

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

// Runs before first paint to avoid a flash of the wrong theme: a stored
// manual choice wins, else the OS preference. Built (and unit-tested) in
// lib/theme.ts; next/script can't run this early, so it must be inline.
const themeScript = buildThemeScript();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistMono.variable} ${geistSans.variable} antialiased font-mono`}
      >
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3TLNT2Q614"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3TLNT2Q614');
          `}
        </Script>
      </body>
    </html>
  );
}
