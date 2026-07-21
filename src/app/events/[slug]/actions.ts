"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type BulkScoreInput = {
  eventId: string;
  schoolId: string;
  teamId: string;
  judgeName: string;
  rubricScores: Record<string, number>;
  totalScore: number;
};

export async function submitBulkScores(scores: BulkScoreInput[], eventSlug: string) {
  if (!scores || scores.length === 0) {
    return { error: "No scores provided." };
  }

  // Format data for Supabase upsert
  const upsertData = scores.map(score => ({
    event_id: score.eventId,
    school_id: score.schoolId,
    team_id: score.teamId,
    judge_name: score.judgeName,
    rubric_scores: score.rubricScores,
    total_score: score.totalScore,
  }));

  // Upsert all scores in one query
  const { error } = await supabase.from("scores").upsert(upsertData, {
    onConflict: 'event_id, school_id, team_id, judge_name'
  });

  if (error) {
    return { error: error.message };
  }

  // Revalidate the page so the server components fetch fresh data
  revalidatePath(`/events/${eventSlug}`);
  revalidatePath('/admin/leaderboard'); // Also revalidate leaderboard to be safe

  return { success: true };
}
