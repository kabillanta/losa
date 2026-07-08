const { createClient } = require("@supabase/supabase-js");
const ExcelJS = require("exceljs");
require("dotenv").config({ path: ".env.local" });
const config = require("./events-config.json");

async function test() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    async function fetchAll(table, select = "*") {
      const allData = [];
      let page = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select(select)
          .range(page * pageSize, (page + 1) * pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allData.push(...data);
        if (data.length < pageSize) break;
        page++;
      }
      return allData;
    }

    console.log("Fetching data...");
    const [schools, students, enrollments] = await Promise.all([
      fetchAll("schools", "id, name"),
      fetchAll("students", "id, name, school_id"),
      fetchAll("event_enrollments"),
    ]);

    console.log(`Fetched ${schools.length} schools, ${students.length} students, ${enrollments.length} enrollments`);

    const schoolMap = new Map(schools.map((s) => [s.id, s.name]));
    const studentMap = new Map(students.map((s) => [s.id, s]));
    const eventConfigMap = new Map(config.events.map((e) => [e.slug, e]));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Admin';
    workbook.created = new Date();

    const enrollmentsByEvent = new Map();
    enrollments.forEach((enroll) => {
      const slug = enroll.event_slug;
      if (!enrollmentsByEvent.has(slug)) {
        enrollmentsByEvent.set(slug, []);
      }
      enrollmentsByEvent.get(slug).push(enroll);
    });

    const eventSlugs = Array.from(enrollmentsByEvent.keys());
    
    for (const slug of eventSlugs) {
      const eventConf = eventConfigMap.get(slug);
      const eventName = eventConf?.name || slug;
      
      const safeSheetName = eventName.replace(/[\[\]\*\/\?\\:']/g, "").substring(0, 31);
      
      let sheetName = safeSheetName;
      let counter = 1;
      while (workbook.worksheets.some(ws => ws.name === sheetName)) {
        const suffix = ` (${counter})`;
        sheetName = safeSheetName.substring(0, 31 - suffix.length) + suffix;
        counter++;
      }

      const worksheet = workbook.addWorksheet(sheetName);

      worksheet.columns = [
        { header: 'Event Name', key: 'eventName', width: 30 },
        { header: 'Category', key: 'category', width: 25 },
        { header: 'School Name', key: 'schoolName', width: 30 },
        { header: 'Team ID', key: 'teamId', width: 20 },
        { header: 'Student Name', key: 'studentName', width: 25 },
      ];

      worksheet.getRow(1).font = { bold: true };
      
      const eventEnrollments = enrollmentsByEvent.get(slug) || [];
      
      eventEnrollments.sort((a, b) => {
        const studentA = studentMap.get(a.student_id);
        const studentB = studentMap.get(b.student_id);
        const schoolA = studentA ? schoolMap.get(studentA.school_id) : "Unknown School";
        const schoolB = studentB ? schoolMap.get(studentB.school_id) : "Unknown School";
        if (schoolA === schoolB) {
          return (a.team_id || "").localeCompare(b.team_id || "");
        }
        return (schoolA || "").localeCompare(schoolB || "");
      });

      for (const enroll of eventEnrollments) {
        const student = studentMap.get(enroll.student_id);
        const schoolName = student ? schoolMap.get(student.school_id) : "Unknown School";
        
        worksheet.addRow({
          eventName: eventName,
          category: eventConf?.category || "Other",
          schoolName: schoolName || "Unknown School",
          teamId: enroll.team_id || "Team 1",
          studentName: student?.name || "Unknown Student",
        });
      }
    }

    if (eventSlugs.length === 0) {
      workbook.addWorksheet("Empty");
    }

    await workbook.xlsx.writeBuffer();
    console.log("Success");

  } catch (error) {
    console.error("Export Error:", error);
  }
}

test();
