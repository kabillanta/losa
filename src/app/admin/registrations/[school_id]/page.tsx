import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import config from "../../../../../events-config.json";
import { notFound } from "next/navigation";
import EventForm from "@/app/dashboard/[event_slug]/EventForm";
import Link from "next/link";
import { ArrowLeft, ChevronRight, LayoutDashboard } from "lucide-react";

export const revalidate = 0;

export default async function AdminSchoolRegistrations({
  params,
  searchParams,
}: {
  params: Promise<{ school_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { school_id } = await params;
  const { event: selectedEventSlug } = await searchParams;

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch school details
  const { data: school, error: schoolError } = await supabaseAdmin
    .from("schools")
    .select("id, name, teacher_name")
    .eq("id", school_id)
    .single();

  if (!school) {
    notFound();
  }

  // Group events by category for the sidebar
  const categoriesMap = new Map<string, any[]>();
  config.events.forEach((ev: any) => {
    if (!categoriesMap.has(ev.category)) {
      categoriesMap.set(ev.category, []);
    }
    categoriesMap.get(ev.category)!.push(ev);
  });

  const categories = Array.from(categoriesMap.entries()).map(([name, events]) => ({
    name,
    events,
  }));

  // Fetch data for the selected event (if any)
  let currentTeams: any[] = [];
  let selectedEvent: any = null;

  if (selectedEventSlug && typeof selectedEventSlug === "string") {
    selectedEvent = config.events.find((e: any) => e.slug === selectedEventSlug);
    
    if (selectedEvent) {
      // Find students enrolled in this event from this school
      const { data: enrollments, error: enrollError } = await supabaseAdmin
        .from("event_enrollments")
        .select(`
          team_id,
          students!inner(id, name, class_details, admission_number, school_id)
        `)
        .eq("event_slug", selectedEvent.slug)
        .eq("students.school_id", school.id)
        .order("team_id");

      if (enrollments && enrollments.length > 0) {
        // Group by team_id
        const teamsMap: Record<string, any[]> = {};
        const unassignedTeam: any[] = []; // for old data

        enrollments.forEach((e: any) => {
          const rawClassDetails = e.students.class_details || "";
          let parsedClassName = rawClassDetails;
          let parsedSection = "";
          
          if (rawClassDetails.includes(" - ")) {
            const parts = rawClassDetails.split(" - ");
            parsedClassName = parts[0];
            parsedSection = parts.slice(1).join(" - ");
          }

          const studentObj = {
            id: e.students.id,
            name: e.students.name || "",
            className: parsedClassName,
            section: parsedSection,
            admissionNumber: e.students.admission_number || "",
          };

          if (e.team_id) {
            if (!teamsMap[e.team_id]) teamsMap[e.team_id] = [];
            teamsMap[e.team_id].push(studentObj);
          } else {
            unassignedTeam.push(studentObj);
          }
        });

        currentTeams = Object.values(teamsMap);
        if (unassignedTeam.length > 0) {
          currentTeams.push(unassignedTeam);
        }
      }
    }
  }

  const maxTeams = selectedEvent?.max_teams || 1;
  const isTeacherEvent = selectedEvent?.category?.includes("Guru Dhakshina") || false;

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto animate-slide-up py-6 lg:py-10 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/registrations" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-onyx tracking-tight">
            {school.name}
          </h1>
          <p className="text-taupe mt-1">Editing registrations directly for this school.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar - Event Categories */}
        <div className="w-full lg:w-80 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-onyx flex items-center gap-2">
            <LayoutDashboard size={18} /> Event Categories
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {categories.map((cat, idx) => (
              <details key={idx} className="group border-b border-gray-100 last:border-0" open={selectedEvent?.category === cat.name}>
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors list-none [&::-webkit-details-marker]:hidden font-medium text-sm text-onyx">
                  {cat.name}
                  <ChevronRight className="transition-transform group-open:rotate-90 text-gray-400" size={16} />
                </summary>
                <div className="bg-gray-50/50 py-1">
                  {cat.events.map((ev: any) => {
                    const isActive = selectedEventSlug === ev.slug;
                    return (
                      <Link
                        key={ev.slug}
                        href={`/admin/registrations/${school.id}?event=${ev.slug}`}
                        className={`block px-8 py-2.5 text-sm transition-colors border-l-2 ${
                          isActive 
                            ? "bg-blue-50/50 border-blue-500 text-blue-700 font-semibold" 
                            : "border-transparent text-taupe hover:text-onyx hover:bg-gray-100"
                        }`}
                      >
                        {ev.name}
                      </Link>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          {selectedEvent ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              <div className="mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-bold text-onyx mb-2">{selectedEvent.name}</h2>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100">
                    {selectedEvent.min_size === 1 && selectedEvent.max_size === 1
                      ? "Individual Event"
                      : selectedEvent.min_size === selectedEvent.max_size
                        ? `Team Size: ${selectedEvent.min_size} members in the team`
                        : `Team Size: Min ${selectedEvent.min_size} members and Max ${selectedEvent.max_size} members`}
                  </div>
                  <div className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg border border-purple-100">
                    {selectedEvent.min_size === 1 && selectedEvent.max_size === 1
                      ? `Only ${maxTeams} ${maxTeams === 1 ? "person" : "people"} allowed`
                      : `Max Entries: ${maxTeams} ${maxTeams === 1 ? "Team" : "Teams"} Allowed`}
                  </div>
                </div>
              </div>

              {/* RENDER THE REUSABLE EVENT FORM AS ADMIN */}
              <EventForm
                key={selectedEvent.slug}
                eventSlug={selectedEvent.slug}
                minSize={selectedEvent.min_size}
                maxSize={selectedEvent.max_size}
                maxTeams={maxTeams}
                initialTeams={currentTeams}
                isTeacherEvent={isTeacherEvent}
                eventCategory={selectedEvent.category}
                adminSchoolId={school.id}
              />
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center h-[400px]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4 text-gray-400">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="text-lg font-semibold text-onyx mb-1">Select an Event</h3>
              <p className="text-taupe max-w-sm">
                Choose an event from the sidebar to view or edit the registrations for {school.name}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
