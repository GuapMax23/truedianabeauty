import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storageKey: 'dianabeauty-supabase-auth',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseConfigured = hasSupabaseConfig;

export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(
      "Fonctionnalité indisponible : configurez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY pour activer l'espace membre."
    );
  }
  return supabase;
};

export const SUPABASE_STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'products';

