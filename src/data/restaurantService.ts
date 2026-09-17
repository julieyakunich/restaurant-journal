import { supabase, requireUserId } from '../lib/supabase';
import {
  rowToRestaurant,
  rowToReview,
  reviewToRow,
  type RestaurantRowWithReviews,
} from './_mappers';
import type { AllergenId, Restaurant, Review } from './types';

/**
 * Restaurant data access — Supabase.
 *
 *   getRestaurants(query)   -> from('restaurants').select('*, reviews(*)')  + filters
 *   getRestaurantById(id)   -> ...eq('id', id).maybeSingle()
 *   getRestaurantsByIds     -> ...in('id', ids)
 *   addReview(...)          -> from('reviews').insert(...)
 */

const SELECT_WITH_REVIEWS = '*, reviews(*)';

export interface RestaurantQuery {
  city?: string;
  /** Only restaurants marked safe for ALL of these allergens. */
  safeForAll?: AllergenId[];
  openNow?: boolean;
  mcasFriendlyOnly?: boolean;
}

export async function getRestaurants(
  query: RestaurantQuery = {},
): Promise<Restaurant[]> {
  let q = supabase.from('restaurants').select(SELECT_WITH_REVIEWS);

  if (query.city) q = q.ilike('city', query.city);
  if (query.openNow) q = q.eq('open_now', true);
  if (query.mcasFriendlyOnly) q = q.eq('accommodates_mcas', true);
  if (query.safeForAll && query.safeForAll.length > 0) {
    q = q.contains('safe_for_allergens', query.safeForAll);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as RestaurantRowWithReviews[]).map(rowToRestaurant);
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select(SELECT_WITH_REVIEWS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToRestaurant(data as RestaurantRowWithReviews) : null;
}

export async function getRestaurantsByIds(ids: string[]): Promise<Restaurant[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('restaurants')
    .select(SELECT_WITH_REVIEWS)
    .in('id', ids);
  if (error) throw new Error(error.message);
  return (data as RestaurantRowWithReviews[]).map(rowToRestaurant);
}

export async function getCities(): Promise<string[]> {
  const { data, error } = await supabase.from('restaurants').select('city');
  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((r) => r.city))).sort();
}

/** Restaurants that have at least one grab-and-go safe snack listed. */
export async function getRestaurantsWithSafeSnacks(): Promise<Restaurant[]> {
  const all = await getRestaurants();
  return all.filter((r) => r.safeSnacks.length > 0);
}

export type NewReviewInput = Omit<Review, 'id' | 'restaurantId'>;

export async function addReview(
  restaurantId: string,
  input: NewReviewInput,
): Promise<Review> {
  const id = `rev-${restaurantId}-${Date.now().toString(36)}`;
  const { data, error } = await supabase
    .from('reviews')
    .insert({ ...reviewToRow(id, restaurantId, input), user_id: await requireUserId() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToReview(data);
}
