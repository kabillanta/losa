import { supabase } from "@/lib/supabase";
import { fetchAllRows } from "@/lib/utils";
import DisplayEngine from "./DisplayEngine";
import config from "../../../../events-config.json";

export const revalidate = 0; // Live dashboard

export default async function LeaderboardPage() {
  const [events, schools, scores, students, enrollments] = await Promise.all([
    fetchAllRows(supabase, "events"),
    fetchAllRows(supabase, "schools"),
    fetchAllRows(supabase, "scores"),
    fetchAllRows(supabase, "students"),
    fetchAllRows(supabase, "event_enrollments"),
  ]);

  // Map school IDs to School Objects for easy lookup
  const schoolMap = new Map(schools.map((s) => [s.id, s]));

  // Map students for name lookup
  const studentMap = new Map(students.map((s) => [s.id, s]));

  // 1. Event Leaderboards (Per Team, Averaged if multiple judges)
  const eventLeaderboards = events.map((event) => {
    const eventScores = scores.filter((s) => s.event_id === event.id);
    const teamTotals = new Map<string, { school: any; schoolId: string, teamId: string; totalRaw: number; judges: number; studentNames: string[] }>();

    eventScores.forEach((score) => {
      const key = score.team_id || score.school_id;
      if (!teamTotals.has(key)) {
        teamTotals.set(key, {
          school: schoolMap.get(score.school_id),
          schoolId: score.school_id,
          teamId: score.team_id,
          totalRaw: 0,
          judges: 0,
          studentNames: [],
        });
      }
      const record = teamTotals.get(key)!;
      record.totalRaw += score.total_score;
      record.judges += 1;
    });

    // Populate student names for each team
    const eventEnrollments = enrollments.filter((e) => e.event_slug === event.slug);
    Array.from(teamTotals.values()).forEach((team) => {
      const teamStudents = eventEnrollments
        .filter((e) => e.team_id === team.teamId && studentMap.has(e.student_id))
        .map((e) => studentMap.get(e.student_id).name);
      team.studentNames = teamStudents;
    });

    const configEvent = config.events.find((e) => e.slug === event.slug);
    const category = configEvent?.category || "Uncategorized";

    // Calculate Average
    const averagedLeaderboard = Array.from(teamTotals.values())
      .filter((entry) => entry.school)
      .map(entry => ({
        ...entry,
        total: entry.judges > 0 ? parseFloat((entry.totalRaw / entry.judges).toFixed(2)) : 0
      }))
      .sort((a, b) => b.total - a.total);

    return {
      event,
      category,
      leaderboard: averagedLeaderboard,
    };
  });

  // Only pass active events to display engine
  const activeEventLeaderboards = eventLeaderboards.filter(e => e.leaderboard.length > 0);

  // 2. Overall Championship (Sum of Averaged Event Scores per School)
  const overallScores = new Map<string, { school: any; total: number; judges: number }>();
  
  activeEventLeaderboards.forEach(eventData => {
    eventData.leaderboard.forEach(teamEntry => {
      if (!overallScores.has(teamEntry.schoolId)) {
        overallScores.set(teamEntry.schoolId, {
          school: teamEntry.school,
          total: 0,
          judges: 0,
        });
      }
      const record = overallScores.get(teamEntry.schoolId)!;
      // Add the averaged score of this team to the school's overall total
      record.total += teamEntry.total;
      record.judges += teamEntry.judges; 
    });
  });

  const overallLeaderboard = Array.from(overallScores.values())
    .map(entry => ({
      ...entry,
      total: parseFloat(entry.total.toFixed(2))
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <DisplayEngine 
      overallLeaderboard={overallLeaderboard} 
      eventLeaderboards={activeEventLeaderboards} 
    />
  );
}
