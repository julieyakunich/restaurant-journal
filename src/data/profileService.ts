import { supabase, getCurrentUserId, requireUserId } from '../lib/supabase';
import { DEFAULT_MCAS_PRESETS } from './allergens';
import { rowToProfile, profileToRow } from './_mappers';
import type { McasPresets, TriggerEntry, UserProfile } from './types';

/**
 * Profile data access — Supabase, scoped to the signed-in user.
 *
 * `profiles.id` IS the user's auth id, and RLS only ever exposes that one row.
 * A row is created automatically on signup by the `handle_new_user` trigger
 * (see supabase/migrations); `emptyProfile` is the client-side fallback.
 *
 *   getUserProfile()   -> from('profiles').select().eq('id', uid).maybeSingle()
 *   saveUserProfile(p) -> from('profiles').upsert(row)
 */

export async function getUserProfile(): Promise<UserProfile> {
  const uid = await getCurrentUserId();
  if (!uid) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToProfile(data) : emptyProfile(uid);
}

export async function saveUserProfile(
  patch: Partial<Omit<UserProfile, 'id'>>,
): Promise<UserProfile> {
  const uid = await requireUserId();
  const current = await getUserProfile();
  const next: UserProfile = {
    ...current,
    ...patch,
    id: uid,
    mcasPresets: patch.mcasPresets
      ? { ...current.mcasPresets, ...patch.mcasPresets }
      : current.mcasPresets,
    triggers: patch.triggers ?? current.triggers,
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileToRow(next))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToProfile(data);
}

export async function setTriggers(triggers: TriggerEntry[]): Promise<UserProfile> {
  return saveUserProfile({ triggers });
}

export async function setMcasMode(
  mcasMode: boolean,
  presets?: Partial<McasPresets>,
): Promise<UserProfile> {
  const patch: Partial<Omit<UserProfile, 'id'>> = { mcasMode };
  if (presets) patch.mcasPresets = presets as McasPresets;
  else if (!mcasMode) patch.mcasPresets = { ...DEFAULT_MCAS_PRESETS };
  return saveUserProfile(patch);
}

/** A blank profile, used before the first save. */
export function emptyProfile(id: string): UserProfile {
  return {
    id,
    displayName: 'Traveler',
    mcasMode: false,
    mcasPresets: { ...DEFAULT_MCAS_PRESETS },
    triggers: [],
    additionalNotes: '',
    preferredCardLanguage: 'en',
    updatedAt: new Date().toISOString(),
  };
}
