import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Authentication state. `initialize()` reads any persisted session and then
 * subscribes to Supabase auth events; call it once from <App>.
 */

type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  /** Last auth error message, for the auth form to display. */
  error: string | null;

  initialize: () => () => void;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ ok: boolean; needsEmailConfirm: boolean }>;
  signIn: (email: string, password: string) => Promise<boolean>;
  /** No credentials involved — Supabase issues a real, isolated anonymous user. */
  signInAsGuest: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  session: null,
  user: null,
  error: null,

  initialize() {
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        set((s) =>
          // don't clobber a state an auth event already set
          s.status === 'loading'
            ? {
                session: data.session,
                user: data.session?.user ?? null,
                status: data.session ? 'signedIn' : 'signedOut',
              }
            : s,
        );
      })
      .catch(() => {
        set((s) => (s.status === 'loading' ? { status: 'signedOut' } : s));
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        status: session ? 'signedIn' : 'signedOut',
      });
    });

    return () => data.subscription.unsubscribe();
  },

  async signUp(email, password, displayName) {
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) {
      set({ error: error.message });
      return { ok: false, needsEmailConfirm: false };
    }
    // If the project requires email confirmation there is a user but no session.
    return { ok: true, needsEmailConfirm: !data.session };
  },

  async signIn(email, password) {
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      return false;
    }
    return true;
  },

  async signInAsGuest() {
    set({ error: null });
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      set({
        error:
          error.message === 'Anonymous sign-ins are disabled'
            ? 'Guest browsing isn’t turned on for this project yet.'
            : error.message,
      });
      return false;
    }
    return true;
  },

  async signOut() {
    await supabase.auth.signOut();
    set({ session: null, user: null, status: 'signedOut', error: null });
  },

  clearError() {
    set({ error: null });
  },
}));
