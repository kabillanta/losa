import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: enrollments, error: e1 } = await supabase.from("event_enrollments").select("*");
  console.log("Enrollments:", enrollments?.length, e1?.message);
  
  if (enrollments?.length) {
     console.log("Sample:", enrollments[0]);
  }

  const { data: students, error: e2 } = await supabase.from("students").select("*");
  console.log("Students:", students?.length, e2?.message);

  const { data: schools, error: e3 } = await supabase.from("schools").select("*");
  console.log("Schools:", schools?.length, e3?.message);
}

test();
