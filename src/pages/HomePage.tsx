import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, Sparkles, UtensilsCrossed } from 'lucide-react';
import type { AllergenId } from '../data';
import { compareByMatchThenDistance } from '../data';
import { useAppStore } from '../store/appStore';
import { useMatchedRestaurants } from '../hooks/useRestaurants';
import { RestaurantCard } from '../components/RestaurantCard';
import { FilterChips } from '../components/FilterChips';
import { PageHeader } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { cn } from '../lib/cn';

export function HomePage() {
  const profile = useAppStore((s) => s.profile);
  const activeTrip = useAppStore((s) => s.activeTrip());
  const { matched, loading, error } = useMatchedRestaurants();

  const [selected, setSelected] = useState<AllergenId[]>([]);
  const [mcasOnly, setMcasOnly] = useState(false);

  const triggerOptions = useMemo(
    () => profile?.triggers.map((t) => t.allergenId) ?? [],
    [profile],
  );

  const list = useMemo(() => {
    if (!matched) return [];
    return matched
      .filter(({ match }) =>
        selected.every((id) =>
          match.perAllergen.some((m) => m.allergenId === id && m.status === 'safe'),
        ),
      )
      .filter(({ restaurant }) => !mcasOnly || restaurant.accommodatesMcas)
      .sort(compareByMatchThenDistance);
  }, [matched, selected, mcasOnly]);

  return (
    <div>
      <PageHeader
        title="Nearby"
        subtitle={
          profile
            ? `Matched to ${profile.triggers.length} of your triggers`
            : 'Loading your profile…'
        }
        action={
          <Link
            to="/onboarding"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Edit triggers
          </Link>
        }
      />

      {activeTrip && (
        <Link
          to="/trips"
          className="mb-3 flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white"
        >
          <span>
            Planning: <strong>{activeTrip.destination}</strong> ·{' '}
            {activeTrip.savedRestaurantIds.length} saved
          </span>
          <span className="text-brand-100">View trip →</span>
        </Link>
      )}

      <div className="mb-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          Filters
        </div>
        <FilterChips
          options={triggerOptions}
          selected={selected}
          onChange={setSelected}
          label="Only show places safe for"
        />
        <button
          type="button"
          onClick={() => setMcasOnly((v) => !v)}
          aria-pressed={mcasOnly}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition',
            mcasOnly
              ? 'bg-violet-600 text-white ring-violet-600'
              : 'bg-white text-violet-700 ring-violet-300 hover:ring-violet-500',
          )}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          MCAS-aware only
        </button>
      </div>

      {loading && <Spinner label="Finding safe places nearby…" />}
      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      {!loading && !error && (
        <>
          <p className="mb-2 text-xs text-slate-500">
            {list.length} place{list.length === 1 ? '' : 's'}
          </p>
          <div className="space-y-3">
            {list.map(({ restaurant, match }) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                match={match}
              />
            ))}
          </div>
          {list.length === 0 && (
            <EmptyState
              Icon={UtensilsCrossed}
              title="Nothing matches those filters"
              description="Try removing a filter — or widen your search once we add more cities."
            />
          )}
        </>
      )}
    </div>
  );
}
