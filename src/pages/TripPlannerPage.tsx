import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Plus, X, Check } from 'lucide-react';
import {
  getDestinations,
  getRestaurantsByIds,
  matchRestaurant,
  type Destination,
  type Restaurant,
} from '../data';
import { useAppStore } from '../store/appStore';
import { useToast } from '../store/toastStore';
import { PageHeader } from '../components/PageHeader';
import { RestaurantCard } from '../components/RestaurantCard';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { cn } from '../lib/cn';
import { formatDateRange } from '../lib/format';

export function TripPlannerPage() {
  const profile = useAppStore((s) => s.profile);
  const trips = useAppStore((s) => s.trips);
  const activeTripId = useAppStore((s) => s.activeTripId);
  const setActiveTrip = useAppStore((s) => s.setActiveTrip);
  const createTrip = useAppStore((s) => s.createTrip);
  const removeRestaurantFromTrip = useAppStore((s) => s.removeRestaurantFromTrip);
  const toast = useToast();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // new-trip form
  const [destId, setDestId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    let cancelled = false;
    getDestinations()
      .then((d) => {
        if (!cancelled) setDestinations(d);
      })
      .catch(() => {
        /* signed out mid-flight or offline — the list just stays empty */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeTripId) ?? null,
    [trips, activeTripId],
  );

  useEffect(() => {
    if (!activeTrip || activeTrip.savedRestaurantIds.length === 0) {
      setSavedRestaurants([]);
      return;
    }
    let cancelled = false;
    setLoadingSaved(true);
    getRestaurantsByIds(activeTrip.savedRestaurantIds)
      .then((rows) => {
        if (!cancelled) setSavedRestaurants(rows);
      })
      .catch(() => {
        /* transient auth/network — keep whatever is already shown */
      })
      .finally(() => {
        if (!cancelled) setLoadingSaved(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTrip]);

  async function handleCreate() {
    const dest = destinations.find((d) => d.id === destId);
    if (!dest || !startDate || !endDate) {
      toast('Pick a destination and dates', 'warning');
      return;
    }
    await createTrip({
      destination: dest.city,
      country: dest.country,
      startDate,
      endDate,
    });
    toast(`Trip to ${dest.city} created`, 'success');
    setShowNew(false);
    setDestId('');
    setStartDate('');
    setEndDate('');
  }

  return (
    <div>
      <PageHeader
        title="Trips"
        subtitle="Build a shortlist of safe places before you go"
        action={
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New
          </button>
        }
      />

      {showNew && (
        <div className="mb-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Destination
            </label>
            <div className="space-y-1.5">
              {destinations.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDestId(d.id)}
                  className={cn(
                    'flex w-full items-start justify-between gap-2 rounded-xl border p-3 text-left transition',
                    destId === d.id
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">
                      {d.city}, {d.country}
                    </span>
                    <span className="block text-xs text-slate-500">{d.blurb}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-slate-400">
                    {d.restaurantCount} logged
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white"
          >
            Create trip
          </button>
        </div>
      )}

      {/* Trip switcher */}
      {trips.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {trips.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTrip(t.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition',
                t.id === activeTripId
                  ? 'bg-slate-900 text-white ring-slate-900'
                  : 'bg-white text-slate-600 ring-slate-300',
              )}
            >
              {t.id === activeTripId && <Check className="h-3.5 w-3.5" aria-hidden />}
              {t.destination}
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          Icon={MapPin}
          title="No trips yet"
          description="Start a trip to begin saving restaurants you can trust at your destination."
        />
      )}

      {activeTrip && (
        <section>
          <div className="mb-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
            <div className="flex items-center gap-2 text-lg font-bold">
              <MapPin className="h-5 w-5" aria-hidden />
              {activeTrip.destination}, {activeTrip.country}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-brand-100">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {formatDateRange(activeTrip.startDate, activeTrip.endDate)}
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold capitalize">
                {activeTrip.status}
              </span>
            </div>
            {activeTrip.notes && (
              <p className="mt-2 text-sm text-brand-50">{activeTrip.notes}</p>
            )}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Saved places ({savedRestaurants.length})
            </h2>
            <Link to="/" className="text-xs font-semibold text-brand-700 hover:underline">
              + Add from Home
            </Link>
          </div>

          {loadingSaved && <Spinner />}

          {!loadingSaved && savedRestaurants.length === 0 && (
            <EmptyState
              Icon={Plus}
              title="Nothing saved for this trip"
              description="Open a restaurant from Home and tap “Save to trip”."
              action={
                <Link
                  to="/"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Browse restaurants
                </Link>
              }
            />
          )}

          <div className="space-y-3">
            {savedRestaurants.map((r) => (
              <div
                key={r.id}
                className="overflow-hidden rounded-2xl border border-slate-200"
              >
                {profile && (
                  <RestaurantCard
                    restaurant={r}
                    match={matchRestaurant(r, profile)}
                    compact
                  />
                )}
                <button
                  type="button"
                  onClick={async () => {
                    await removeRestaurantFromTrip(r.id);
                    toast(`Removed ${r.name}`, 'info');
                  }}
                  className="flex w-full items-center justify-center gap-1.5 border-t border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Remove from trip
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
