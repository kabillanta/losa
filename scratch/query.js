import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: schools } = await supabase.from("schools").select("id, name");
  const { data: students } = await supabase.from("students").select("*");
  const { data: enrollments } = await supabase.from("event_enrollments").select("*");

  console.log(`Total Students: ${students.length}`);
  console.log(`Total Enrollments: ${enrollments.length}`);

  const orphaned = students.filter(s => !enrollments.find(e => e.student_id === s.id));
  console.log(`Orphaned Students: ${orphaned.length}`);
  if (orphaned.length > 0) {
    console.log("Orphan details:", orphaned);
  }

  // Count per school
  for (const school of schools) {
    const schoolStudents = students.filter(s => s.school_id === school.id);
    const schoolEnrolls = enrollments.filter(e => schoolStudents.find(s => s.id === e.student_id));
    if (schoolStudents.length > 0) {
      console.log(`\nSchool: ${school.name}`);
      console.log(`  Students: ${schoolStudents.length}`);
      console.log(`  Enrollments: ${schoolEnrolls.length}`);
    }
  }
}

check();
