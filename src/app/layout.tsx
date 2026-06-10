import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { OfflineSync } from "@/components/OfflineSync";
import { HelpButton } from "@/components/HelpButton";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const space = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

export const viewport: Viewport = {
  themeColor: "#1C1C1C",
};

export const metadata: Metadata = {
  title: "LOSA Attendance",
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
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 shadow-sm">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between h-16 px-6 lg:px-10">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="LOSA Logo"
                className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <h1
                className={`${space.className} hidden sm:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-onyx to-gray-500 tracking-wider uppercase group-hover:opacity-80 transition-opacity`}
              >
                LOSA <span className="text-gold">2K26</span>
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <HelpButton />
              <OfflineSync />
            </div>
          </div>
        </header>
        <main className="w-full flex-1">{children}</main>

        <footer className="w-full text-center py-6 text-xs text-gray-400 border-t border-gray-200 mt-auto bg-gray-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10">
            <span>&copy; {new Date().getFullYear()} LOSA 2K26 </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
