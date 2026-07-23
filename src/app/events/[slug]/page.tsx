import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, ShieldAlert } from "lucide-react";
import { fetchAllRows } from "@/lib/utils";
import config from "../../../../events-config.json";
import { BulkScoringTable } from "@/components/BulkScoringTable";

export const revalidate = 0;

export default async function EventSchoolSelection({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event) {
    notFound();
  }

  // Fetch schools, enrollments, and students to determine which schools are participating
  const [schoolsRes, allEnrollments, allStudents] = await Promise.all([
    supabase.from("schools").select("*").order("name"),
    fetchAllRows(supabase, "event_enrollments", "student_id, event_slug, team_id"),
    fetchAllRows(supabase, "students", "id, school_id, name")
  ]);

  const allSchools = schoolsRes.data || [];
  const enrollments = allEnrollments.filter((e: any) => e.event_slug === slug) || [];
  const students = allStudents || [];

  // Map student_id -> school_id and name
  const studentToSchool = new Map(students.map((s: any) => [s.id, s.school_id]));
  const studentToName = new Map(students.map((s: any) => [s.id, s.name]));

  // Build a list of unique teams
  const participatingTeams = new Map<string, { schoolId: string, teamId: string, schoolName: string, teacherName: string, studentNames: string[], lotNumber: number | null }>();

  enrollments.forEach((e: any) => {
    const schoolId = studentToSchool.get(e.student_id);
    const teamId = e.team_id || e.student_id; // fallback if no team_id
    if (schoolId) {
      const school = allSchools.find(s => s.id === schoolId);
      if (school) {
        if (!participatingTeams.has(teamId)) {
          participatingTeams.set(teamId, { 
            schoolId, 
            teamId, 
            schoolName: school.name, 
            teacherName: school.teacher_name, 
            studentNames: [],
            lotNumber: school.lot_number
          });
        }
        const sName = studentToName.get(e.student_id);
        if (sName) {
          participatingTeams.get(teamId)!.studentNames.push(sName);
        }
      }
    }
  });

  // Group by school to determine if we need suffixes
  const schoolTeamCount = new Map<string, number>();
  const teamsRaw = Array.from(participatingTeams.values()).sort((a, b) => a.teamId.localeCompare(b.teamId));
  
  teamsRaw.forEach(t => {
    schoolTeamCount.set(t.schoolId, (schoolTeamCount.get(t.schoolId) || 0) + 1);
  });

  const schoolTeamIndex = new Map<string, number>();

  const teams = teamsRaw.map(t => {
    let displayName = t.schoolName;
    if (t.lotNumber) {
       displayName = `Lot ${t.lotNumber}`;
       const totalTeamsForSchool = schoolTeamCount.get(t.schoolId) || 1;
       if (totalTeamsForSchool > 1) {
          const currentIndex = schoolTeamIndex.get(t.schoolId) || 0;
          const suffix = String.fromCharCode(65 + currentIndex); // A, B, C
          displayName = `Lot ${t.lotNumber}_${suffix}`;
          schoolTeamIndex.set(t.schoolId, currentIndex + 1);
       }
    }
    
    return {
      ...t,
      schoolName: displayName
    };
  }).sort((a, b) => {
    // Sort by Lot Number numerically if possible
    const aMatch = a.schoolName.match(/Lot (\d+)/);
    const bMatch = b.schoolName.match(/Lot (\d+)/);
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]) || a.schoolName.localeCompare(b.schoolName);
    }
    return a.schoolName.localeCompare(b.schoolName);
  });

  // Fetch existing scores to see who has been judged (and to prefill bulk table)
  const { data: scores } = await supabase
    .from("scores")
    .select("*")
    .eq("event_id", event.id);

  const scoreCounts = new Map<string, number>();
  scores?.forEach(s => {
    if (s.team_id) {
      scoreCounts.set(s.team_id, (scoreCounts.get(s.team_id) || 0) + 1);
    }
  });

  const configEvent = config.events.find(e => e.slug === event.slug);
  const totalJudges = configEvent?.judges?.length || 1;

  return (
    <div className="w-full max-w-[95%] xl:max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-6 animate-slide-up">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-onyx transition-colors mb-6 md:mb-8">
        <ArrowLeft size={14} /> Back to Events
      </Link>

      <div className="mb-10 pb-8 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-onyx tracking-tight">
          {event.name}
        </h1>
        <p className="text-taupe mt-3">{event.description}</p>
      </div>

      <BulkScoringTable 
        eventId={event.id}
        eventSlug={event.slug}
        rubric={configEvent?.rubric || []}
        teams={teams}
        judges={configEvent?.judges || []}
        existingScores={scores || []}
      />

      <div className="mt-20 pt-10 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-onyx mb-2 flex items-center gap-2">
          <ShieldAlert className="text-amber-500" size={20} />
          Fallback: Individual Team Scoring
        </h2>
        <p className="text-taupe text-sm mb-6">
          If you need to score a single team manually or fix a specific issue, you can still use the individual team pages below.
        </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team, index) => {
          // If there are multiple teams for the same school, we should number them.
          // Let's count how many teams belong to this school in total.
          const schoolTeams = teams.filter(t => t.schoolId === team.schoolId);
          const teamIndex = schoolTeams.findIndex(t => t.teamId === team.teamId) + 1;
          const displaySuffix = schoolTeams.length > 1 ? ` (Team ${teamIndex})` : "";
          
          const scoreCount = scoreCounts.get(team.teamId) || 0;
          const isFullyScored = scoreCount >= totalJudges;
          const isPartiallyScored = scoreCount > 0 && scoreCount < totalJudges;
          const isScored = isFullyScored || isPartiallyScored;

          return (
            <Link 
              key={team.teamId}
              href={`/events/${event.slug}/score/${team.schoolId}/${team.teamId}`}
              className={`flex items-center justify-between p-5 rounded-xl border transition-all ${
                isFullyScored 
                  ? "bg-gray-50 border-gray-200 hover:border-gray-300" 
                  : isPartiallyScored
                    ? "bg-yellow-50/30 border-yellow-200 hover:border-yellow-400"
                    : "bg-white border-gray-200 hover:border-onyx hover:shadow-sm"
              }`}
            >
              <div>
                <h3 className={`font-semibold ${isScored ? "text-taupe" : "text-onyx"}`}>
                  {team.schoolName}{displaySuffix}
                </h3>
                {team.studentNames.length > 0 && (
                  <p className="text-sm text-taupe mt-1.5 leading-snug">
                    {team.studentNames.join(", ")}
                  </p>
                )}
                {team.teacherName && (
                  <p className="text-xs text-gray-400 mt-2">Rep: {team.teacherName}</p>
                )}
              </div>
              
              {isFullyScored ? (
                <span className="text-xs font-medium bg-green-100 text-green-800 px-2.5 py-1 rounded-full border border-green-200 whitespace-nowrap">
                  Evaluated
                </span>
              ) : isPartiallyScored ? (
                <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full border border-yellow-200 whitespace-nowrap">
                  {scoreCount}/{totalJudges} Evaluated
                </span>
              ) : (
                <div className="text-onyx bg-gray-50 p-2 rounded-full">
                  <Edit3 size={16} />
                </div>
              )}
            </Link>
          );
        })}
      </div>
      </div>
    </div>
  );
}
