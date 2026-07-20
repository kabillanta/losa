import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import { fetchAllRows } from "@/lib/utils";
import config from "../../../../events-config.json";

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
  const participatingTeams = new Map<string, { schoolId: string, teamId: string, schoolName: string, teacherName: string, studentNames: string[] }>();

  enrollments.forEach((e: any) => {
    const schoolId = studentToSchool.get(e.student_id);
    const teamId = e.team_id || e.student_id; // fallback if no team_id
    if (schoolId) {
      const school = allSchools.find(s => s.id === schoolId);
      if (school) {
        if (!participatingTeams.has(teamId)) {
          participatingTeams.set(teamId, { schoolId, teamId, schoolName: school.name, teacherName: school.teacher_name, studentNames: [] });
        }
        const sName = studentToName.get(e.student_id);
        if (sName) {
          participatingTeams.get(teamId)!.studentNames.push(sName);
        }
      }
    }
  });

  const teams = Array.from(participatingTeams.values()).sort((a, b) => a.schoolName.localeCompare(b.schoolName));

  // Fetch existing scores to see who has been judged
  const { data: scores } = await supabase
    .from("scores")
    .select("team_id")
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
    <div className="w-full max-w-4xl mx-auto py-10 px-6 animate-slide-up">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-onyx transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Events
      </Link>

      <div className="mb-10 pb-8 border-b border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-onyx tracking-tight">
          {event.name}
        </h1>
        <p className="text-taupe mt-3">{event.description}</p>
      </div>

      <h2 className="text-lg font-semibold text-onyx mb-6">Select a Team to Score</h2>
      
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
  );
}
