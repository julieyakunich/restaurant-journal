import { useEffect, useMemo, useState } from 'react';
import {
  getRestaurants,
  matchRestaurant,
  type Restaurant,
  type RestaurantMatch,
} from '../data';
import { useAppStore } from '../store/appStore';

export interface MatchedRestaurant {
  restaurant: Restaurant;
  match: RestaurantMatch;
}

/**
 * Loads all restaurants once and pairs each with a match result against the
 * current user profile. Re-matches (cheap, in-memory) whenever the profile
 * changes.
 */
export function useMatchedRestaurants() {
  const profile = useAppStore((s) => s.profile);
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRestaurants()
      .then((rows) => {
        if (!cancelled) setRestaurants(rows);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const matched = useMemo<MatchedRestaurant[] | null>(() => {
    if (!restaurants || !profile) return null;
    return restaurants.map((restaurant) => ({
      restaurant,
      match: matchRestaurant(restaurant, profile),
    }));
  }, [restaurants, profile]);

  return { matched, loading: matched === null && !error, error };
}
