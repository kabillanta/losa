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
      supabase.from("schools").select("id, name"),
      supabase.from("students").select("id, name, school_id"),
      supabase.from("event_enrollments").select("*"),
    ]);

    const schools = schoolsRes.data || [];
    const students = studentsRes.data || [];
    const enrollments = enrollmentsRes.data || [];

    // Maps
    const schoolMap = new Map(schools.map((s) => [s.id, s.name]));
    const studentMap = new Map(students.map((s) => [s.id, s]));
    const eventConfigMap = new Map(config.events.map((e) => [e.slug, e]));

    // Columns: Event Name, Category, School Name, Team ID, Student Name
    const headers = ["Event Name", "Category", "School Name", "Team ID", "Student Name"];
    
    const rowsData = enrollments.map((enroll) => {
      const student = studentMap.get(enroll.student_id);
      const schoolName = student ? schoolMap.get(student.school_id) : "Unknown School";
      const eventConf = eventConfigMap.get(enroll.event_slug);
      
      return {
        eventName: eventConf?.name || enroll.event_slug,
        category: (eventConf as any)?.category || "Other",
        schoolName: schoolName || "Unknown School",
        teamId: enroll.team_id || "Team 1",
        studentName: student?.name || "Unknown Student",
      };
    }).sort((a, b) => {
      if (a.eventName === b.eventName) {
        if (a.schoolName === b.schoolName) {
          return a.teamId.localeCompare(b.teamId);
        }
        return a.schoolName.localeCompare(b.schoolName);
      }
      return a.eventName.localeCompare(b.eventName);
    });

    const csvRows = [
      headers.map(escapeCSV).join(","),
      ...rowsData.map(r => [r.eventName, r.category, r.schoolName, r.teamId, r.studentName].map(escapeCSV).join(","))
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n"); // Adding BOM for Excel UTF-8 support

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="events_export.csv"',
      },
    });

  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Failed to generate export", { status: 500 });
  }
}
