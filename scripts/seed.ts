import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

const schools = [
  { name: "St. Joseph's High School", teacher_name: "Mrs. Priya Sharma", qr_code_id: "STJ-001" },
  { name: "Delhi Public School", teacher_name: "Mr. Rajesh Kumar", qr_code_id: "DPS-002" },
  { name: "Kendriya Vidyalaya", teacher_name: "Mrs. Anitha Nair", qr_code_id: "KV-003" },
  { name: "Holy Cross Academy", teacher_name: "Mr. David Thomas", qr_code_id: "HCA-004" },
  { name: "Sunrise International", teacher_name: "Mrs. Fatima Begum", qr_code_id: "SIS-005" },
];

const studentNames = [
  "Aarav Patel", "Aditi Sharma", "Arjun Reddy", "Ananya Gupta", "Bhavya Singh",
  "Charvi Mehta", "Daksh Joshi", "Diya Iyer", "Eshaan Kapoor", "Fatima Khan",
  "Gaurav Nair", "Harini Rao", "Ishaan Desai", "Jiya Malhotra", "Kabir Verma",
  "Lavanya Pillai", "Manav Chandra", "Neha Sundaram", "Om Prakash", "Pooja Banerjee",
  "Rahul Tiwari", "Sanya Agarwal", "Tanvi Kulkarni", "Utkarsh Saxena", "Vanya Chopra",
  "Vivaan Mishra", "Yash Pandey", "Zara Siddiqui", "Aditya Bhat", "Riya Menon",
  "Karthik Rajan", "Meera Venkatesh", "Nikhil Shetty", "Shreya Das", "Rohan Goyal",
  "Kavya Krishnan", "Siddharth Jain", "Prachi Thakur", "Arnav Chauhan", "Trisha Bose",
  "Reyansh Garg", "Anvi Srinivasan", "Dev Mahajan", "Saanvi Hegde", "Aarush Dutta",
  "Myra Sethi", "Krish Bajaj", "Anika Rawat", "Ayaan Chatterjee", "Kiara Oberoi",
];

async function seed() {
  console.log("Seeding database...\n");

  // Insert schools
  const { data: insertedSchools, error: schoolError } = await supabase
    .from("schools")
    .upsert(schools, { onConflict: "qr_code_id" })
    .select();

  if (schoolError) {
    console.error("Error inserting schools:", schoolError.message);
    return;
  }

  console.log(`Inserted ${insertedSchools.length} schools.`);

  // Insert students for each school
  let totalStudents = 0;
  for (const school of insertedSchools) {
    // Pick 8-12 random students per school
    const count = 8 + Math.floor(Math.random() * 5);
    const shuffled = [...studentNames].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);

    const students = picked.map((name) => ({
      name,
      school_id: school.id,
      is_present: false,
    }));

    const { error: studentError } = await supabase.from("students").insert(students);

    if (studentError) {
      console.error(`Error inserting students for ${school.name}:`, studentError.message);
    } else {
      console.log(`  ${school.name}: ${count} students`);
      totalStudents += count;
    }
  }

  console.log(`\nDone! ${totalStudents} students across ${insertedSchools.length} schools.`);
}

seed();
