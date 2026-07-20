import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const space = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

export const viewport: Viewport = {
  themeColor: "#1C1C1C",
};

export const metadata: Metadata = {
  title: "LOSA 2K26",
  description: "Group check-in for school events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased min-h-screen bg-gray-50 selection:bg-gold/20 selection:text-onyx flex flex-col`}
      >
        <SiteHeader spaceClassName={space.className} />
        <main className="w-full flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
