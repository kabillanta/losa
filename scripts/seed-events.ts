import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedEvents() {
  console.log("Reading configuration from events-config.json...\n");
  
  const configPath = path.resolve(process.cwd(), "events-config.json");
  const configRaw = fs.readFileSync(configPath, "utf-8");
  const config = JSON.parse(configRaw);
  
  console.log("Seeding events to database...\n");

  const sanitizedEvents = config.events.map((e: any) => {
    return {
      name: e.name,
      slug: e.slug,
      description: e.description,
      rubric: e.rubric
    };
  });

  const { data, error } = await supabase
    .from("events")
    .upsert(sanitizedEvents, { onConflict: "slug" })
    .select();

  if (error) {
    console.error("Error inserting events:", error.message);
    return;
  }

  console.log(`Successfully inserted ${data.length} events!`);
}

seedEvents();
