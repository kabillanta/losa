"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { normalizeIdentifier } from "@/lib/utils";

export type StudentInfo = {
  name: string;
  className: string;
  section: string;
  admissionNumber: string;
};

export type EnrollmentActionError = {
  title: string;
  message: string;
  code?: string;
  fixSteps?: string[];
};

type EnrollmentToInsert = {
  student_id: string;
  event_slug: string;
  team_id: string;
};

const createEnrollmentError = (
  title: string,
  message: string,
  options?: Pick<EnrollmentActionError, "code" | "fixSteps">,
): EnrollmentActionError => ({
  title,
  message,
  ...options,
});

const duplicateParticipantError = (
  label: string,
  value: string,
): EnrollmentActionError =>
  createEnrollmentError(
    "Duplicate participant",
    `${label} "${value}" is entered more than once for this event.`,
    {
      code: "DUPLICATE_PARTICIPANT",
      fixSteps: [
        "Keep the participant in only one team or slot for this event.",
        "If two students share the same admission number, correct one admission number before saving.",
        "Click Save Participants again after removing the duplicate entry.",
      ],
    },
  );

const duplicateEnrollmentError = (): EnrollmentActionError =>
  createEnrollmentError(
    "This participant is already registered",
    "The database already has one of these participants saved for this event, so the duplicate row was blocked.",
    {
      code: "DUPLICATE_ENROLLMENT",
      fixSteps: [
        "Refresh this event page to load the latest saved participants.",
        "Check that the same admission number or teacher name is not repeated in another team.",
        "Save again. If the message repeats, ask an admin to clean the duplicate saved record for this school and event.",
      ],
    },
  );

const databaseError = (action: string, message?: string): EnrollmentActionError =>
  createEnrollmentError(
    `Could not ${action}`,
    "The registration could not be saved because the database rejected part of the request.",
    {
      code: "DATABASE_ERROR",
      fixSteps: [
        "Check the participant details for repeated admission numbers.",
        "Refresh the page and try saving once more.",
        message ? `Share this technical detail with the admin: ${message}` : "If it still fails, share a screenshot with the admin.",
      ],
    },
  );

