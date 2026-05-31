import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { OfflineSync } from "@/components/OfflineSync";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
        className={`${inter.className} antialiased min-h-screen bg-gray-50 selection:bg-gold/20 selection:text-onyx`}
      >
        <header className="bg-white sticky top-0 z-30 border-b border-gray-200">
          <div className="mx-auto flex items-center justify-between h-16 px-6 lg:px-10">
            <img
              src="/logo.png"
              alt="LOSA"
              className="h-9 w-auto object-contain"
            />
            <OfflineSync />
          </div>
        </header>
        <main className="mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
