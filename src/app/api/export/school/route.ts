import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function escapeCSV(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const revalidate = 0;

export async function GET() {
  try {
    const [schoolsRes, studentsRes] = await Promise.all([
      supabase.from("schools").select("*").order("name"),
      supabase.from("students").select("*"),
    ]);

    const schools = schoolsRes.data || [];
    const students = studentsRes.data || [];

    // Map school id to school name and teacher
    const schoolMap = new Map(schools.map((s) => [s.id, s]));

    // Columns: School Name, Teacher Name, Phone Number, Email, Student Name, Class/Section, Admission No, Present Status
    const headers = ["School Name", "Teacher Name", "Phone Number", "Email", "Student Name", "Class/Section", "Admission No", "Present Status"];
    
    // Sort students by school name, then student name
    const rowsData = students.map((student) => {
      const school = schoolMap.get(student.school_id);
      return {
        schoolName: school?.name || "Unknown School",
        teacherName: school?.teacher_name || "N/A",
        phoneNumber: school?.phone_number || "N/A",
        email: school?.email || "N/A",
        studentName: student.name,
        classDetails: student.class_details,
        admissionNo: student.admission_number,
        present: student.is_present ? "Present" : "Absent",
      };
    }).sort((a, b) => a.schoolName.localeCompare(b.schoolName) || a.studentName.localeCompare(b.studentName));

    const csvRows = [
      headers.map(escapeCSV).join(","),
      ...rowsData.map(r => [r.schoolName, r.teacherName, r.phoneNumber, r.email, r.studentName, r.classDetails, r.admissionNo, r.present].map(escapeCSV).join(","))
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n"); // Adding BOM for Excel UTF-8 support

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="schools_export.csv"',
      },
    });

  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Failed to generate export", { status: 500 });
  }
}
