"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function submitScore(formData: FormData) {
  const eventId = formData.get("eventId") as string;
  const schoolId = formData.get("schoolId") as string;
  const eventSlug = formData.get("eventSlug") as string;
  const teamId = formData.get("teamId") as string;
  const judgeName = formData.get("judgeName") as string;
  
  if (!judgeName || judgeName.trim() === "") {
    return { error: "Judge name is required." };
  }

  // Extract rubric scores
  const rubricScores: Record<string, number> = {};
  let totalScore = 0;

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("score_")) {
      const criteriaId = key.replace("score_", "");
      const points = parseInt(value as string, 10);
      if (!isNaN(points)) {
        rubricScores[criteriaId] = points;
        totalScore += points;
      }
    }
  }

  const { error } = await supabaseAdmin.from("scores").upsert({
    event_id: eventId,
    school_id: schoolId,
    team_id: teamId,
    judge_name: judgeName,
    rubric_scores: rubricScores,
    total_score: totalScore
  }, {
    onConflict: 'event_id, school_id, team_id, judge_name'
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect back to the event school list
  redirect(`/events/${eventSlug}`);
}
