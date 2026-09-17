import type { AllergyCardLanguage } from '../types';

/**
 * Languages offered in the allergy-card language picker. Translation itself is
 * not wired up yet — selecting a language currently just relabels the card.
 */
export const CARD_LANGUAGES: AllergyCardLanguage[] = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
  { code: 'da', label: 'Dansk' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'th', label: 'ไทย' },
];
