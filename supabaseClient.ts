import { createClient } from '@supabase/supabase-js';

// ============================================
// CORRECT & FINAL VERSION - Copy This Entire File
// ============================================

// Safe environment variable retrieval with multi-layer fallback
const getEnv = (key: string): string => {
  try {
    // METHOD 1: Check for Vite import.meta.env (Most common in Vite projects)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return String(import.meta.env[key]);
    }
  } catch (e) {
    // Vite not available, continue to next method
  }

  try {
    // METHOD 2: Check for standard Node/Vercel process.env
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return String(process.env[key]);
    }
  } catch (e) {
    // Process not available, continue to next method
  }

  // METHOD 3: Return empty string (will be caught by isSupabaseConfigured)
  return '';
};

// Try VITE_ prefix first (for Vite projects), then fall back to non-prefixed
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

// Detect if we are using real credentials or placeholders
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  supabaseUrl.length > 0 &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20 // Anon keys are long
);

// Log configuration status for debugging
if (!isSupabaseConfigured) {
  console.log(
    "%c [PROTOCOL ALERT] Supabase credentials missing or invalid. Operating in Local Buffer Mode. ", 
    "color: #fbbf24; font-weight: bold; background: #1e1b4b; padding: 6px; border-radius: 8px; border: 1px solid #fbbf24;"
  );
  console.log('Checked for:', {
    VITE_SUPABASE_URL: getEnv('VITE_SUPABASE_URL') ? '✓ Found' : '✗ Missing',
    VITE_SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY') ? '✓ Found' : '✗ Missing',
    SUPABASE_URL: getEnv('SUPABASE_URL') ? '✓ Found' : '✗ Missing',
    SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY') ? '✓ Found' : '✗ Missing'
  });
  console.log('%c How to fix:', 'color: #10b981; font-weight: bold;');
  console.log('1. Create a .env file in your project root');
  console.log('2. Add these lines:');
  console.log('   VITE_SUPABASE_URL=https://xxxxx.supabase.co');
  console.log('   VITE_SUPABASE_ANON_KEY=eyJhbGc...');
  console.log('3. Restart your dev server (npm run dev)');
} else {
  console.log(
    "%c [PROTOCOL STATUS] Supabase connection active ✓ ", 
    "color: #10b981; font-weight: bold; background: #1e1b4b; padding: 6px; border-radius: 8px; border: 1px solid #10b981;"
  );
  console.log('Connected to:', supabaseUrl);
}

// We always create a client instance to satisfy imports
// If not configured, we use placeholder values (won't work but won't crash)
const clientUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co';
const clientKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key';

export const supabase = createClient(clientUrl, clientKey);

// Export a test function for debugging
export const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured) {
    console.error('Cannot test connection: Supabase not configured');
    return { success: false, error: 'Not configured' };
  }

  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error: error.message };
    }
    console.log('✓ Supabase connection test passed');
    return { success: true, data };
  } catch (e: any) {
    console.error('Supabase connection test error:', e);
    return { success: false, error: e.message };
  }
};

// Make test function available in console for debugging
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
  (window as any).supabase = supabase;
}
