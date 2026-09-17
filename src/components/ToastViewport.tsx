import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useToastStore, type ToastTone } from '../store/toastStore';
import { cn } from '../lib/cn';

const TONE: Record<ToastTone, { classes: string; Icon: typeof Info }> = {
  success: { classes: 'bg-emerald-600 text-white', Icon: CheckCircle2 },
  info: { classes: 'bg-slate-800 text-white', Icon: Info },
  warning: { classes: 'bg-amber-500 text-white', Icon: AlertTriangle },
  error: { classes: 'bg-red-600 text-white', Icon: XCircle },
};

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const { classes, Icon } = TONE[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-md items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg',
              classes,
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="rounded p-0.5 opacity-80 hover:opacity-100"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
