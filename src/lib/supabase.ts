import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    // This logs a big warning if keys are missing
    console.warn("⚠️ CRITICAL: Supabase Keys are missing in .env.local ⚠️");
}

// We use fallback strings so the app doesn't crash on startup
export const supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co", 
    supabaseKey || "placeholder"
);