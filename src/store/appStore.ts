import { create } from 'zustand';
import {
  getActiveTrip,
  getTrips,
  getUserProfile,
  saveTrip,
  saveUserProfile,
  addRestaurantToTrip as svcAddToTrip,
  removeRestaurantFromTrip as svcRemoveFromTrip,
} from '../data';
import type { Trip, UserProfile } from '../data';

/**
 * Shared app state: the user's profile, their trips, and which trip is "active"
 * (the one Save-to-trip targets by default).
 *
 * All mutations go through the data services (Supabase), so this store never
 * talks to a backend directly. It is hydrated once the user signs in and
 * `reset()` on sign-out.
 */

interface AppState {
  /* data */
  profile: UserProfile | null;
  trips: Trip[];
  activeTripId: string | null;

  /* status */
  hydrated: boolean;
  hydrating: boolean;

  /* lifecycle */
  hydrate: () => Promise<void>;
  reset: () => void;

  /* profile */
  saveProfile: (patch: Partial<Omit<UserProfile, 'id'>>) => Promise<void>;

  /* trips */
  createTrip: (input: {
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) => Promise<Trip>;
  setActiveTrip: (tripId: string) => void;
  addRestaurantToTrip: (restaurantId: string, tripId?: string) => Promise<void>;
  removeRestaurantFromTrip: (
    restaurantId: string,
    tripId?: string,
  ) => Promise<void>;

  /* selectors */
  activeTrip: () => Trip | null;
  isSaved: (restaurantId: string, tripId?: string) => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  trips: [],
  activeTripId: null,
  hydrated: false,
  hydrating: false,

  async hydrate() {
    if (get().hydrating || get().hydrated) return;
    set({ hydrating: true });
    try {
      const [profile, trips, active] = await Promise.all([
        getUserProfile(),
        getTrips(),
        getActiveTrip(),
      ]);
      set({
        profile,
        trips,
        activeTripId: active?.id ?? trips[0]?.id ?? null,
        hydrated: true,
      });
    } catch (err) {
      // Most likely the user signed out mid-flight; leave hydrated=false so a
      // later sign-in retries. Anything else is worth seeing in the console.
      if (!/not signed in|permission denied|JWT/i.test(String(err))) {
        console.error('Failed to hydrate app state', err);
      }
    } finally {
      set({ hydrating: false });
    }
  },

  reset() {
    set({
      profile: null,
      trips: [],
      activeTripId: null,
      hydrated: false,
      hydrating: false,
    });
  },

  async saveProfile(patch) {
    const updated = await saveUserProfile(patch);
    set({ profile: updated });
  },

  async createTrip(input) {
    const trip = await saveTrip(input);
    set((s) => ({ trips: [trip, ...s.trips], activeTripId: trip.id }));
    return trip;
  },

  setActiveTrip(tripId) {
    set({ activeTripId: tripId });
  },

  async addRestaurantToTrip(restaurantId, tripId) {
    const targetId = tripId ?? get().activeTripId;
    if (!targetId) throw new Error('No active trip to save into.');
    const updated = await svcAddToTrip(targetId, restaurantId);
    set((s) => ({
      trips: s.trips.map((t) => (t.id === updated.id ? updated : t)),
    }));
  },

  async removeRestaurantFromTrip(restaurantId, tripId) {
    const targetId = tripId ?? get().activeTripId;
    if (!targetId) return;
    const updated = await svcRemoveFromTrip(targetId, restaurantId);
    set((s) => ({
      trips: s.trips.map((t) => (t.id === updated.id ? updated : t)),
    }));
  },

  activeTrip() {
    const { trips, activeTripId } = get();
    return trips.find((t) => t.id === activeTripId) ?? null;
  },

  isSaved(restaurantId, tripId) {
    const { trips, activeTripId } = get();
    const target = tripId ?? activeTripId;
    const trip = trips.find((t) => t.id === target);
    return trip ? trip.savedRestaurantIds.includes(restaurantId) : false;
  },
}));
