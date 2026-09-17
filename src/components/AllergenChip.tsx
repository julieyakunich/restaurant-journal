import { Check, X, Minus } from 'lucide-react';
import type { AllergenId } from '../data';
import { allergenLabel } from '../data';
import { cn } from '../lib/cn';

export type AllergenChipStatus = 'neutral' | 'safe' | 'caution' | 'unknown';

interface Props {
  allergenId: AllergenId;
  /** Visual status when used to show a match result. */
  status?: AllergenChipStatus;
  /** Render as a toggle button (filter chips). */
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (id: AllergenId) => void;
  className?: string;
}

const STATUS_CLASSES: Record<AllergenChipStatus, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-300',
  safe: 'bg-emerald-100 text-emerald-900 ring-emerald-500/40',
  caution: 'bg-amber-100 text-amber-900 ring-amber-500/50',
  unknown: 'bg-slate-100 text-slate-600 ring-slate-300',
};

const STATUS_ICON = {
  safe: Check,
  caution: X,
  unknown: Minus,
  neutral: null,
} as const;

export function AllergenChip({
  allergenId,
  status = 'neutral',
  selectable = false,
  selected = false,
  onToggle,
  className,
}: Props) {
  const label = allergenLabel(allergenId);
  const Icon = STATUS_ICON[status];

  const base = cn(
    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition',
    className,
  );

  if (selectable) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onToggle?.(allergenId)}
        className={cn(
          base,
          'min-h-[36px]',
          selected
            ? 'bg-brand-700 text-white ring-brand-700'
            : 'bg-white text-slate-700 ring-slate-300 hover:ring-brand-500',
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" aria-hidden />}
        {label}
      </button>
    );
  }

  return (
    <span className={cn(base, STATUS_CLASSES[status])}>
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
      {label}
    </span>
  );
}
