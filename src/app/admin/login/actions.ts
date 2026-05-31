"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const password = formData.get("password");
  const expectedPassword = process.env.ADMIN_PASSWORD || "losa-admin-2026";

  if (password === expectedPassword) {
    const cookieStore = await cookies();
    
    cookieStore.set("losa_admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    redirect("/admin");
  } else {
    return { error: "Incorrect password" };
  }
}
