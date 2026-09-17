import type {
  AllergenDefinition,
  AllergenId,
  McasPresets,
  Severity,
} from './types';

/**
 * Master catalogue of triggers the app knows about. Onboarding, filters and the
 * allergy card all read from this list, so adding a trigger here makes it
 * available everywhere.
 */
export const ALLERGEN_CATALOG: AllergenDefinition[] = [
  {
    id: 'dairy',
    label: 'Dairy',
    kind: 'allergen',
    description: 'Milk, butter, cream, cheese, whey, casein.',
    aliases: ['milk', 'butter', 'cream', 'cheese', 'whey', 'casein', 'ghee'],
  },
  {
    id: 'gluten',
    label: 'Gluten',
    kind: 'allergen',
    description: 'Wheat, barley, rye, malt, and cross-contact from shared surfaces.',
    aliases: ['wheat', 'barley', 'rye', 'malt', 'seitan', 'roux'],
  },
  {
    id: 'wheat',
    label: 'Wheat',
    kind: 'allergen',
    description: 'Wheat specifically, including spelt and semolina.',
    aliases: ['flour', 'semolina', 'spelt', 'farro', 'couscous'],
  },
  {
    id: 'tree-nuts',
    label: 'Tree nuts',
    kind: 'allergen',
    description: 'Almond, cashew, walnut, pecan, pistachio, hazelnut, etc.',
    aliases: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'praline', 'marzipan'],
  },
  {
    id: 'peanuts',
    label: 'Peanuts',
    kind: 'allergen',
    description: 'Peanuts and peanut oil / flour.',
    aliases: ['groundnut', 'peanut oil', 'arachis'],
  },
  {
    id: 'shellfish',
    label: 'Shellfish',
    kind: 'allergen',
    description: 'Crustaceans and molluscs — shrimp, crab, lobster, clams, mussels.',
    aliases: ['shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop'],
  },
  {
    id: 'fish',
    label: 'Fish',
    kind: 'allergen',
    description: 'Finned fish and fish-derived sauces / stocks.',
    aliases: ['anchovy', 'fish sauce', 'worcestershire', 'dashi', 'bonito'],
  },
  {
    id: 'egg',
    label: 'Egg',
    kind: 'allergen',
    description: 'Egg white and yolk, incl. mayo, aioli, egg wash, some pastas.',
    aliases: ['mayonnaise', 'aioli', 'albumin', 'meringue', 'egg wash'],
  },
  {
    id: 'soy',
    label: 'Soy',
    kind: 'allergen',
    description: 'Soybeans, soy sauce, tofu, edamame, soy lecithin.',
    aliases: ['soya', 'tofu', 'edamame', 'tamari', 'soy lecithin', 'miso'],
  },
  {
    id: 'sesame',
    label: 'Sesame',
    kind: 'allergen',
    description: 'Sesame seeds, tahini, sesame oil.',
    aliases: ['tahini', 'sesame oil', 'benne', 'gomashio'],
  },
  {
    id: 'nightshades',
    label: 'Nightshades',
    kind: 'intolerance',
    description: 'Tomato, potato, peppers, eggplant, paprika, chilli.',
    aliases: ['tomato', 'potato', 'pepper', 'eggplant', 'aubergine', 'paprika', 'chilli', 'cayenne'],
  },
  {
    id: 'histamine',
    label: 'High-histamine foods',
    kind: 'mcas-trigger',
    description: 'Aged, cured, fermented, leftover, or slow-cooked high-histamine foods.',
    aliases: ['aged cheese', 'cured meat', 'sauerkraut', 'vinegar', 'soy sauce', 'bone broth'],
  },
  {
    id: 'fermented',
    label: 'Fermented foods',
    kind: 'mcas-trigger',
    description: 'Kimchi, miso, kombucha, yoghurt, sourdough, vinegar.',
    aliases: ['kimchi', 'miso', 'kombucha', 'yoghurt', 'sourdough', 'vinegar', 'kefir'],
  },
  {
    id: 'sulfites',
    label: 'Sulfites',
    kind: 'intolerance',
    description: 'Preservatives in wine, dried fruit, some condiments.',
    aliases: ['sulphite', 'sulfur dioxide', 'e220', 'wine', 'dried fruit'],
  },
  {
    id: 'corn',
    label: 'Corn',
    kind: 'intolerance',
    description: 'Corn, cornstarch, corn syrup, masa, polenta.',
    aliases: ['maize', 'cornstarch', 'corn syrup', 'masa', 'polenta', 'dextrose'],
  },
  {
    id: 'alliums',
    label: 'Garlic & onion',
    kind: 'intolerance',
    description: 'Garlic, onion, shallot, leek, chives (FODMAP / MCAS trigger).',
    aliases: ['garlic', 'onion', 'shallot', 'leek', 'chive', 'scallion'],
  },
  {
    id: 'citrus',
    label: 'Citrus',
    kind: 'mcas-trigger',
    description: 'Lemon, lime, orange — histamine liberators for some people.',
    aliases: ['lemon', 'lime', 'orange', 'grapefruit'],
  },
];

