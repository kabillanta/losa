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

// Create client using ANON KEY, just like the frontend/actions
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']);

async function run() {
  // Try to authenticate as the school to test RLS
  // Wait, I don't know the school's password.
  // Let's just check if we can query it without auth.
  const { data, error } = await supabase.from('event_enrollments').select('*').limit(1);
  console.log("Anon select:", data, error);
}

run().catch(console.error);
