"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface StudentInfo {
  name: string;
  className: string;
  section: string;
  admissionNumber: string;
}

export async function adminAddTeam(schoolId: string, eventSlug: string, students: StudentInfo[], isTeacherEvent: boolean) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("losa_admin_session")?.value;

  if (adminSession !== "authenticated") {
    return { error: "Unauthorized. Admin session required." };
  }

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get the school prefix for the team ID
  const { data: school } = await supabaseAdmin
    .from("schools")
    .select("name")
    .eq("id", schoolId)
    .single();

  if (!school) return { error: "School not found" };

  const prefix = school.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .substring(0, 3)
    .toUpperCase();

  // Generate a random team ID since it's an ad-hoc team
  const teamId = `${prefix}-${eventSlug.toUpperCase()}-ADMIN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const validStudents = students.filter((s) =>
    isTeacherEvent
      ? s.name.trim().length > 0
      : s.name.trim().length > 0 &&
        s.className.trim().length > 0 &&
        s.section.trim().length > 0 &&
        s.admissionNumber.trim().length > 0
  );

  if (validStudents.length === 0) return { error: "No valid students provided" };

  const enrollmentsToInsert = [];

  for (const student of validStudents) {
    const admNo = isTeacherEvent
      ? `TCH-${student.name.trim().replace(/[^a-zA-Z0-9-]/g, "").toUpperCase()}`
      : student.admissionNumber.trim().toUpperCase();

    const combinedClassDetails = isTeacherEvent
      ? "Teacher"
      : `${student.className.trim()} - ${student.section.trim()}`;

    // Find student
    const { data: matchingStudents } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("school_id", schoolId)
      .ilike("admission_number", admNo)
      .limit(1);

    let studentId = matchingStudents?.[0]?.id;

    if (!studentId) {
      // Insert
      const { data: newStudent, error: createError } = await supabaseAdmin
        .from("students")
        .insert({
          school_id: schoolId,
          name: student.name.trim(),
          class_details: combinedClassDetails,
          admission_number: admNo,
          is_present: false,
        })
        .select("id")
        .single();

      if (createError) return { error: createError.message };
      studentId = newStudent.id;
    } else {
      // Update existing student details just in case
      await supabaseAdmin
        .from("students")
        .update({
          name: student.name.trim(),
          class_details: combinedClassDetails,
        })
        .eq("id", studentId);
    }

    enrollmentsToInsert.push({
      event_slug: eventSlug,
      student_id: studentId,
      school_id: schoolId,
      team_id: teamId,
    });
  }

  // Check if they are already registered for this event
  const studentIds = enrollmentsToInsert.map(e => e.student_id);
  const { data: existingEnrollments } = await supabaseAdmin
    .from("event_enrollments")
    .select("student_id")
    .eq("event_slug", eventSlug)
    .in("student_id", studentIds);

  if (existingEnrollments && existingEnrollments.length > 0) {
    return { error: "One or more students are already registered for this event. You cannot add them twice." };
  }

  // Insert enrollments
  const { error: insertError } = await supabaseAdmin
    .from("event_enrollments")
    .insert(enrollmentsToInsert);

  if (insertError) return { error: insertError.message };

  revalidatePath("/admin/registrations");
  return { success: true };
}
