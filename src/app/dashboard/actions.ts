"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function saveEventEnrollments(eventSlug: string, teams: string[][]) {
  const cookieStore = await cookies();
  const firebaseUid = cookieStore.get("firebase_uid")?.value;

  if (!firebaseUid) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();
  // Get the school
  const { data: school } = await supabase
    .from("schools")
    .select("id, name")
    .eq("firebase_uid", firebaseUid)
    .single();

  if (!school) {
    return { error: "School profile not found" };
  }

  // Generate a short school prefix from name (e.g., "St. Joseph's" -> "SJH")
  // Just taking first letter of each word to make it clean
  const prefix = school.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .substring(0, 3)
    .toUpperCase();

  // 1. First, delete all existing enrollments for this event for this school's students
  const { data: schoolStudents } = await supabase
    .from("students")
    .select("id")
    .eq("school_id", school.id);
  
  const allSchoolStudentIds = schoolStudents?.map(s => s.id) || [];
  if (allSchoolStudentIds.length > 0) {
    await supabase
      .from("event_enrollments")
      .delete()
      .eq("event_slug", eventSlug)
      .in("student_id", allSchoolStudentIds);
  }

  // 2. Iterate through each team
  const enrollmentsToInsert = [];

  for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
    const studentNames = teams[teamIndex];
    const validNames = studentNames.map(n => n.trim()).filter(n => n.length > 0);
    
    if (validNames.length === 0) continue;

    // e.g. SJH-FASHIONISTA-T1
    const teamId = `${prefix}-${eventSlug.toUpperCase()}-T${teamIndex + 1}`;

    for (const name of validNames) {
      // Find or create the student
      let { data: existingStudent } = await supabase
        .from("students")
        .select("id")
        .eq("school_id", school.id)
        .ilike("name", name)
        .maybeSingle();

      if (!existingStudent) {
        const { data: newStudent, error: createError } = await supabase
          .from("students")
          .insert({ school_id: school.id, name: name, is_present: false })
          .select("id")
          .single();
        
        if (createError) return { error: "Failed to create student: " + createError.message };
        existingStudent = newStudent;
      }

      if (existingStudent) {
        enrollmentsToInsert.push({
          student_id: existingStudent.id,
          event_slug: eventSlug,
          team_id: teamId
        });
      }
    }
  }

  if (enrollmentsToInsert.length > 0) {
    const { error: enrollError } = await supabase
      .from("event_enrollments")
      .insert(enrollmentsToInsert);
    if (enrollError) return { error: "Failed to save enrollments: " + enrollError.message };
  }

  return { success: true };
}
