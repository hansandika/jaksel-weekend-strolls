import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { getMetadataBase } from "@/lib/site-url";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Jaksel Weekend Strolls",
    template: "%s · Jaksel Weekend Strolls",
  },
  description:
    "Finite Sat/Sun food and café strolls for Jakarta Selatan, with TikTok proof and Maps walking routes.",
  applicationName: "Jaksel Weekend Strolls",
  appleWebApp: {
    capable: true,
    title: "Jaksel Strolls",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "en_ID",
    siteName: "Jaksel Weekend Strolls",
    title: "Jaksel Weekend Strolls",
    description:
      "Finite Sat/Sun food and café strolls for Jakarta Selatan, with TikTok proof and Maps walking routes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaksel Weekend Strolls",
    description:
      "Finite Sat/Sun food and café strolls for Jakarta Selatan, with TikTok proof and Maps walking routes.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1A1614",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-coral focus:px-3 focus:py-2 focus:text-ink"
        >
          Skip to strolls
        </a>
        {children}
      </body>
    </html>
  );
}
