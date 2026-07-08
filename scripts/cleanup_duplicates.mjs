import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Fetching all enrollments to find duplicates...");
  const { data: enrollments, error: eErr } = await supabase
    .from('event_enrollments')
    .select('*, students!inner(school_id)');
    
  if (eErr) throw eErr;

  // Group by school_id and event_slug
  const groups = new Map();

  enrollments.forEach(enroll => {
    const schoolId = enroll.students.school_id;
    const eventSlug = enroll.event_slug;
    const key = `${schoolId}::${eventSlug}`;
    
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(enroll);
  });

  let totalDeleted = 0;

  for (const [key, group] of groups.entries()) {
    // If all enrollments in the group have the EXACT SAME created_at, there are no duplicates from a previous save
    const uniqueTimestamps = new Set(group.map(e => e.created_at));
    
    if (uniqueTimestamps.size > 1) {
      console.log(`Found overlapping saves for ${key}!`);
      
      // Find the absolute latest timestamp
      const sortedTimestamps = Array.from(uniqueTimestamps).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const latestTimestamp = sortedTimestamps[0];
      
      // Any enrollment older than the latest timestamp is a ghost from a previous save that failed to delete!
      const oldEnrollments = group.filter(e => e.created_at !== latestTimestamp);
      const oldIds = oldEnrollments.map(e => e.id);
      
      console.log(`- Deleting ${oldIds.length} ghost enrollments from older saves...`);
      
      const { error: deleteErr } = await supabase
        .from('event_enrollments')
        .delete()
        .in('id', oldIds);
        
      if (deleteErr) {
        console.error("Failed to delete:", deleteErr);
      } else {
        totalDeleted += oldIds.length;
      }
    }
  }

  console.log(`Cleanup complete! Deleted ${totalDeleted} duplicate/ghost enrollments.`);
}

run().catch(console.error);
