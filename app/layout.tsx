import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fatemehkashfi.dev"),
  title: {
    default: "Fatemeh Kashfi — Senior Frontend Engineer",
    template: "%s — Fatemeh Kashfi",
  },
  description:
    "Senior Frontend Engineer building high-performance financial and enterprise products with React, Next.js, and TypeScript.",
  keywords: [
    "Senior Frontend Engineer",
    "React",
    "Next.js",
    "TypeScript",
    "Fintech",
    "Frontend Architecture",
  ],
  authors: [{ name: "Fatemeh Kashfi" }],
  creator: "Fatemeh Kashfi",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Fatemeh Kashfi — Senior Frontend Engineer",
    description:
      "Engineering complex products into clear, fast, dependable experiences.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fatemeh Kashfi — Senior Frontend Engineer",
    description:
      "Engineering complex products into clear, fast, dependable experiences.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#12141b" },
    { media: "(prefers-color-scheme: light)", color: "#e9e4dc" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
