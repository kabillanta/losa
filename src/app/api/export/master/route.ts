import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";
import config from "../../../../../events-config.json";

export const revalidate = 0;

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Utility to fetch all rows bypassing the 1000 row limit
    async function fetchAll(table: string): Promise<any[]> {
      const allData = [];
      let page = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select("*")
          .range(page * pageSize, (page + 1) * pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allData.push(...data);
        if (data.length < pageSize) break;
        page++;
      }
      return allData;
    }

    const [schools, students, enrollments] = await Promise.all([
      fetchAll("schools"),
      fetchAll("students"),
      fetchAll("event_enrollments"),
    ]);

    const eventConfigMap = new Map(config.events.map((e) => [e.slug, e]));
    const schoolMap = new Map(schools.map((s) => [s.id, s]));
    
    // Group enrollments by student
    const studentEnrollmentsMap = new Map<string, any[]>();
    enrollments.forEach(e => {
      if (!studentEnrollmentsMap.has(e.student_id)) {
        studentEnrollmentsMap.set(e.student_id, []);
      }
      studentEnrollmentsMap.get(e.student_id)!.push(e);
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Admin';
    workbook.created = new Date();

    // ==========================================
    // SHEET 1: Summary Dashboard
    // ==========================================
    const summarySheet = workbook.addWorksheet("Summary Dashboard");
    summarySheet.columns = [
      { header: 'School Name', key: 'schoolName', width: 35 },
      { header: 'Teacher Name', key: 'teacherName', width: 25 },
      { header: 'Phone Number', key: 'phoneNumber', width: 20 },
      { header: 'Total Students', key: 'total', width: 15 },
      { header: 'Present', key: 'present', width: 15 },
      { header: 'Absent', key: 'absent', width: 15 },
      { header: 'Attendance %', key: 'percentage', width: 15 },
    ];
    summarySheet.getRow(1).font = { bold: true };

    // Group students by school for the summary
    const studentsBySchool = new Map<string, any[]>();
    students.forEach((student) => {
      const schoolId = student.school_id;
      if (!studentsBySchool.has(schoolId)) {
        studentsBySchool.set(schoolId, []);
      }
      studentsBySchool.get(schoolId)!.push(student);
    });

    // Sort schools alphabetically for the summary
    schools.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    let totalAllStudents = 0;
    let totalAllPresent = 0;

    for (const school of schools) {
      const schoolStudents = studentsBySchool.get(school.id) || [];
      const presentCount = schoolStudents.filter(s => s.is_present).length;
      const totalCount = schoolStudents.length;
      const absentCount = totalCount - presentCount;
      const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

      totalAllStudents += totalCount;
      totalAllPresent += presentCount;

      summarySheet.addRow({
        schoolName: school.name || "Unknown School",
        teacherName: school.teacher_name || "N/A",
        phoneNumber: school.phone_number || "N/A",
        total: totalCount,
        present: presentCount,
        absent: absentCount,
        percentage: `${percentage}%`,
      });
    }

    // Add a blank row then a grand total row
    summarySheet.addRow({});
    const grandTotalPercentage = totalAllStudents > 0 ? Math.round((totalAllPresent / totalAllStudents) * 100) : 0;
    const grandTotalRow = summarySheet.addRow({
      schoolName: "GRAND TOTAL",
      total: totalAllStudents,
      present: totalAllPresent,
      absent: totalAllStudents - totalAllPresent,
      percentage: `${grandTotalPercentage}%`,
    });
    grandTotalRow.font = { bold: true };

    // ==========================================
    // SHEET 2: Master Database (All Students Flat List)
    // ==========================================
    const masterSheet = workbook.addWorksheet("Master Database");
    
    // Enable auto-filtering on the headers so admins can easily filter by school/status
    masterSheet.autoFilter = 'A1:I1';

    masterSheet.columns = [
      { header: 'Student Name', key: 'studentName', width: 25 },
      { header: 'Admission No', key: 'admissionNo', width: 20 },
      { header: 'Class/Section', key: 'classDetails', width: 15 },
      { header: 'School Name', key: 'schoolName', width: 35 },
      { header: 'Teacher Name', key: 'teacherName', width: 25 },
      { header: 'Phone Number', key: 'phoneNumber', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Enrolled Events', key: 'enrolledEvents', width: 60 },
      { header: 'Present Status', key: 'present', width: 15 },
    ];
    masterSheet.getRow(1).font = { bold: true };

    // Sort students by school name, then student name
    students.sort((a, b) => {
      const schoolA = schoolMap.get(a.school_id)?.name || "Unknown School";
      const schoolB = schoolMap.get(b.school_id)?.name || "Unknown School";
      if (schoolA === schoolB) {
        return (a.name || "").localeCompare(b.name || "");
      }
      return schoolA.localeCompare(schoolB);
    });

    for (const student of students) {
      const school = schoolMap.get(student.school_id);
      const studentEnrollments = studentEnrollmentsMap.get(student.id) || [];
      const enrolledEventsStr = studentEnrollments.map(e => {
        const ev = eventConfigMap.get(e.event_slug);
        return ev ? ev.name : e.event_slug;
      }).join("; ");

      masterSheet.addRow({
        studentName: student.name,
        admissionNo: student.admission_number, 
        classDetails: student.class_details,
        schoolName: school?.name || "Unknown School",
        teacherName: school?.teacher_name || "N/A",
        phoneNumber: school?.phone_number || "N/A",
        email: school?.email || "N/A",
        enrolledEvents: enrolledEventsStr || "None",
        present: student.is_present ? "Present" : "Absent",
      });
    }

    if (students.length === 0) {
      masterSheet.addRow({ studentName: "No data available" });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="master_database.xlsx"',
      },
    });

  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Failed to generate export", { status: 500 });
  }
}
