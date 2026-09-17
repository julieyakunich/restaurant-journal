import { createClient } from '@supabase/supabase-js';
import type { Database } from '../data/database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase config. Copy .env.example to .env and set ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart `npm run dev`.',
  );
}

/**
 * Single shared browser client. Auth sessions are persisted to localStorage and
 * auto-refreshed; every request carries the signed-in user's JWT and row access
 * is decided by the RLS policies in supabase/migrations. Logged-out requests hit
 * the anon role, which the policies deny.
 */
export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Current signed-in user's id, or null. Reads the in-memory session (no network). */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Like getCurrentUserId but throws if nobody is signed in. */
export async function requireUserId(): Promise<string> {
  const id = await getCurrentUserId();
  if (!id) throw new Error('You need to be signed in to do that.');
  return id;
}
