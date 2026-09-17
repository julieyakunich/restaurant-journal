import type { Severity } from '../data';
import { SEVERITY_LABEL, SEVERITY_ORDER } from '../data';
import { cn } from '../lib/cn';

const ACTIVE: Record<Severity, string> = {
  mild: 'bg-sky-600 text-white',
  moderate: 'bg-amber-500 text-white',
  severe: 'bg-orange-600 text-white',
  anaphylaxis: 'bg-red-600 text-white',
};

interface Props {
  value: Severity;
  onChange: (s: Severity) => void;
}

/** Segmented control for picking a severity. */
export function SeveritySelect({ value, onChange }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Severity"
      className="flex overflow-hidden rounded-lg border border-slate-300"
    >
      {SEVERITY_ORDER.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          onClick={() => onChange(s)}
          className={cn(
            'flex-1 px-2 py-2 text-xs font-semibold transition',
            value === s
              ? ACTIVE[s]
              : 'bg-white text-slate-600 hover:bg-slate-50',
          )}
        >
          {SEVERITY_LABEL[s]}
        </button>
      ))}
    </div>
  );
}
