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

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function run() {
  const { data: students } = await supabase.from('students').select('*').in('id', [
    '7575d758-9d2d-424c-b222-a7c6c7ffc250',
    'b97d2e99-2930-4dff-817c-865726ea5c53',
    '665dbd80-e61c-43ac-b94e-c81febd12fbd',
    '7b55139f-8da9-4b5f-8dda-aa6c4fb2384d'
  ]);
  
  console.log(students);
}

run().catch(console.error);
