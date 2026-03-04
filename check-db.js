import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const supabaseAnonKey = env.match(/VITE_SUPABASE_ANON_KEY="(.*?)"/)[1];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDb() {
    const { data: users, error: selectError } = await supabase.from('users').select('*');
    console.log("Users target:", users);
    if (selectError) console.error("Select Error:", selectError);
}
checkDb();
