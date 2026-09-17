import { CheckCircle2, AlertTriangle, HelpCircle, XOctagon } from 'lucide-react';
import type { MatchVerdict } from '../data';
import { VERDICT_META } from '../data';
import { cn } from '../lib/cn';

const STYLE: Record<
  MatchVerdict,
  { classes: string; Icon: typeof CheckCircle2 }
> = {
  'safe-bet': {
    classes: 'bg-emerald-100 text-emerald-900 ring-emerald-600/30',
    Icon: CheckCircle2,
  },
  'proceed-with-care': {
    classes: 'bg-amber-100 text-amber-900 ring-amber-600/30',
    Icon: AlertTriangle,
  },
  'not-enough-info': {
    classes: 'bg-slate-200 text-slate-700 ring-slate-500/20',
    Icon: HelpCircle,
  },
  'high-risk': {
    classes: 'bg-red-100 text-red-900 ring-red-600/40',
    Icon: XOctagon,
  },
};

interface Props {
  verdict: MatchVerdict;
  size?: 'sm' | 'md';
  showBlurb?: boolean;
  className?: string;
}

export function VerdictBadge({
  verdict,
  size = 'sm',
  showBlurb = false,
  className,
}: Props) {
  const { classes, Icon } = STYLE[verdict];
  const meta = VERDICT_META[verdict];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-semibold ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm',
        classes,
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
      <span>{meta.label}</span>
      {showBlurb && (
        <span className="font-normal opacity-80">— {meta.blurb}</span>
      )}
    </span>
  );
}
