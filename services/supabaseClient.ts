import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Only initialize if keys are present
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const isSupabaseConfigured = () => {
  const isConfigured = !!supabase;
  if (!isConfigured) {
    // This log helps debug why the app might be staying in "Mock Mode"
    console.debug("AidMatch: Supabase is NOT configured. Using mock data. Check services/supabaseClient.ts");
  } else {
    console.debug("AidMatch: Supabase connected.");
  }
  return isConfigured;
};