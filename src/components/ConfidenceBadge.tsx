import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import type { ConfidenceLevel } from '../data';
import { cn } from '../lib/cn';

const META: Record<
  ConfidenceLevel,
  { label: string; classes: string; Icon: typeof ShieldCheck }
> = {
  'verified-safe': {
    label: 'Verified safe',
    classes: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
    Icon: ShieldCheck,
  },
  'some-reports': {
    label: 'Some reports',
    classes: 'bg-amber-100 text-amber-800 ring-amber-600/30',
    Icon: ShieldAlert,
  },
  'no-data': {
    label: 'No data yet',
    classes: 'bg-slate-200 text-slate-700 ring-slate-500/20',
    Icon: ShieldQuestion,
  },
};

interface Props {
  level: ConfidenceLevel;
  size?: 'sm' | 'md';
  className?: string;
}

export function ConfidenceBadge({ level, size = 'sm', className }: Props) {
  const { label, classes, Icon } = META[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        classes,
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
      {label}
    </span>
  );
}
