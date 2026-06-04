import { createClient } from "@/lib/supabase/server";
import config from "../../../../events-config.json";
import { notFound } from "next/navigation";
import EventForm from "./EventForm";

export default async function EventPage({
  params,
}: {
  params: Promise<{ event_slug: string }>;
}) {
  const { event_slug } = await params;

  const event = config.events.find((e) => e.slug === event_slug);
  if (!event) {
    notFound();
  }

  // Fetch current enrollments for this event
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebase_uid")?.value;

  let currentTeams: { name: string; classDetails: string; admissionNumber: string }[][] = [];
  const supabase = await createClient();

  if (firebaseUid) {
    const { data: school } = await supabase
      .from("schools")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (school) {
      // Find students enrolled in this event from this school
      const { data: enrollments } = await supabase
        .from("event_enrollments")
        .select(`
          team_id,
          students!inner(id, name, class_details, admission_number, school_id)
        `)
        .eq("event_slug", event_slug)
        .eq("students.school_id", school.id)
        .order("team_id");

      if (enrollments && enrollments.length > 0) {
        // Group by team_id
        const teamsMap: Record<string, { name: string; classDetails: string; admissionNumber: string }[]> = {};
        const unassignedTeam: { name: string; classDetails: string; admissionNumber: string }[] = []; // for old data

        enrollments.forEach((e: any) => {
          const studentObj = {
            name: e.students.name || "",
            classDetails: e.students.class_details || "",
            admissionNumber: e.students.admission_number || ""
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

  // Define max_teams fallback
  const maxTeams = (event as any).max_teams || 1;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-onyx mb-2">{event.name}</h1>
        <p className="text-taupe">{event.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100">
            Team Size: {event.min_size} to {event.max_size}{" "}
            {event.max_size === 1 ? "Participant" : "Participants"}
          </div>
          <div className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg border border-purple-100">
            Max Entries: {maxTeams} {maxTeams === 1 ? "Team" : "Teams"} Allowed
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        <EventForm
          eventSlug={event.slug}
          minSize={event.min_size}
          maxSize={event.max_size}
          maxTeams={maxTeams}
          initialTeams={currentTeams}
        />
      </div>
    </div>
  );
}
