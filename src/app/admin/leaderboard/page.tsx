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

  // Overall Championship (Per School)
  const overallScores = new Map<string, { school: any; total: number; judges: number }>();
  
  scores.forEach((score) => {
    if (!overallScores.has(score.school_id)) {
      overallScores.set(score.school_id, {
        school: schoolMap.get(score.school_id),
        total: 0,
        judges: 0,
      });
    }
    const record = overallScores.get(score.school_id)!;
    record.total += score.total_score;
    record.judges += 1;
  });

  const overallLeaderboard = Array.from(overallScores.values())
    .filter((entry) => entry.school)
    .sort((a, b) => b.total - a.total);

  // Event Leaderboards (Per Team)
  const eventLeaderboards = events.map((event) => {
    const eventScores = scores.filter((s) => s.event_id === event.id);
    const teamTotals = new Map<string, { school: any; teamId: string; total: number; judges: number; studentNames: string[] }>();

    eventScores.forEach((score) => {
      const key = score.team_id || score.school_id;
      if (!teamTotals.has(key)) {
        teamTotals.set(key, {
          school: schoolMap.get(score.school_id),
          teamId: score.team_id,
          total: 0,
          judges: 0,
          studentNames: [], // Will populate below
        });
      }
      const record = teamTotals.get(key)!;
      record.total += score.total_score;
      record.judges += 1;
    });

    // Populate student names for each team
    const eventEnrollments = enrollments.filter((e) => e.event_slug === event.slug);
    Array.from(teamTotals.values()).forEach((team) => {
      // Find all enrollments that match this team_id
      const teamStudents = eventEnrollments
        .filter((e) => e.team_id === team.teamId && studentMap.has(e.student_id))
        .map((e) => studentMap.get(e.student_id).name);
      team.studentNames = teamStudents;
    });

    const configEvent = config.events.find((e) => e.slug === event.slug);
    const category = configEvent?.category || "Uncategorized";

    return {
      event,
      category,
      leaderboard: Array.from(teamTotals.values())
        .filter((entry) => entry.school)
        .sort((a, b) => b.total - a.total),
    };
  });

  // Only pass events that actually have some scores to the display engine, so we don't show empty events in the rotation?
  // Let's pass all events, or maybe only scored events? The user wants a display engine. Showing blank events is boring.
  // We will filter out events with 0 scores so the rotation is purely active leaderboards.
  const activeEventLeaderboards = eventLeaderboards.filter(e => e.leaderboard.length > 0);

  return (
    <DisplayEngine 
      overallLeaderboard={overallLeaderboard} 
      eventLeaderboards={activeEventLeaderboards} 
    />
  );
}
