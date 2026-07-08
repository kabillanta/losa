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

const supabaseAdmin = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function run() {
  const { data: schools } = await supabaseAdmin.from('schools').select('id, name, teacher, email').limit(1);
  if (!schools.length) return console.log("No schools");
  
  const school = schools[0];
  console.log("Test School Login:", school);
  
  const { data: students } = await supabaseAdmin.from('students').select('*').eq('school_id', school.id).limit(1);
  console.log("Test Student to duplicate:", students[0]);
}

run().catch(console.error);