export const ALLERGEN_BY_ID: Record<AllergenId, AllergenDefinition> =
  ALLERGEN_CATALOG.reduce(
    (acc, def) => {
      acc[def.id] = def;
      return acc;
    },
    {} as Record<AllergenId, AllergenDefinition>,
  );

export function allergenLabel(id: AllergenId): string {
  return ALLERGEN_BY_ID[id]?.label ?? id;
}

/* -------------------------------------------------------------------------- */
/*  Severity helpers                                                           */
/* -------------------------------------------------------------------------- */

export const SEVERITY_ORDER: Severity[] = [
  'mild',
  'moderate',
  'severe',
  'anaphylaxis',
];

export const SEVERITY_LABEL: Record<Severity, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
  anaphylaxis: 'Anaphylaxis',
};

export const SEVERITY_RANK: Record<Severity, number> = {
  mild: 0,
  moderate: 1,
  severe: 2,
  anaphylaxis: 3,
};

export function isMoreSevere(a: Severity, b: Severity): boolean {
  return SEVERITY_RANK[a] > SEVERITY_RANK[b];
}

/* -------------------------------------------------------------------------- */
/*  MCAS presets                                                              */
/* -------------------------------------------------------------------------- */

export const DEFAULT_MCAS_PRESETS: McasPresets = {
  avoidFermented: false,
  avoidAged: false,
  avoidLeftovers: false,
  avoidHighHistamine: false,
  avoidAlcohol: false,
  preferFreshlyCooked: false,
};

export const MCAS_PRESET_META: {
  key: keyof McasPresets;
  label: string;
  hint: string;
}[] = [
  {
    key: 'avoidHighHistamine',
    label: 'Avoid high-histamine foods',
    hint: 'Aged cheese, cured meat, spinach, avocado, tomato, shellfish.',
  },
  {
    key: 'avoidFermented',
    label: 'Avoid fermented foods',
    hint: 'Kimchi, miso, soy sauce, vinegar, kombucha, sourdough.',
  },
  {
    key: 'avoidAged',
    label: 'Avoid aged / cured foods',
    hint: 'Aged cheese, salami, prosciutto, dry-aged beef.',
  },
  {
    key: 'avoidLeftovers',
    label: 'No leftovers or pre-made',
    hint: 'Histamine climbs as food sits — needs made-to-order.',
  },
  {
    key: 'avoidAlcohol',
    label: 'Avoid alcohol',
    hint: 'Wine, beer and spirits block histamine breakdown (DAO).',
  },
  {
    key: 'preferFreshlyCooked',
    label: 'Prefer freshly cooked to order',
    hint: 'Flag restaurants that cook each dish from scratch.',
  },
];
