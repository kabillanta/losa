"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type StudentInfo = {
  name: string;
  className: string;
  section: string;
  admissionNumber: string;
};

export async function saveEventEnrollments(eventSlug: string, teams: StudentInfo[][], isTeacherEvent: boolean = false) {
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
    // Chunk the deletions to prevent URL length limits from silently failing the request
    const chunkSize = 50;
    for (let i = 0; i < allSchoolStudentIds.length; i += chunkSize) {
      const chunk = allSchoolStudentIds.slice(i, i + chunkSize);
      const { error: deleteError } = await supabase
        .from("event_enrollments")
        .delete()
        .eq("event_slug", eventSlug)
        .in("student_id", chunk);
        
      if (deleteError) {
        return { error: "System Error: Failed to clear old enrollments. " + deleteError.message };
      }
    }
  }

  // 2. Iterate through each team
  const enrollmentsToInsert: { student_id: string; event_slug: string; team_id: string }[] = [];

  for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
    const students = teams[teamIndex];
    const validStudents = students.filter(
      s => isTeacherEvent
        ? s.name.trim().length > 0
        : s.name.trim().length > 0 && s.className.trim().length > 0 && s.section.trim().length > 0 && s.admissionNumber.trim().length > 0
    );
    
    if (validStudents.length === 0) continue;

    // e.g. SJH-FASHIONISTA-T1
    const teamId = `${prefix}-${eventSlug.toUpperCase()}-T${teamIndex + 1}`;

    for (const student of validStudents) {
      const admNo = isTeacherEvent ? `TCH-${student.name.trim()}` : student.admissionNumber.trim();
      const combinedClassDetails = isTeacherEvent ? "Teacher" : `${student.className.trim()} - ${student.section.trim()}`;
      
      // Find the student by admission number
      let { data: existingStudent } = await supabase
        .from("students")
        .select("id")
        .eq("school_id", school.id)
        .eq("admission_number", admNo)
        .maybeSingle();

      if (!existingStudent) {
        const { data: newStudent, error: createError } = await supabase
          .from("students")
          .insert({ 
            school_id: school.id, 
            name: student.name.trim(), 
            class_details: combinedClassDetails,
            admission_number: admNo,
            is_present: false 
          })
          .select("id")
          .single();
        
        if (createError) return { error: "Failed to create student: " + createError.message };
        existingStudent = newStudent;
      } else {
        // Update name and class details just in case they were corrected
        await supabase
          .from("students")
          .update({ 
            name: student.name.trim(),
            class_details: combinedClassDetails
          })
          .eq("id", existingStudent.id);
      }

      if (existingStudent) {
        // Prevent duplicate keys by checking if we already added this student
        if (enrollmentsToInsert.some(e => e.student_id === existingStudent.id)) {
          return { error: `Duplicate participant found. ${isTeacherEvent ? 'Teacher name' : 'Admission number'} '${isTeacherEvent ? student.name.trim() : student.admissionNumber.trim()}' is entered multiple times.` };
        }

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

  // Clear Next.js cache so the scoring page and leaderboard update instantly
  revalidatePath(`/events/${eventSlug}`);
  revalidatePath("/admin/leaderboard");
  revalidatePath(`/events/${eventSlug}/score/${school.id}`);

  return { success: true };
}
