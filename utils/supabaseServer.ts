import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let cachedKey: string | null = null;
let warnedAboutFallback = false;

export const getSupabaseServerClient = (): SupabaseClient => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured');
  }

  const keyToUse = serviceRoleKey || anonKey;

  if (!keyToUse) {
    throw new Error('Supabase credentials are not configured');
  }

  if (!serviceRoleKey && !warnedAboutFallback) {
    console.warn('[Supabase] Falling back to anon key for server client. Configure SUPABASE_SERVICE_ROLE_KEY to bypass RLS for storage operations.');
    warnedAboutFallback = true;
  }

  if (!cachedClient || cachedKey !== keyToUse) {
    cachedClient = createClient(supabaseUrl, keyToUse, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    cachedKey = keyToUse;
  }

  return cachedClient;
};
