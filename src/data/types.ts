/**
 * Core domain types for Restaurant Journal.
 *
 * These are intentionally framework-agnostic. When the Supabase backend is
 * wired up, table row shapes should map onto these (or a thin mapper layer
 * should convert snake_case rows -> these camelCase models inside the
 * services), so that components never need to change.
 */

/* -------------------------------------------------------------------------- */
/*  Allergens & triggers                                                       */
/* -------------------------------------------------------------------------- */

export type AllergenId =
  | 'dairy'
  | 'gluten'
  | 'wheat'
  | 'tree-nuts'
  | 'peanuts'
  | 'shellfish'
  | 'fish'
  | 'egg'
  | 'soy'
  | 'sesame'
  | 'nightshades'
  | 'histamine'
  | 'fermented'
  | 'sulfites'
  | 'corn'
  | 'alliums'
  | 'citrus';

/** How the trigger is categorised in the UI (affects grouping + copy). */
export type AllergenKind = 'allergen' | 'intolerance' | 'mcas-trigger';

export interface AllergenDefinition {
  id: AllergenId;
  /** Short human label, e.g. "Tree nuts". */
  label: string;
  kind: AllergenKind;
  /** One-line description shown in onboarding / profile. */
  description: string;
  /** Common menu/ingredient synonyms — handy later for card generation + search. */
  aliases: string[];
}

/** Severity ordered from least to most dangerous. */
export type Severity = 'mild' | 'moderate' | 'severe' | 'anaphylaxis';

export interface TriggerEntry {
  allergenId: AllergenId;
  severity: Severity;
  /** Free-text personal notes ("small amounts of butter are ok"). */
  notes?: string;
}

/**
 * MCAS / histamine-intolerance preset toggles. These are separate from the
 * per-allergen list because they describe *patterns* of food handling rather
 * than single ingredients.
 */
export interface McasPresets {
  avoidFermented: boolean;
  avoidAged: boolean;
  avoidLeftovers: boolean;
  avoidHighHistamine: boolean;
  avoidAlcohol: boolean;
  preferFreshlyCooked: boolean;
}

/* -------------------------------------------------------------------------- */
/*  User profile                                                               */
/* -------------------------------------------------------------------------- */

export interface UserProfile {
  id: string;
  displayName: string;
  /** Whether MCAS / histamine mode is switched on for this user. */
  mcasMode: boolean;
  mcasPresets: McasPresets;
  triggers: TriggerEntry[];
  /** Anything a server / chef should know, surfaced on the allergy card. */
  additionalNotes: string;
  /** Preferred language for generated allergy cards (BCP-47-ish code). */
  preferredCardLanguage: string;
  updatedAt: string;
}

/* -------------------------------------------------------------------------- */
/*  Restaurants & reviews                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Confidence that this restaurant can safely accommodate allergies, based on
 * verification + community reports.
 *  - verified-safe : staff/menu verified, multiple clean reports
 *  - some-reports  : mixed or limited community reports, proceed with care
 *  - no-data       : no allergy-specific information yet
 */
export type ConfidenceLevel = 'verified-safe' | 'some-reports' | 'no-data';

/**
 * Accommodation-specific checklist captured per review. This is the heart of
 * the "structured review" idea — it is NOT a star rating, it records what the
 * restaurant actually *did*.
 */
export interface AccommodationChecklist {
  /** Server/kitchen read the full ingredient list on request. */
  readFullIngredientList: boolean;
  /** Staff understood and spoke to cross-contact / shared equipment risk. */
  understoodCrossContact: boolean;
  /** Kitchen used a dedicated prep area / clean pans for the order. */
  dedicatedPrepArea: boolean;
  /** A separate fryer was available (relevant for gluten / dairy / fish). */
  separateFryer: boolean;
  /** Manager or chef was personally involved in the order. */
  chefOrManagerInvolved: boolean;
  /** Allergen info was available in writing (menu, binder, app). */
  writtenAllergenInfo: boolean;
}

export interface Review {
  id: string;
  restaurantId: string;
  authorName: string;
  /** ISO date of the visit. */
  visitedAt: string;
  /** Which of the reviewer's allergens were relevant to this visit. */
  reviewerAllergens: AllergenId[];
  /** Reviewer also manages MCAS / histamine load. */
  reviewerHasMcas: boolean;
  /** Overall trust score 1-5 (how confident they'd send a friend here). */
  trustRating: number;
  checklist: AccommodationChecklist;
  /** Did the reviewer have a reaction after eating here? */
  reactionOccurred: boolean;
  reactionSeverity?: Severity;
  wouldReturn: boolean;
  comment: string;
}

export interface Restaurant {
  id: string;
  name: string;
  city: string;
  country: string;
  neighborhood: string;
  cuisine: string[];
  /** 1 = $, 4 = $$$$. */
  priceLevel: 1 | 2 | 3 | 4;
  /** Straight-line distance from the user's current location, km. Mock only. */
  distanceKm: number;
  coordinates: { lat: number; lng: number };
  confidence: ConfidenceLevel;
  /** ISO date the safety info was last verified (undefined for no-data). */
  lastVerifiedAt?: string;

  /** Allergens the restaurant is known / verified to handle safely. */
  safeForAllergens: AllergenId[];
  /** Allergens where there is cross-contact risk or mixed reports. */
  cautionAllergens: AllergenId[];

  /** MCAS / histamine friendliness signals. */
  accommodatesMcas: boolean;
  lowHistamineOptions: boolean;
  cooksToOrder: boolean;

  hasDedicatedAllergenMenu: boolean;
  hasSeparateFryer: boolean;

  summary: string;
  /** Grab-and-go / low-prep items, used by Emergency Mode. */
  safeSnacks: string[];

  openNow: boolean;
  hours: string;
  phone?: string;

  reviews: Review[];
}

/* -------------------------------------------------------------------------- */
/*  Trips                                                                      */
/* -------------------------------------------------------------------------- */

export type TripStatus = 'planning' | 'active' | 'past';

export interface Trip {
  id: string;
  destination: string;
  country: string;
  /** ISO dates. */
  startDate: string;
  endDate: string;
  status: TripStatus;
  savedRestaurantIds: string[];
  notes: string;
  createdAt: string;
}

/** A destination the user can pick when starting a trip. */
export interface Destination {
  id: string;
  city: string;
  country: string;
  /** How many restaurants in the mock DB are in this city. */
  restaurantCount: number;
  blurb: string;
}

/* -------------------------------------------------------------------------- */
/*  Allergy card                                                               */
/* -------------------------------------------------------------------------- */

export interface AllergyCardLanguage {
  code: string;
  label: string;
}

/**
 * A generated allergy card. `bodyLines` is plain text ready to show / print;
 * `translatedBodyLines` is a placeholder for a future translation service and
 * currently just mirrors `bodyLines`.
 */
export interface AllergyCard {
  id: string;
  profileId: string;
  language: string;
  languageLabel: string;
  title: string;
  greeting: string;
  bodyLines: string[];
  translatedBodyLines: string[];
  severitySummary: string;
  footer: string;
  generatedAt: string;
}
