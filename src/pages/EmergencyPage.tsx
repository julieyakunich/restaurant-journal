import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Phone, Cookie, Soup, ArrowLeft } from 'lucide-react';
import { compareByDistanceThenMatch } from '../data';
import { useMatchedRestaurants } from '../hooks/useRestaurants';
import { Spinner } from '../components/Spinner';
import { cn } from '../lib/cn';

type Mode = 'meals' | 'snacks';

export function EmergencyPage() {
  const { matched, loading } = useMatchedRestaurants();
  const [mode, setMode] = useState<Mode>('meals');

  const meals = useMemo(() => {
    if (!matched) return [];
    return matched
      .filter(
        ({ match }) =>
          match.verdict === 'safe-bet' || match.verdict === 'proceed-with-care',
      )
      .sort(compareByDistanceThenMatch)
      .slice(0, 6);
  }, [matched]);

  const snacks = useMemo(() => {
    if (!matched) return [];
    return matched
      .filter(({ restaurant }) => restaurant.safeSnacks.length > 0)
      .filter(({ match }) => match.verdict !== 'high-risk')
      .sort(compareByDistanceThenMatch);
  }, [matched]);

  return (
    <div className="-mx-4 -mt-5 min-h-[calc(100vh-4rem)] bg-slate-950 px-4 pb-24 pt-5 text-white">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Eat now</h1>
        <Link
          to="/"
          className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Exit
        </Link>
      </div>
      <p className="mb-4 text-base text-slate-300">
        Closest options that still fit your profile. Tap a card to call or get
        directions.
      </p>

      <div className="mb-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode('meals')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold transition',
            mode === 'meals' ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-white',
          )}
        >
          <Soup className="h-6 w-6" aria-hidden />
          Safe meals
        </button>
        <button
          type="button"
          onClick={() => setMode('snacks')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold transition',
            mode === 'snacks' ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white',
          )}
        >
          <Cookie className="h-6 w-6" aria-hidden />
          Safe snacks
        </button>
      </div>

      {loading && <Spinner className="text-slate-300" label="Finding the nearest safe food…" />}

      {!loading && mode === 'meals' && (
        <ul className="space-y-3">
          {meals.map(({ restaurant, match }) => (
            <li
              key={restaurant.id}
              className="rounded-2xl bg-white p-4 text-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/restaurants/${restaurant.id}`}
                    className="block truncate text-lg font-bold"
                  >
                    {restaurant.name}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {restaurant.neighborhood} · {match.safeCount} of{' '}
                    {match.perAllergen.length} triggers safe
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">
                  {restaurant.distanceKm.toFixed(1)} km
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${restaurant.name} ${restaurant.city}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-base font-bold text-white"
                >
                  <Navigation className="h-5 w-5" aria-hidden />
                  Directions
                </a>
                <a
                  href={
                    restaurant.phone
                      ? `tel:${restaurant.phone.replace(/\s/g, '')}`
                      : undefined
                  }
                  aria-disabled={!restaurant.phone}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl py-3 text-base font-bold',
                    restaurant.phone
                      ? 'bg-emerald-500 text-slate-950'
                      : 'pointer-events-none bg-slate-200 text-slate-400',
                  )}
                >
                  <Phone className="h-5 w-5" aria-hidden />
                  Call
                </a>
              </div>
            </li>
          ))}
          {meals.length === 0 && (
            <li className="rounded-2xl bg-white/10 p-6 text-center text-slate-300">
              No safe sit-down options nearby. Switch to <strong>Safe snacks</strong>.
            </li>
          )}
        </ul>
      )}

      {!loading && mode === 'snacks' && (
        <ul className="space-y-3">
          {snacks.map(({ restaurant }) => (
            <li key={restaurant.id} className="rounded-2xl bg-white p-4 text-slate-900">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/restaurants/${restaurant.id}`}
                  className="text-lg font-bold"
                >
                  {restaurant.name}
                </Link>
                <span className="shrink-0 rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-bold text-white">
                  {restaurant.distanceKm.toFixed(1)} km
                </span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {restaurant.safeSnacks.map((snack) => (
                  <li
                    key={snack}
                    className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-base font-semibold text-amber-900"
                  >
                    <Cookie className="h-4 w-4 shrink-0" aria-hidden />
                    {snack}
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {snacks.length === 0 && (
            <li className="rounded-2xl bg-white/10 p-6 text-center text-slate-300">
              No logged safe snacks nearby yet.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
