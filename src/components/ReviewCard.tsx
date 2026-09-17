import {
  Check,
  X,
  Star,
  ShieldCheck,
  ShieldX,
  RotateCcw,
} from 'lucide-react';
import type { AccommodationChecklist, Review } from '../data';
import { SEVERITY_LABEL } from '../data';
import { AllergenChip } from './AllergenChip';
import { cn } from '../lib/cn';
import { formatShortMonthYear } from '../lib/format';

const CHECKLIST_LABELS: Record<keyof AccommodationChecklist, string> = {
  readFullIngredientList: 'Read the full ingredient list',
  understoodCrossContact: 'Understood cross-contact risk',
  dedicatedPrepArea: 'Used a dedicated prep area',
  separateFryer: 'Had a separate fryer',
  chefOrManagerInvolved: 'Chef or manager was involved',
  writtenAllergenInfo: 'Allergen info was in writing',
};

export function ReviewCard({ review }: { review: Review }) {
  const checklistEntries = Object.entries(review.checklist) as [
    keyof AccommodationChecklist,
    boolean,
  ][];
  const metCount = checklistEntries.filter(([, v]) => v).length;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{review.authorName}</p>
          <p className="text-xs text-slate-500">
            Visited {formatShortMonthYear(review.visitedAt)}
          </p>
        </div>
        <div className="flex items-center gap-0.5" aria-label={`${review.trustRating} of 5 trust`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < review.trustRating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300',
              )}
              aria-hidden
            />
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {review.reviewerAllergens.map((a) => (
          <AllergenChip key={a} allergenId={a} />
        ))}
        {review.reviewerHasMcas && (
          <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-800">
            Also manages MCAS
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-slate-700">{review.comment}</p>

      <div className="mt-3 rounded-xl bg-slate-50 p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          What the restaurant did · {metCount}/{checklistEntries.length}
        </p>
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {checklistEntries.map(([key, value]) => (
            <li key={key} className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                  value ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-white',
                )}
              >
                {value ? (
                  <Check className="h-3 w-3" aria-hidden />
                ) : (
                  <X className="h-3 w-3" aria-hidden />
                )}
              </span>
              <span className={value ? 'text-slate-700' : 'text-slate-400 line-through'}>
                {CHECKLIST_LABELS[key]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
        <span
          className={cn(
            'inline-flex items-center gap-1',
            review.reactionOccurred ? 'text-red-700' : 'text-emerald-700',
          )}
        >
          {review.reactionOccurred ? (
            <ShieldX className="h-4 w-4" aria-hidden />
          ) : (
            <ShieldCheck className="h-4 w-4" aria-hidden />
          )}
          {review.reactionOccurred
            ? `Had a reaction${review.reactionSeverity ? ` (${SEVERITY_LABEL[review.reactionSeverity]})` : ''}`
            : 'No reaction'}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1',
            review.wouldReturn ? 'text-emerald-700' : 'text-slate-500',
          )}
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          {review.wouldReturn ? 'Would return' : 'Would not return'}
        </span>
      </div>
    </article>
  );
}
