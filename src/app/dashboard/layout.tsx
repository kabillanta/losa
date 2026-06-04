import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import config from "../../../events-config.json";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { logout } from "@/app/auth/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebase_uid")?.value;

  if (!firebaseUid) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("firebase_uid", firebaseUid)
    .single();

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 md:w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-bold text-onyx truncate" title={school?.name || "Your School"}>
            {school?.name || "Your School"}
          </h2>
          <p className="text-sm text-taupe mt-1">Event Registration</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Object.entries(
            config.events.reduce((acc, event) => {
              const cat = (event as any).category || "Other Events";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(event);
              return acc;
            }, {} as Record<string, typeof config.events>)
          ).map(([category, categoryEvents]) => {
            const hasSubtitle = category.includes(" (");
            const [mainTitle, rawSubtitle] = category.split(" (");
            const subtitle = hasSubtitle ? "(" + rawSubtitle : "";

            return (
            <details key={category} className="group" open>
              <summary className="flex items-start justify-between cursor-pointer list-none px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors select-none">
                <div className="flex flex-col gap-1 w-full pr-2">
                  <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider leading-tight">
                    {mainTitle}
                  </span>
                  {subtitle && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-tight">
                      {subtitle}
                    </span>
                  )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-open:rotate-180 transition-transform duration-200 mt-0.5 shrink-0">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </summary>
              <div className="mt-2 space-y-1 mb-2">
                {categoryEvents.map((event) => (
                  <Link
                    key={event.slug}
                    href={`/dashboard/${event.slug}`}
                    className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-onyx hover:bg-gray-100 transition-colors truncate ml-2"
                  >
                    {event.name}
                  </Link>
                ))}
              </div>
            </details>
          )})}
        </div>

        <div className="p-4 border-t border-gray-200 shrink-0">
          <form action={logout}>
            <button className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 w-full px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
              <LogOut size={16} />
              Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
