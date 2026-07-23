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

  const configEvent = config.events.find(e => e.slug === event.slug);
  const rubric = configEvent?.rubric || event.rubric || [];

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-6 animate-slide-up">
      <Link href={`/events/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-onyx transition-colors mb-8">
        <ArrowLeft size={14} /> Back to {event.name}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-onyx tracking-tight">
          Score: {school.name}
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
