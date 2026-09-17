import { NavLink } from 'react-router-dom';
import { Home, Map, Siren, IdCard, User } from 'lucide-react';
import { cn } from '../lib/cn';

const ITEMS = [
  { to: '/', label: 'Home', Icon: Home, end: true },
  { to: '/trips', label: 'Trips', Icon: Map, end: false },
  { to: '/emergency', label: 'Emergency', Icon: Siren, end: false },
  { to: '/allergy-card', label: 'Card', Icon: IdCard, end: false },
  { to: '/profile', label: 'Profile', Icon: User, end: false },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[11px] font-medium transition',
                isActive
                  ? 'text-brand-700'
                  : 'text-slate-500 hover:text-slate-700',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn('h-5 w-5', isActive && 'stroke-[2.5]')}
                  aria-hidden
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
