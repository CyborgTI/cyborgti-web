// cyborgti-web/src/app/layout.tsx
import "./globals.css";
import { Electrolize } from "next/font/google";
import type { Metadata, Viewport } from "next";

import { TopTicker } from "@/components/home/TopTicker";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { CartNoticeHost } from "@/components/common/CartNoticeHost";

const electrolize = Electrolize({
  subsets: ["latin"],
  variable: "--font-electrolize",
  weight: ["400"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070A12",
};

const siteUrl = "https://cyborgti.com";
const siteName = "CyborgTI";
const description =
  "Plataforma de cursos online certificados en networking, ciberseguridad y programación.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "CyborgTI | Cursos de Tecnología y Ciberseguridad",
    template: "%s | CyborgTI",
  },
  description,

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },

  manifest: "/manifest.webmanifest",

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: "CyborgTI | Cursos de Tecnología y Ciberseguridad",
    description,
    locale: "es_PE",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "CyborgTI",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CyborgTI | Cursos de Tecnología y Ciberseguridad",
    description,
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${electrolize.variable} dark`}>
      <body className="scrollbar-thin font-sans">
        <TopTicker />
        <Navbar />
        {children}
        <Footer />
        <CartNoticeHost />
      </body>
    </html>
  );
}
