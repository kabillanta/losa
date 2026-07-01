"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import config from "../../events-config.json";

export function SidebarNav() {
  const pathname = usePathname();

  // Group events by category
  const categories = config.events.reduce((acc, event) => {
    const cat = (event as any).category || "Other Events";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(event);
    return acc;
  }, {} as Record<string, typeof config.events>);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {Object.entries(categories).map(([category, categoryEvents]) => {
        const hasSubtitle = category.includes(" (");
        const [mainTitle, rawSubtitle] = category.split(" (");
        const subtitle = hasSubtitle ? "(" + rawSubtitle : "";

        const getCategoryStyles = (catName: string) => {
          if (catName.includes("Tiny Tots")) return { bg: "bg-pink-50 hover:bg-pink-100", title: "text-pink-800", sub: "text-pink-600/80", icon: "text-pink-400" };
          if (catName.includes("Energetic Kids")) return { bg: "bg-orange-50 hover:bg-orange-100", title: "text-orange-800", sub: "text-orange-600/80", icon: "text-orange-400" };
          if (catName.includes("Young Visionaries")) return { bg: "bg-emerald-50 hover:bg-emerald-100", title: "text-emerald-800", sub: "text-emerald-600/80", icon: "text-emerald-400" };
          if (catName.includes("Emerging Stars")) return { bg: "bg-blue-50 hover:bg-blue-100", title: "text-blue-800", sub: "text-blue-600/80", icon: "text-blue-400" };
          if (catName.includes("Teen Trailblazers")) return { bg: "bg-indigo-50 hover:bg-indigo-100", title: "text-indigo-800", sub: "text-indigo-600/80", icon: "text-indigo-400" };
          if (catName.includes("Guru Dhakshina")) return { bg: "bg-amber-50 hover:bg-amber-100", title: "text-amber-800", sub: "text-amber-600/80", icon: "text-amber-400" };
          return { bg: "bg-gray-50 hover:bg-gray-100", title: "text-gray-800", sub: "text-gray-500", icon: "text-gray-400" };
        };
        
        const styles = getCategoryStyles(category);

        // Determine if any link inside this category is currently active
        const isActiveCategory = categoryEvents.some(event => pathname === `/dashboard/${event.slug}`);

        return (
          <details key={category} className="group" open={isActiveCategory ? true : undefined}>
            <summary className={`flex items-start justify-between cursor-pointer list-none px-4 py-3 rounded-xl transition-colors select-none ${styles.bg}`}>
              <div className="flex flex-col gap-1 w-full pr-2">
                <span className={`text-xs font-extrabold uppercase tracking-wider leading-tight ${styles.title}`}>
                  {mainTitle}
                </span>
                {subtitle && (
                  <span className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${styles.sub}`}>
                    {subtitle}
                  </span>
                )}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${styles.icon} group-open:rotate-180 transition-transform duration-200 mt-0.5 shrink-0`}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </summary>
            
            <div className="mt-2 space-y-1 mb-2">
              {categoryEvents.map((event) => {
                const isActive = pathname === `/dashboard/${event.slug}`;
                
                return (
                  <Link
                    key={event.slug}
                    href={`/dashboard/${event.slug}`}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors truncate ml-2 ${
                      isActive 
                        ? "bg-onyx text-white shadow-sm" 
                        : "text-gray-600 hover:text-onyx hover:bg-gray-100"
                    }`}
                  >
                    {event.name}
                  </Link>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
