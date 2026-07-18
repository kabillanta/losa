"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function adminAddSchool(formData: FormData) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("losa_admin_session")?.value;

  if (adminSession !== "authenticated") {
    return { error: "Unauthorized. Admin session required." };
  }

  const schoolName = formData.get("schoolName") as string;
  const teacherName = formData.get("teacherName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const email = formData.get("email") as string;

  if (!schoolName || !teacherName || !phoneNumber || !email) {
    return { error: "All fields are required." };
  }

  const nameRegex = /^[A-Za-z\s\-']*[A-Za-z][A-Za-z\s\-']*$/;
  if (!nameRegex.test(schoolName.trim())) {
    return { error: "School name must contain at least one letter and can only contain letters, spaces, hyphens, and apostrophes." };
  }
  if (!nameRegex.test(teacherName.trim())) {
    return { error: "Teacher name must contain at least one letter and can only contain letters, spaces, hyphens, and apostrophes." };
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phoneNumber.trim())) {
    return { error: "Mobile number must be exactly 10 digits." };
  }

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { v4: uuidv4 } = await import("uuid");
  const qrCodeId = `SCH-${uuidv4().substring(0, 8).toUpperCase()}`;
  const dummyUid = `admin_created_${uuidv4()}`;

  const { error } = await supabaseAdmin.from("schools").insert({
    firebase_uid: dummyUid,
    name: schoolName,
    teacher_name: teacherName,
    phone_number: phoneNumber,
    email: email,
    qr_code_id: qrCodeId,
  });

  if (error) {
    return { error: "Failed to create school: " + error.message };
  }

  revalidatePath("/admin/registrations");
  return { success: true };
}
