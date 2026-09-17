import {
  ALLERGEN_BY_ID,
  SEVERITY_LABEL,
  SEVERITY_RANK,
  MCAS_PRESET_META,
} from './allergens';
import { CARD_LANGUAGES } from './mock/languages';
import type { AllergyCard, AllergyCardLanguage, UserProfile } from './types';

/**
 * Allergy-card generation. Currently derives plain text from the profile.
 * `translatedBodyLines` is a placeholder that mirrors `bodyLines` — a real
 * translation call (edge function / 3rd-party API) slots in here later without
 * changing the card UI.
 */

export function getCardLanguages(): AllergyCardLanguage[] {
  return CARD_LANGUAGES.map((l) => ({ ...l }));
}

export async function generateAllergyCard(
  profile: UserProfile,
  languageCode = profile.preferredCardLanguage,
): Promise<AllergyCard> {
  const language =
    CARD_LANGUAGES.find((l) => l.code === languageCode) ?? CARD_LANGUAGES[0];

  const sortedTriggers = profile.triggers
    .slice()
    .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

  const bodyLines: string[] = [];

  for (const t of sortedTriggers) {
    const def = ALLERGEN_BY_ID[t.allergenId];
    const label = def?.label ?? t.allergenId;
    const examples = def?.aliases.slice(0, 4).join(', ');
    const severity = SEVERITY_LABEL[t.severity].toUpperCase();
    let line = `${severity}: I cannot eat ${label.toLowerCase()}`;
    if (examples) line += ` (${examples})`;
    if (t.severity === 'anaphylaxis') line += ' — even a trace can be life-threatening';
    line += '.';
    if (t.notes?.trim()) {
      line += ` Note: ${t.notes.trim().replace(/\s*\.?\s*$/, '')}.`;
    }
    bodyLines.push(line);
  }

  if (profile.mcasMode) {
    const active = MCAS_PRESET_META.filter((m) => profile.mcasPresets[m.key]);
    if (active.length > 0) {
      bodyLines.push(
        'I have Mast Cell Activation Syndrome / histamine intolerance. Please also:',
      );
      for (const m of active) {
        bodyLines.push(`  • ${m.label.toLowerCase()} — ${m.hint}`);
      }
    }
  }

  bodyLines.push(
    'Please tell me if you are unsure about any ingredient. Cross-contact from shared pans, fryers, grills or utensils can make me sick.',
  );

  if (profile.additionalNotes.trim()) {
    bodyLines.push(`Additional notes: ${profile.additionalNotes.trim()}`);
  }

  const anaphylaxisCount = sortedTriggers.filter(
    (t) => t.severity === 'anaphylaxis',
  ).length;
  const severeCount = sortedTriggers.filter((t) => t.severity === 'severe').length;

  const severitySummary =
    anaphylaxisCount > 0
      ? `${anaphylaxisCount} anaphylactic allergen${anaphylaxisCount > 1 ? 's' : ''} — I carry epinephrine.`
      : severeCount > 0
        ? `${severeCount} severe allergen${severeCount > 1 ? 's' : ''}. Reactions are serious.`
        : 'Reactions are unpleasant and can last for days.';

  return {
    id: `card-${language.code}-${Date.now().toString(36)}`,
    profileId: profile.id,
    language: language.code,
    languageLabel: language.label,
    title: 'ALLERGY & DIETARY CARD',
    greeting: 'Hello — I have serious food allergies. Thank you for helping me eat safely.',
    bodyLines,
    // Placeholder: real translation slots in here.
    translatedBodyLines: [...bodyLines],
    severitySummary,
    footer:
      'If I show signs of a reaction (swelling, hives, difficulty breathing, vomiting), please call emergency services immediately.',
    generatedAt: new Date().toISOString(),
  };
}
