import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";

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

    const [schools, students] = await Promise.all([
      fetchAll("schools"),
      fetchAll("students"),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Admin';
    workbook.created = new Date();

    // Group students by school
    const studentsBySchool = new Map<string, any[]>();
    students.forEach((student) => {
      const schoolId = student.school_id;
      if (!studentsBySchool.has(schoolId)) {
        studentsBySchool.set(schoolId, []);
      }
      studentsBySchool.get(schoolId)!.push(student);
    });

    for (const school of schools) {
      // Clean sheet name for Excel rules (max 31 chars, no brackets/slashes)
      const safeSheetName = (school.name || "Unknown").replace(/[\[\]\*\/\?\\]/g, "").substring(0, 31);
      
      let sheetName = safeSheetName;
      let counter = 1;
      while (workbook.worksheets.some(ws => ws.name === sheetName)) {
        const suffix = ` (${counter})`;
        sheetName = safeSheetName.substring(0, 31 - suffix.length) + suffix;
        counter++;
      }

      const worksheet = workbook.addWorksheet(sheetName);

      worksheet.columns = [
        { header: 'School Name', key: 'schoolName', width: 30 },
        { header: 'Teacher Name', key: 'teacherName', width: 25 },
        { header: 'Phone Number', key: 'phoneNumber', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Student Name', key: 'studentName', width: 25 },
        { header: 'Class/Section', key: 'classDetails', width: 15 },
        { header: 'Admission No', key: 'admissionNo', width: 20 },
        { header: 'Present Status', key: 'present', width: 15 },
      ];

      worksheet.getRow(1).font = { bold: true };
      
      const schoolStudents = studentsBySchool.get(school.id) || [];
      schoolStudents.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      for (const student of schoolStudents) {
        worksheet.addRow({
          schoolName: school.name || "Unknown School",
          teacherName: school.teacher_name || "N/A",
          phoneNumber: school.phone_number || "N/A",
          email: school.email || "N/A",
          studentName: student.name,
          classDetails: student.class_details,
          admissionNo: student.admission_number,
          present: student.is_present ? "Present" : "Absent",
        });
      }
    }

    if (schools.length === 0) {
      workbook.addWorksheet("Empty");
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="schools_export.xlsx"',
      },
    });

  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Failed to generate export", { status: 500 });
  }
}
