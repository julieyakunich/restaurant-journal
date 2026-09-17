import type { Severity } from '../data';
import { SEVERITY_LABEL } from '../data';
import { cn } from '../lib/cn';

const META: Record<Severity, string> = {
  mild: 'bg-sky-100 text-sky-800 ring-sky-600/20',
  moderate: 'bg-amber-100 text-amber-900 ring-amber-600/30',
  severe: 'bg-orange-100 text-orange-900 ring-orange-600/30',
  anaphylaxis: 'bg-red-600 text-white ring-red-700',
};

interface Props {
  severity: Severity;
  className?: string;
  withDot?: boolean;
}

export function SeverityPill({ severity, className, withDot = true }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
        META[severity],
        className,
      )}
    >
      {withDot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            severity === 'anaphylaxis' ? 'bg-white' : 'bg-current opacity-70',
          )}
          aria-hidden
        />
      )}
      {SEVERITY_LABEL[severity]}
    </span>
  );
}
