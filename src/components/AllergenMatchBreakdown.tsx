import { Check, X, Minus } from 'lucide-react';
import type { RestaurantMatch } from '../data';
import { allergenLabel } from '../data';
import { SeverityPill } from './SeverityPill';
import { cn } from '../lib/cn';

const ROW_META = {
  safe: {
    Icon: Check,
    label: 'Safe',
    row: 'bg-emerald-50',
    icon: 'bg-emerald-600 text-white',
  },
  caution: {
    Icon: X,
    label: 'Caution',
    row: 'bg-amber-50',
    icon: 'bg-amber-500 text-white',
  },
  unknown: {
    Icon: Minus,
    label: 'No data',
    row: 'bg-slate-50',
    icon: 'bg-slate-400 text-white',
  },
} as const;

export function AllergenMatchBreakdown({ match }: { match: RestaurantMatch }) {
  if (match.perAllergen.length === 0) {
    return (
      <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
        You haven't added any triggers yet. Set up your profile to see how this
        restaurant matches.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {match.perAllergen.map((m) => {
        const meta = ROW_META[m.status];
        return (
          <li
            key={m.allergenId}
            className={cn('flex items-start gap-3 rounded-xl p-3', meta.row)}
          >
            <span
              className={cn(
                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                meta.icon,
              )}
            >
              <meta.Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {allergenLabel(m.allergenId)}
                </span>
                <SeverityPill severity={m.severity} />
                <span className="text-xs font-medium text-slate-500">
                  {meta.label}
                </span>
              </div>
              {m.notes && (
                <p className="mt-1 text-xs text-slate-600">Your note: {m.notes}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
