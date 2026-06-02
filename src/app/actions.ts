"use server";

import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

type ParsedStudent = {
  name: string;
  events: string[]; // array of event slugs
};

export async function registerSchool(formData: FormData, students: ParsedStudent[]) {
  const schoolName = formData.get("schoolName") as string;
  const teacherName = formData.get("teacherName") as string;

  if (!schoolName || students.length === 0) {
    return { error: "School name and at least one student are required." };
  }

  // 1. Create School
  const qrCodeId = `SCH-${uuidv4().substring(0, 8).toUpperCase()}`;
  
  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .insert({
      name: schoolName,
      teacher_name: teacherName,
      qr_code_id: qrCodeId
    })
    .select()
    .single();

  if (schoolError || !school) {
    return { error: "Failed to create school: " + schoolError?.message };
  }

  // 2. Insert all students sequentially to safely capture their new IDs for enrollments
  // This is slightly slower than bulk insert, but completely safe against duplicate names.
  const enrollmentsToInsert = [];

  for (const studentData of students) {
    if (!studentData.name.trim()) continue;

    const { data: newStudent, error: studentError } = await supabase
      .from("students")
      .insert({
        name: studentData.name.trim(),
        school_id: school.id,
        is_present: false
      })
      .select()
      .single();

    if (!studentError && newStudent) {
      // Prepare their enrollments
      for (const eventSlug of studentData.events) {
        enrollmentsToInsert.push({
          student_id: newStudent.id,
          event_slug: eventSlug
        });
      }
    }
  }

  // 3. Bulk insert all enrollments
  if (enrollmentsToInsert.length > 0) {
    const { error: enrollmentsError } = await supabase
      .from("event_enrollments")
      .insert(enrollmentsToInsert);
      
    if (enrollmentsError) {
      console.error("Enrollment error:", enrollmentsError);
      // We don't fail the whole registration if a few enrollments fail, 
      // but we log it.
    }
  }

  return { success: true, qrCodeId: qrCodeId, schoolId: school.id };
}
