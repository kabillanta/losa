import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ScoringForm } from "@/components/ScoringForm";
import config from "../../../../../../../events-config.json";

export const revalidate = 0;

export default async function ScoreSchoolPage({ 
  params 
}: { 
  params: Promise<{ slug: string; school_id: string; team_id: string }> 
}) {
  const { slug, school_id, team_id } = await params;

  // Fetch Event
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  // Fetch School
  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", school_id)
    .single();

  if (!school) notFound();

  // Fetch existing scores for this team
  const { data: existingScores } = await supabase
    .from("scores")
    .select("*")
    .eq("event_id", event.id)
    .eq("team_id", team_id);

  // Fetch enrollments to compute Lot Number anonymization if needed
  const { data: students } = await supabase.from("students").select("id").eq("school_id", school_id);
  const studentIds = students?.map(s => s.id) || [];
  
  const { data: enrollments } = await supabase
    .from("event_enrollments")
    .select("team_id")
    .eq("event_slug", slug)
    .in("student_id", studentIds);

  const uniqueTeams = Array.from(new Set(enrollments?.map(e => e.team_id || "default"))).sort((a, b) => a.localeCompare(b));
  
  let displayName = school.name;
  if (school.lot_number) {
    displayName = `Lot ${school.lot_number}`;
    if (uniqueTeams.length > 1) {
      const index = uniqueTeams.indexOf(team_id);
      if (index !== -1) {
        displayName += `_${String.fromCharCode(65 + index)}`;
      }
    }
  }

  const configEvent = config.events.find(e => e.slug === event.slug);
  const rubric = configEvent?.rubric || event.rubric || [];

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-6 animate-slide-up">
      <Link href={`/events/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-onyx transition-colors mb-8">
        <ArrowLeft size={14} /> Back to {event.name}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-onyx tracking-tight">
          Score: {displayName}
        </h1>
        <p className="text-taupe mt-2">
          Evaluating <span className="font-semibold text-onyx">Team</span> for <span className="font-semibold text-onyx">{event.name}</span>
        </p>
      </div>

      <ScoringForm 
        eventId={event.id}
        schoolId={school.id}
        teamId={team_id}
        eventSlug={event.slug}
        rubric={rubric}
        existingScores={existingScores || []}
      />
    </div>
  );
}
