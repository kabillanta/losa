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
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Fetching enrollments for Brainy Duo...");
  const { data: enrollments, error: eErr } = await supabase.from('event_enrollments').select('*').eq('event_slug', 'brainy-duo');
  if (eErr) throw eErr;
  
  console.log(`Found ${enrollments.length} enrollments for brainy-duo`);
  console.log(enrollments);
}

run().catch(console.error);
