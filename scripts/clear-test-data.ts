import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearTestData() {
  console.log("Starting to clear test data...");

  // We delete rows where 'id' is not null, which effectively deletes all rows.
  // Note: Depending on RLS policies, this might require a service role key or manual dashboard clearing if blocked.

  console.log("1/4 Clearing event_enrollments...");
  const res1 = await supabase.from("event_enrollments").delete().not("event_slug", "is", null);
  if (res1.error) console.log("Note: ", res1.error.message);

  console.log("2/4 Clearing scores...");
  const res2 = await supabase.from("scores").delete().not("event_id", "is", null);
  if (res2.error) console.log("Note: ", res2.error.message);

  console.log("3/4 Clearing students...");
  const res3 = await supabase.from("students").delete().not("id", "is", null);
  if (res3.error) console.log("Note: ", res3.error.message);

  console.log("4/4 Clearing schools...");
  const res4 = await supabase.from("schools").delete().not("id", "is", null);
  if (res4.error) console.log("Note: ", res4.error.message);

  console.log("\nFinished clearing test data! Your 'events' table was kept intact.");
}

clearTestData();
