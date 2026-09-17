import { SEVERITY_RANK } from './allergens';
import type { AllergenId, Restaurant, Severity, UserProfile } from './types';

/**
 * Pure allergen-matching logic. Kept separate from the data services so it can
 * run client-side regardless of where the restaurant/profile data comes from.
 */

export type AllergenMatchStatus = 'safe' | 'caution' | 'unknown';

export interface AllergenMatch {
  allergenId: AllergenId;
  severity: Severity;
  status: AllergenMatchStatus;
  /** Personal note from the user's trigger entry, if any. */
  notes?: string;
}

export type MatchVerdict =
  | 'safe-bet'
  | 'proceed-with-care'
  | 'not-enough-info'
  | 'high-risk';

export interface RestaurantMatch {
  restaurantId: string;
  perAllergen: AllergenMatch[];
  safeCount: number;
  cautionCount: number;
  unknownCount: number;
  /** A caution/unknown on a severe or anaphylaxis trigger. */
  hasHighRiskGap: boolean;
  /** True when MCAS mode is off, or the restaurant accommodates MCAS. */
  mcasFriendly: boolean;
  /** 0–100, used for sorting the Home + Emergency lists. */
  score: number;
  verdict: MatchVerdict;
}

const HIGH_SEVERITY: Severity[] = ['severe', 'anaphylaxis'];

function statusFor(restaurant: Restaurant, allergenId: AllergenId): AllergenMatchStatus {
  if (restaurant.safeForAllergens.includes(allergenId)) return 'safe';
  if (restaurant.cautionAllergens.includes(allergenId)) return 'caution';
  return 'unknown';
}

export function matchRestaurant(
  restaurant: Restaurant,
  profile: UserProfile,
): RestaurantMatch {
  const perAllergen: AllergenMatch[] = profile.triggers
    .slice()
    .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])
    .map((t) => ({
      allergenId: t.allergenId,
      severity: t.severity,
      status: statusFor(restaurant, t.allergenId),
      notes: t.notes,
    }));

  const safeCount = perAllergen.filter((m) => m.status === 'safe').length;
  const cautionCount = perAllergen.filter((m) => m.status === 'caution').length;
  const unknownCount = perAllergen.filter((m) => m.status === 'unknown').length;

  const hasHighRiskGap = perAllergen.some(
    (m) => m.status !== 'safe' && HIGH_SEVERITY.includes(m.severity),
  );

  const mcasFriendly = !profile.mcasMode || restaurant.accommodatesMcas;

  // ---- score ----
  let score = 100;
  for (const m of perAllergen) {
    const highSeverity = HIGH_SEVERITY.includes(m.severity);
    if (m.status === 'caution') score -= highSeverity ? 34 : 18;
    else if (m.status === 'unknown') score -= highSeverity ? 20 : 10;
  }
  if (restaurant.confidence === 'verified-safe') score += 6;
  if (restaurant.confidence === 'no-data') score = Math.min(score, 38);
  if (restaurant.confidence === 'some-reports') score = Math.min(score, 82);
  if (profile.mcasMode && !restaurant.accommodatesMcas) score -= 16;
  if (profile.mcasMode && restaurant.lowHistamineOptions) score += 4;
  score = Math.max(0, Math.min(100, Math.round(score)));

  // ---- verdict ----
  let verdict: MatchVerdict;
  if (restaurant.confidence === 'no-data' && restaurant.safeForAllergens.length === 0) {
    verdict = 'not-enough-info';
  } else if (hasHighRiskGap) {
    verdict = 'high-risk';
  } else if (cautionCount > 0 || unknownCount > 0 || !mcasFriendly) {
    verdict = 'proceed-with-care';
  } else {
    verdict = 'safe-bet';
  }

  return {
    restaurantId: restaurant.id,
    perAllergen,
    safeCount,
    cautionCount,
    unknownCount,
    hasHighRiskGap,
    mcasFriendly,
    score,
    verdict,
  };
}

export const VERDICT_META: Record<
  MatchVerdict,
  { label: string; blurb: string }
> = {
  'safe-bet': {
    label: 'Safe bet',
    blurb: 'Covers all your triggers and has verified reports.',
  },
  'proceed-with-care': {
    label: 'Proceed with care',
    blurb: 'Workable, but some of your triggers need a conversation.',
  },
  'not-enough-info': {
    label: 'Not enough info',
    blurb: 'No allergy data collected here yet.',
  },
  'high-risk': {
    label: 'High risk',
    blurb: 'A serious trigger of yours is not covered here.',
  },
};

/** Sort helper: best match first, then closest. */
export function compareByMatchThenDistance(
  a: { match: RestaurantMatch; restaurant: Restaurant },
  b: { match: RestaurantMatch; restaurant: Restaurant },
): number {
  if (b.match.score !== a.match.score) return b.match.score - a.match.score;
  return a.restaurant.distanceKm - b.restaurant.distanceKm;
}

/** Sort helper for Emergency Mode: closest first, then best match. */
export function compareByDistanceThenMatch(
  a: { match: RestaurantMatch; restaurant: Restaurant },
  b: { match: RestaurantMatch; restaurant: Restaurant },
): number {
  if (a.restaurant.distanceKm !== b.restaurant.distanceKm) {
    return a.restaurant.distanceKm - b.restaurant.distanceKm;
  }
  return b.match.score - a.match.score;
}