export async function saveEventEnrollments(
  eventSlug: string,
  teams: StudentInfo[][],
  isTeacherEvent: boolean = false,
  adminSchoolId?: string
) {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let school;

  if (adminSchoolId) {
    // Admin mode: verify admin session
    const adminSession = cookieStore.get("losa_admin_session")?.value;
    if (adminSession !== "authenticated") {
      return {
        error: createEnrollmentError(
          "Unauthorized",
          "You must be an admin to perform this action on behalf of a school.",
          {
            code: "NOT_ADMIN",
            fixSteps: [
              "Log in from the admin login page.",
              "Open this school from Admin > Registrations and try again.",
            ],
          },
        ),
      };
    }
    const { data } = await supabaseAdmin
      .from("schools")
      .select("id, name")
      .eq("id", adminSchoolId)
      .single();
    school = data;
  } else {
    // School mode: verify firebase uid
    const firebaseUid = cookieStore.get("firebase_uid")?.value;

    if (!firebaseUid) {
      return {
        error: createEnrollmentError(
          "Session expired",
          "Please log in again before saving participants.",
          { code: "NOT_AUTHENTICATED", fixSteps: ["Log in again, then reopen this event and save participants."] },
        ),
      };
    }
    const { data } = await supabase
      .from("schools")
      .select("id, name")
      .eq("firebase_uid", firebaseUid)
      .single();
    school = data;
  }

  if (!school) {
    return {
      error: createEnrollmentError(
        "School profile not found",
        "Your login is not linked to a school profile.",
        {
          code: "SCHOOL_NOT_FOUND",
          fixSteps: ["Ask the organizer to verify that this login is linked to the correct school."],
        },
      ),
    };
  }

  // Generate a short school prefix from name (e.g., "St. Joseph's" -> "SJH")
  const prefix = school.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .substring(0, 3)
    .toUpperCase();

  // 1. Delete all existing enrollments for this event for this school
  const { data: schoolStudents, error: studentsFetchError } = await supabaseAdmin
    .from("students")
    .select("id")
    .eq("school_id", school.id);

  if (studentsFetchError) {
    console.error("Student fetch error:", studentsFetchError);
    return { error: databaseError("prepare existing participants", studentsFetchError.message) };
  }

  const allSchoolStudentIds = schoolStudents?.map(s => s.id) || [];
  if (allSchoolStudentIds.length > 0) {
    // Chunk the deletions to prevent URL length limits from silently failing the request
    const chunkSize = 50;
    for (let i = 0; i < allSchoolStudentIds.length; i += chunkSize) {
      const chunk = allSchoolStudentIds.slice(i, i + chunkSize);
      const { error: deleteError } = await supabaseAdmin
        .from("event_enrollments")
        .delete()
        .eq("event_slug", eventSlug)
        .in("student_id", chunk);

      if (deleteError) {
        console.error("Delete chunk error:", deleteError);
        return { error: databaseError("replace old enrollments", deleteError.message) };
      }
    }
  }

  // 2. Iterate through each team
  const enrollmentsToInsert: EnrollmentToInsert[] = [];
  const seenInputIdentifiers = new Set<string>();
  const seenStudentIds = new Set<string>();

  for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
    const students = teams[teamIndex];
    const validStudents = students.filter((s) =>
      isTeacherEvent
        ? s.name.trim().length > 0
        : s.name.trim().length > 0 &&
          s.className.trim().length > 0 &&
          s.section.trim().length > 0 &&
          s.admissionNumber.trim().length > 0,
    );

    if (validStudents.length === 0) continue;

    // e.g. SJH-FASHIONISTA-T1
    const teamId = `${prefix}-${eventSlug.toUpperCase()}-T${teamIndex + 1}`;

    for (const student of validStudents) {
      const admNo = isTeacherEvent
        ? `TCH-${normalizeIdentifier(student.name)}`
        : normalizeIdentifier(student.admissionNumber);
      const inputLabel = isTeacherEvent ? "Teacher name" : "Admission number";
      const displayValue = isTeacherEvent ? student.name.trim() : student.admissionNumber.trim();

      if (seenInputIdentifiers.has(admNo)) {
        return { error: duplicateParticipantError(inputLabel, displayValue) };
      }
      seenInputIdentifiers.add(admNo);

      const combinedClassDetails = isTeacherEvent
        ? "Teacher"
        : `${student.className.trim()} - ${student.section.trim()}`;

      // Find the student by admission number
      const { data: matchingStudents, error: findError } = await supabaseAdmin
        .from("students")
        .select("id")
        .eq("school_id", school.id)
        .ilike("admission_number", admNo)
        .limit(2);

      if (findError) {
        console.error("Find student error:", findError);
        return { error: databaseError("find the participant profile", findError.message) };
      }

      if ((matchingStudents?.length || 0) > 1) {
        return {
          error: createEnrollmentError(
            "Duplicate student profiles found",
            `${inputLabel} "${displayValue}" exists more than once in this school profile.`,
            {
              code: "DUPLICATE_STUDENT_PROFILE",
              fixSteps: [
                "Ask an admin to merge or remove the duplicate student profile.",
                "Refresh this page and save again after the duplicate is fixed.",
              ],
            },
          ),
        };
      }

      let existingStudent = matchingStudents?.[0] || null;

      if (!existingStudent) {
        const { data: newStudent, error: createError } = await supabaseAdmin
          .from("students")
          .insert({
            school_id: school.id,
            name: student.name.trim(),
            class_details: combinedClassDetails,
            admission_number: admNo,
            is_present: false,
          })
          .select("id")
          .single();

        if (createError)
          return { error: databaseError("create the participant profile", createError.message) };
        existingStudent = newStudent;
      } else {
        // Update name and class details just in case they were corrected
        const { error: updateError } = await supabaseAdmin
          .from("students")
          .update({
            name: student.name.trim(),
            class_details: combinedClassDetails,
            admission_number: admNo,
          })
          .eq("id", existingStudent.id);

        if (updateError) {
          console.error("Update student error:", updateError);
          return { error: databaseError("update the participant profile", updateError.message) };
        }
      }

      if (existingStudent) {
        if (seenStudentIds.has(existingStudent.id)) {
          return { error: duplicateParticipantError(inputLabel, displayValue) };
        }
        seenStudentIds.add(existingStudent.id);

        enrollmentsToInsert.push({
          student_id: existingStudent.id,
          event_slug: eventSlug,
          team_id: teamId,
        });
      }
    }
  }

  if (enrollmentsToInsert.length > 0) {
    const { error: enrollError } = await supabaseAdmin
      .from("event_enrollments")
      .upsert(enrollmentsToInsert, { onConflict: "event_slug,student_id" });
    if (enrollError) {
      console.error("Enrollment upsert error:", enrollError);
      if (enrollError.code === "23505") {
        return { error: duplicateEnrollmentError() };
      }
      return { error: databaseError("save enrollments", enrollError.message) };
    }
  }

  // Clear Next.js cache so the scoring page and leaderboard update instantly
  revalidatePath(`/events/${eventSlug}`);
  revalidatePath("/admin/leaderboard");
  revalidatePath(`/events/${eventSlug}/score/${school.id}`);

  return { success: true };
}
