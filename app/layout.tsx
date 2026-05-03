import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  Noto_Sans_Arabic,
} from "next/font/google";
import { StoreProviders } from "@/components/StoreProviders";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yassien Fashion",
  description: "Curated apparel and accessories — elevated everyday style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${serif.variable} ${arabic.variable} min-h-screen font-sans antialiased`}
      >
        <StoreProviders>{children}</StoreProviders>
      </body>
    </html>
  );
}
