"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { OfflineSync } from "@/components/OfflineSync";
import { HelpButton } from "@/components/HelpButton";
import { CountdownTimer } from "@/components/CountdownTimer";

export function SiteHeader({ spaceClassName }: { spaceClassName: string }) {
  const pathname = usePathname();
  
  if (pathname === "/admin/leaderboard") {
    return null;
  }

  return (
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
            className={`${spaceClassName} hidden sm:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-onyx to-gray-500 tracking-wider uppercase group-hover:opacity-80 transition-opacity`}
          >
            LOSA <span className="text-gold">2K26</span>
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <CountdownTimer />
          <HelpButton />
          <OfflineSync />
        </div>
      </div>
    </header>
  );
}
