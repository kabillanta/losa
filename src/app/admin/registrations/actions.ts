"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateStudentDetails(
  studentId: string,
  newName: string,
  newClass: string,
  newAdmNo: string
) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session")?.value;

  if (adminSession !== "true") {
    return { error: "Unauthorized. Admin session required." };
  }

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Update the student details
  const { error } = await supabaseAdmin
    .from("students")
    .update({
      name: newName.trim(),
      class_details: newClass.trim(),
      admission_number: newAdmNo.trim(),
    })
    .eq("id", studentId);

  if (error) {
    console.error("Failed to update student:", error);
    return { error: "Failed to update student: " + error.message };
  }

  // Revalidate the dashboard so it shows the new data
  revalidatePath("/admin/registrations");
  
  return { success: true };
}
