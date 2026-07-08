import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  const { data: students } = await supabase.from("students").select("id, name");
  const { data: enrollments } = await supabase.from("event_enrollments").select("student_id");

  const orphaned = students.filter(s => !enrollments.find(e => e.student_id === s.id));
  
  console.log(`Found ${orphaned.length} orphaned students. Deleting...`);
  
  if (orphaned.length > 0) {
    const idsToDelete = orphaned.map(o => o.id);
    const { error } = await supabase.from("students").delete().in("id", idsToDelete);
    if (error) {
      console.error("Failed to delete orphans:", error);
    } else {
      console.log("Successfully deleted orphans.");
    }
  }
}

cleanup();
