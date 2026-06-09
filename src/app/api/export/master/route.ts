import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import config from "../../../../../events-config.json";

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
    const [schoolsRes, studentsRes, enrollmentsRes] = await Promise.all([
      supabase.from("schools").select("*"),
      supabase.from("students").select("*"),
      supabase.from("event_enrollments").select("*"),
    ]);

    const schools = schoolsRes.data || [];
    const students = studentsRes.data || [];
    const enrollments = enrollmentsRes.data || [];

    // Maps
    const schoolMap = new Map(schools.map((s) => [s.id, s]));
    const eventConfigMap = new Map(config.events.map((e) => [e.slug, e]));
    
    // Group enrollments by student
    const studentEnrollmentsMap = new Map<string, any[]>();
    enrollments.forEach(e => {
      if (!studentEnrollmentsMap.has(e.student_id)) {
        studentEnrollmentsMap.set(e.student_id, []);
      }
      studentEnrollmentsMap.get(e.student_id)!.push(e);
    });

    // Columns: Student Name, Admission No, Class/Section, School Name, Teacher Name, Phone Number, Email, Enrolled Events, Present Status
    const headers = ["Student Name", "Admission No", "Class/Section", "School Name", "Teacher Name", "Phone Number", "Email", "Enrolled Events", "Present Status"];
    
    const rowsData = students.map((student) => {
      const school = schoolMap.get(student.school_id);
      const studentEnrollments = studentEnrollmentsMap.get(student.id) || [];
      
      const enrolledEventsStr = studentEnrollments.map(e => {
        const ev = eventConfigMap.get(e.event_slug);
        return ev ? ev.name : e.event_slug;
      }).join("; ");
      
      return {
        studentName: student.name,
        admissionNo: student.admission_number,
        classDetails: student.class_details,
        schoolName: school?.name || "Unknown School",
        teacherName: school?.teacher_name || "N/A",
        phoneNumber: school?.phone_number || "N/A",
        email: school?.email || "N/A",
        enrolledEvents: enrolledEventsStr || "None",
        present: student.is_present ? "Present" : "Absent",
      };
    }).sort((a, b) => a.schoolName.localeCompare(b.schoolName) || a.studentName.localeCompare(b.studentName));

    const csvRows = [
      headers.map(escapeCSV).join(","),
      ...rowsData.map(r => [r.studentName, r.admissionNo, r.classDetails, r.schoolName, r.teacherName, r.phoneNumber, r.email, r.enrolledEvents, r.present].map(escapeCSV).join(","))
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n"); // Adding BOM for Excel UTF-8 support

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="master_list_export.csv"',
      },
    });

  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Failed to generate export", { status: 500 });
  }
}
