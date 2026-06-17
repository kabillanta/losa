"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function setFirebaseSession(uid: string) {
  const cookieStore = await cookies();
  cookieStore.set("firebase_uid", uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  // Check if school profile exists
  const supabase = await createClient();
  const { data } = await supabase
    .from("schools")
    .select("id")
    .eq("firebase_uid", uid)
    .single();

  if (data) {
    redirect("/dashboard");
  } else {
    redirect("/auth/complete-profile");
  }
}

export async function completeProfile(formData: FormData) {
  const cookieStore = await cookies();
  const uid = cookieStore.get("firebase_uid")?.value;

  if (!uid) {
    return { error: "Session expired. Please log in again." };
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

  const supabase = await createClient();
  const { v4: uuidv4 } = await import("uuid");
  const qrCodeId = `SCH-${uuidv4().substring(0, 8).toUpperCase()}`;

  const { error } = await supabase.from("schools").insert({
    firebase_uid: uid,
    name: schoolName,
    teacher_name: teacherName,
    phone_number: phoneNumber,
    email: email,
    qr_code_id: qrCodeId,
  });

  if (error) {
    return { error: "Failed to create profile: " + error.message };
  }

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("firebase_uid");
  redirect("/");
}
