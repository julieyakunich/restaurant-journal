import { supabase, requireUserId } from '../lib/supabase';
import { newId } from '../lib/id';
import { rowToDestination, rowToTrip } from './_mappers';
import type { Destination, Trip } from './types';

/**
 * Trip data access — Supabase.
 *
 *   getDestinations()  -> from('destinations').select().order('sort_order')
 *   getTrips()         -> from('trips').select().order('created_at')
 *   saveTrip(trip)     -> insert / update on 'trips'
 *   addToTrip(id, rid) -> read-modify-write the saved_restaurant_ids array
 */

export async function getDestinations(): Promise<Destination[]> {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToDestination);
}

export async function getTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToTrip);
}

export async function getTripById(id: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToTrip(data) : null;
}

export async function getActiveTrip(): Promise<Trip | null> {
  const trips = await getTrips();
  return (
    trips.find((t) => t.status === 'active') ??
    trips.find((t) => t.status === 'planning') ??
    null
  );
}

export type NewTripInput = {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  notes?: string;
  savedRestaurantIds?: string[];
};

export async function saveTrip(
  input: NewTripInput & { id?: string; status?: Trip['status'] },
): Promise<Trip> {
  if (input.id) {
    const { data, error } = await supabase
      .from('trips')
      .update({
        destination: input.destination,
        country: input.country,
        start_date: input.startDate,
        end_date: input.endDate,
        notes: input.notes,
        status: input.status,
        saved_restaurant_ids: input.savedRestaurantIds,
      })
      .eq('id', input.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToTrip(data);
  }

  const { data, error } = await supabase
    .from('trips')
    .insert({
      id: newId('trip'),
      user_id: await requireUserId(),
      destination: input.destination,
      country: input.country,
      start_date: input.startDate,
      end_date: input.endDate,
      status: input.status ?? 'planning',
      saved_restaurant_ids: input.savedRestaurantIds ?? [],
      notes: input.notes ?? '',
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToTrip(data);
}

export async function addRestaurantToTrip(
  tripId: string,
  restaurantId: string,
): Promise<Trip> {
  const trip = await getTripById(tripId);
  if (!trip) throw new Error(`Trip ${tripId} not found`);
  if (trip.savedRestaurantIds.includes(restaurantId)) return trip;

  const { data, error } = await supabase
    .from('trips')
    .update({ saved_restaurant_ids: [...trip.savedRestaurantIds, restaurantId] })
    .eq('id', tripId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToTrip(data);
}

export async function removeRestaurantFromTrip(
  tripId: string,
  restaurantId: string,
): Promise<Trip> {
  const trip = await getTripById(tripId);
  if (!trip) throw new Error(`Trip ${tripId} not found`);

  const { data, error } = await supabase
    .from('trips')
    .update({
      saved_restaurant_ids: trip.savedRestaurantIds.filter(
        (id) => id !== restaurantId,
      ),
    })
    .eq('id', tripId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToTrip(data);
}

export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) throw new Error(error.message);
}
