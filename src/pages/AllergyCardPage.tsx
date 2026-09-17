import { useEffect, useState } from 'react';
import { Languages, Copy, Printer, Check, TriangleAlert } from 'lucide-react';
import {
  generateAllergyCard,
  getCardLanguages,
  type AllergyCard,
} from '../data';
import { useAppStore } from '../store/appStore';
import { useToast } from '../store/toastStore';
import { PageHeader } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';

export function AllergyCardPage() {
  const profile = useAppStore((s) => s.profile);
  const toast = useToast();
  const languages = getCardLanguages();

  const [language, setLanguage] = useState('en');
  const [card, setCard] = useState<AllergyCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile) setLanguage(profile.preferredCardLanguage);
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    setLoading(true);
    generateAllergyCard(profile, language).then((c) => {
      if (!cancelled) {
        setCard(c);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [profile, language]);

  async function copy() {
    if (!card) return;
    const text = [
      card.title,
      '',
      card.greeting,
      '',
      ...card.bodyLines,
      '',
      card.severitySummary,
      '',
      card.footer,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast('Card copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Could not copy — select the text manually', 'error');
    }
  }

  if (!profile) return <Spinner label="Loading profile…" />;

  return (
    <div className="pb-6">
      <PageHeader
        title="Allergy card"
        subtitle="Show this to kitchen staff. Generated from your profile."
      />

      <div className="mb-3 flex items-center gap-2">
        <Languages className="h-4 w-4 text-slate-400" aria-hidden />
        <label htmlFor="lang" className="sr-only">
          Card language
        </label>
        <select
          id="lang"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {language !== 'en' && (
        <p className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Translation isn't wired up yet — the text below is still English. The
          language picker is a placeholder for the real translation service.
        </p>
      )}

      {loading || !card ? (
        <Spinner label="Generating card…" />
      ) : (
        <article
          id="allergy-card"
          className="rounded-2xl border-2 border-slate-900 bg-white p-5"
        >
          <h2 className="text-center text-lg font-extrabold uppercase tracking-wide text-slate-900">
            {card.title}
          </h2>
          <p className="mt-1 text-center text-xs font-medium text-slate-500">
            {card.languageLabel}
          </p>

          <p className="mt-4 text-sm font-medium text-slate-800">{card.greeting}</p>

          <ul className="mt-3 space-y-2">
            {card.bodyLines.map((line, i) => (
              <li
                key={i}
                className={
                  line.startsWith('  •')
                    ? 'ml-4 text-sm text-slate-700'
                    : 'text-sm font-semibold text-slate-900'
                }
              >
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">
            {card.severitySummary}
          </p>

          <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-600">
            {card.footer}
          </p>
        </article>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copy}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <Copy className="h-4 w-4" aria-hidden />
          )}
          {copied ? 'Copied' : 'Copy text'}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700"
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print
        </button>
      </div>
    </div>
  );
}
