"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  
  if (pathname === "/admin/leaderboard") {
    return null;
  }

  return (
    <footer className="w-full text-center py-6 text-xs text-gray-400 border-t border-gray-200 mt-auto bg-gray-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10">
        <span>&copy; {new Date().getFullYear()} LOSA 2K26 </span>
      </div>
    </footer>
  );
}
