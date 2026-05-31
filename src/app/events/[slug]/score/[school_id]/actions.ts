"use server";

import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function submitScore(formData: FormData) {
  const eventId = formData.get("eventId") as string;
  const schoolId = formData.get("schoolId") as string;
  const eventSlug = formData.get("eventSlug") as string;
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

  const { error } = await supabase.from("scores").insert({
    event_id: eventId,
    school_id: schoolId,
    judge_name: judgeName,
    rubric_scores: rubricScores,
    total_score: totalScore
  });

  if (error) {
    // Check if it's a unique constraint violation (judge already scored)
    if (error.code === '23505') {
      return { error: "You have already submitted scores for this school." };
    }
    return { error: error.message };
  }

  // Redirect back to the event school list
  redirect(`/events/${eventSlug}`);
}
