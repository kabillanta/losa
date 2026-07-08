import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) {
    env[key.trim()] = val.join('=').trim();
  }
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const configPath = path.resolve('events-config.json');
const configRaw = fs.readFileSync(configPath, 'utf-8');
const eventsInfo = JSON.parse(configRaw).events;

async function run() {
  console.log("Fetching enrollments missing team_id...");
  const { data: enrollments, error: eErr } = await supabase.from('event_enrollments').select('*').is('team_id', null);
  if (eErr) throw eErr;
  
  if (!enrollments || enrollments.length === 0) {
    console.log("No enrollments missing team_id found! Database is clean.");
    return;
  }

  const { data: students, error: sErr } = await supabase.from('students').select('id, school_id');
  if (sErr) throw sErr;

  const { data: schools, error: scErr } = await supabase.from('schools').select('id, name');
  if (scErr) throw scErr;

  const studentSchoolMap = new Map();
  students.forEach(s => studentSchoolMap.set(s.id, s.school_id));

  const schoolNameMap = new Map();
  schools.forEach(s => schoolNameMap.set(s.id, s.name));

  // Group enrollments by school_id and event_slug
  const grouped = new Map();

  enrollments.forEach(enroll => {
    const schoolId = studentSchoolMap.get(enroll.student_id);
    if (!schoolId) return;

    const key = `${schoolId}::${enroll.event_slug}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(enroll);
  });

  console.log(`Found ${enrollments.length} enrollments missing team_id across ${grouped.size} school-event combinations.`);

  for (const [key, group] of grouped.entries()) {
    const [schoolId, eventSlug] = key.split("::");
    const schoolName = schoolNameMap.get(schoolId) || "SCHOOL";
    const prefix = schoolName.split(" ").map((w) => w[0]).join("").substring(0, 3).toUpperCase();
    
    const eventDef = eventsInfo.find(e => e.slug === eventSlug);
    const maxSize = eventDef?.max_size || 1;
    const cleanEventSlug = eventSlug.toUpperCase();

    // Chunk them
    for (let i = 0; i < group.length; i += maxSize) {
      const chunk = group.slice(i, i + maxSize);
      const teamIndex = Math.floor(i / maxSize) + 1;
      const teamId = `${prefix}-${cleanEventSlug}-OLD-T${teamIndex}`;

      for (const enroll of chunk) {
        console.log(`Updating student ${enroll.student_id} for ${eventSlug} -> ${teamId}`);
        const { error: updateErr } = await supabase
          .from('event_enrollments')
          .update({ team_id: teamId })
          .eq('student_id', enroll.student_id)
          .eq('event_slug', eventSlug);
          
        if (updateErr) {
          console.error(`Failed to update ${enroll.student_id}:`, updateErr);
        }
      }
    }
  }

  console.log("Migration complete! All old enrollments now have proper team IDs.");
}

run().catch(console.error);
