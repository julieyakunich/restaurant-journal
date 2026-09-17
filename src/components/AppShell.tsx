import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { ToastViewport } from './ToastViewport';

/**
 * Mobile-first shell: a centered max-width column with a sticky bottom nav.
 * Screens that need to break out of the column (Emergency) can render their own
 * full-bleed background and still sit inside this padding.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-4 pb-28 pt-5">
        {children}
      </div>
      <BottomNav />
      <ToastViewport />
    </div>
  );
}
