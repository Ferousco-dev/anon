
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Detect if we are using real credentials or placeholders
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

if (!isSupabaseConfigured) {
  console.log("%c Protocol Alert: Supabase not configured. Using Local Persistent Buffer. ", "color: #fbbf24; font-weight: bold; background: #1e1b4b; padding: 4px; border-radius: 4px;");
}

// We still export a client to prevent 'undefined' errors, but the app logic will guard its usage
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co', 
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder'
);
