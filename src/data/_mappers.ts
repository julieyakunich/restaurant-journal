/**
 * Row <-> domain-model mappers. The database stores snake_case columns and a
 * few camelCase jsonb blobs (review checklist, mcas presets, profile triggers)
 * whose shape already matches the app models, so those pass straight through.
 *
 * Keeping every conversion here means the services and components never see a
 * raw database row.
 */
import type { Database, Json } from './database.types';
import type {
  AccommodationChecklist,
  AllergenId,
  ConfidenceLevel,
  Destination,
  McasPresets,
  Restaurant,
  Review,
  Severity,
  TriggerEntry,
  Trip,
  UserProfile,
} from './types';

type RestaurantRow = Database['public']['Tables']['restaurants']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type TripRow = Database['public']['Tables']['trips']['Row'];
type DestinationRow = Database['public']['Tables']['destinations']['Row'];

export type RestaurantRowWithReviews = RestaurantRow & {
  reviews: ReviewRow[] | null;
};

/* ------------------------------- reads ---------------------------------- */

export function rowToReview(r: ReviewRow): Review {
  return {
    id: r.id,
    restaurantId: r.restaurant_id,
    authorName: r.author_name,
    visitedAt: r.visited_at,
    reviewerAllergens: (r.reviewer_allergens ?? []) as AllergenId[],
    reviewerHasMcas: r.reviewer_has_mcas,
    trustRating: r.trust_rating,
    checklist: r.checklist as unknown as AccommodationChecklist,
    reactionOccurred: r.reaction_occurred,
    reactionSeverity: (r.reaction_severity as Severity | null) ?? undefined,
    wouldReturn: r.would_return,
    comment: r.comment,
  };
}

export function rowToRestaurant(r: RestaurantRowWithReviews): Restaurant {
  const reviews = (r.reviews ?? [])
    .map(rowToReview)
    .sort((a, b) => (a.visitedAt < b.visitedAt ? 1 : -1));
  return {
    id: r.id,
    name: r.name,
    city: r.city,
    country: r.country,
    neighborhood: r.neighborhood,
    cuisine: r.cuisine ?? [],
    priceLevel: r.price_level as Restaurant['priceLevel'],
    distanceKm: Number(r.distance_km),
    coordinates: { lat: r.lat, lng: r.lng },
    confidence: r.confidence as ConfidenceLevel,
    lastVerifiedAt: r.last_verified_at ?? undefined,
    safeForAllergens: (r.safe_for_allergens ?? []) as AllergenId[],
    cautionAllergens: (r.caution_allergens ?? []) as AllergenId[],
    accommodatesMcas: r.accommodates_mcas,
    lowHistamineOptions: r.low_histamine_options,
    cooksToOrder: r.cooks_to_order,
    hasDedicatedAllergenMenu: r.has_dedicated_allergen_menu,
    hasSeparateFryer: r.has_separate_fryer,
    summary: r.summary,
    safeSnacks: r.safe_snacks ?? [],
    openNow: r.open_now,
    hours: r.hours,
    phone: r.phone ?? undefined,
    reviews,
  };
}

export function rowToProfile(r: ProfileRow): UserProfile {
  return {
    id: r.id,
    displayName: r.display_name,
    mcasMode: r.mcas_mode,
    mcasPresets: r.mcas_presets as unknown as McasPresets,
    triggers: (r.triggers as unknown as TriggerEntry[]) ?? [],
    additionalNotes: r.additional_notes,
    preferredCardLanguage: r.preferred_card_language,
    updatedAt: r.updated_at,
  };
}

export function rowToTrip(r: TripRow): Trip {
  return {
    id: r.id,
    destination: r.destination,
    country: r.country,
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status as Trip['status'],
    savedRestaurantIds: r.saved_restaurant_ids ?? [],
    notes: r.notes,
    createdAt: r.created_at,
  };
}

export function rowToDestination(r: DestinationRow): Destination {
  return {
    id: r.id,
    city: r.city,
    country: r.country,
    restaurantCount: r.restaurant_count,
    blurb: r.blurb,
  };
}

/* ------------------------------- writes -------------------------------- */

export function profileToRow(
  p: UserProfile,
): Database['public']['Tables']['profiles']['Insert'] {
  return {
    id: p.id,
    display_name: p.displayName,
    mcas_mode: p.mcasMode,
    mcas_presets: p.mcasPresets as unknown as Json,
    triggers: p.triggers as unknown as Json,
    additional_notes: p.additionalNotes,
    preferred_card_language: p.preferredCardLanguage,
    updated_at: p.updatedAt,
  };
}

export function reviewToRow(
  id: string,
  restaurantId: string,
  input: Omit<Review, 'id' | 'restaurantId'>,
): Database['public']['Tables']['reviews']['Insert'] {
  return {
    id,
    restaurant_id: restaurantId,
    author_name: input.authorName,
    visited_at: input.visitedAt,
    reviewer_allergens: input.reviewerAllergens,
    reviewer_has_mcas: input.reviewerHasMcas,
    trust_rating: input.trustRating,
    checklist: input.checklist as unknown as Json,
    reaction_occurred: input.reactionOccurred,
    reaction_severity: input.reactionSeverity ?? null,
    would_return: input.wouldReturn,
    comment: input.comment,
  };
}
