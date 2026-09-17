import { Link } from 'react-router-dom';
import { MapPin, Navigation, Sparkles, Clock } from 'lucide-react';
import type { Restaurant, RestaurantMatch } from '../data';
import { ConfidenceBadge } from './ConfidenceBadge';
import { VerdictBadge } from './VerdictBadge';
import { AllergenChip } from './AllergenChip';
import { cn } from '../lib/cn';

interface Props {
  restaurant: Restaurant;
  match: RestaurantMatch;
  /** Compact variant for dense lists (trip shortlist). */
  compact?: boolean;
}

export function RestaurantCard({ restaurant: r, match, compact = false }: Props) {
  return (
    <Link
      to={`/restaurants/${r.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-900">{r.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {r.neighborhood}, {r.city}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
            <Navigation className="h-3.5 w-3.5" aria-hidden />
            {r.distanceKm.toFixed(1)} km
          </span>
          <span
            className={cn(
              'flex items-center gap-1 text-[11px] font-medium',
              r.openNow ? 'text-emerald-600' : 'text-slate-400',
            )}
          >
            <Clock className="h-3 w-3" aria-hidden />
            {r.openNow ? 'Open now' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <VerdictBadge verdict={match.verdict} />
        <ConfidenceBadge level={r.confidence} />
        {r.accommodatesMcas && (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800 ring-1 ring-inset ring-violet-500/30">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            MCAS-aware
          </span>
        )}
      </div>

      {!compact && (
        <>
          <p className="mt-3 line-clamp-2 text-sm text-slate-600">{r.summary}</p>

          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Your triggers here
            </p>
            <div className="flex flex-wrap gap-1.5">
              {match.perAllergen.slice(0, 6).map((m) => (
                <AllergenChip
                  key={m.allergenId}
                  allergenId={m.allergenId}
                  status={m.status}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-3 flex items-center gap-3 text-[11px] font-medium text-slate-500">
        <span className="text-emerald-700">{match.safeCount} safe</span>
        <span className="text-amber-700">{match.cautionCount} caution</span>
        <span>{match.unknownCount} unknown</span>
      </div>
    </Link>
  );
}
