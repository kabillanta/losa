import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPageLogic() {
  const slug = "art-to-heart-energetic"; // hardcoding the event we saw in test-db

  const [schoolsRes, enrollmentsRes, studentsRes] = await Promise.all([
    supabase.from("schools").select("*").order("name"),
    supabase.from("event_enrollments").select("student_id").eq("event_slug", slug),
    supabase.from("students").select("id, school_id")
  ]);

  const allSchools = schoolsRes.data || [];
  const enrollments = enrollmentsRes.data || [];
  const students = studentsRes.data || [];

  console.log("allSchools length:", allSchools.length);
  console.log("enrollments length:", enrollments.length);
  console.log("students length:", students.length);

  const studentToSchool = new Map(students.map(s => [s.id, s.school_id]));

  const participatingSchoolIds = new Set<string>();
  enrollments.forEach(e => {
    const schoolId = studentToSchool.get(e.student_id);
    if (schoolId) participatingSchoolIds.add(schoolId);
  });

  const schools = allSchools.filter(school => participatingSchoolIds.has(school.id));

  console.log("Final participating schools:", schools.map(s => s.name));
}

testPageLogic();
