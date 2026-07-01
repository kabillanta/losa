import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/app/auth/actions";
import { SidebarNav } from "@/components/SidebarNav";

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

        <SidebarNav />

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
