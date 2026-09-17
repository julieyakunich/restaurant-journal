import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BookmarkPlus,
  BookmarkCheck,
  IdCard,
  Phone,
  Clock,
  Flame,
  Sparkles,
  ChefHat,
  ScrollText,
} from 'lucide-react';
import {
  getRestaurantById,
  matchRestaurant,
  VERDICT_META,
  type Restaurant,
} from '../data';
import { useAppStore } from '../store/appStore';
import { useToast } from '../store/toastStore';
import { PageHeader } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { VerdictBadge } from '../components/VerdictBadge';
import { AllergenMatchBreakdown } from '../components/AllergenMatchBreakdown';
import { ReviewCard } from '../components/ReviewCard';
import { cn } from '../lib/cn';
import { formatMonthYear } from '../lib/format';

function Signal({
  ok,
  label,
  Icon,
}: {
  ok: boolean;
  label: string;
  Icon: typeof Flame;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium',
        ok ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </div>
  );
}

export function RestaurantDetailPage() {
  const { id = '' } = useParams();
  const profile = useAppStore((s) => s.profile);
  const activeTrip = useAppStore((s) => s.activeTrip());
  const isSaved = useAppStore((s) => s.isSaved);
  const addRestaurantToTrip = useAppStore((s) => s.addRestaurantToTrip);
  const removeRestaurantFromTrip = useAppStore((s) => s.removeRestaurantFromTrip);
  const toast = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRestaurantById(id)
      .then((r) => {
        if (!cancelled) setRestaurant(r);
      })
      .catch(() => {
        if (!cancelled) setRestaurant(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const match = useMemo(
    () => (restaurant && profile ? matchRestaurant(restaurant, profile) : null),
    [restaurant, profile],
  );

  const saved = restaurant ? isSaved(restaurant.id) : false;

  async function toggleSave() {
    if (!restaurant) return;
    if (!activeTrip) {
      toast('Start a trip first, then save places to it', 'warning');
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        await removeRestaurantFromTrip(restaurant.id);
        toast(`Removed from ${activeTrip.destination} trip`, 'info');
      } else {
        await addRestaurantToTrip(restaurant.id);
        toast(`Saved to ${activeTrip.destination} trip`, 'success');
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner label="Loading restaurant…" />;
  if (!restaurant) {
    return (
      <div>
        <PageHeader title="Not found" back />
        <p className="text-sm text-slate-500">
          That restaurant doesn't exist.{' '}
          <Link to="/" className="font-semibold text-brand-700">
            Back to Home
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader title={restaurant.name} subtitle={`${restaurant.neighborhood}, ${restaurant.city}`} back />

      <div className="flex flex-wrap items-center gap-2">
        {match && <VerdictBadge verdict={match.verdict} size="md" />}
        <ConfidenceBadge level={restaurant.confidence} size="md" />
      </div>

      {match && (
        <p className="mt-2 text-sm text-slate-600">{VERDICT_META[match.verdict].blurb}</p>
      )}

      <p className="mt-3 text-sm text-slate-700">{restaurant.summary}</p>

      <dl className="mt-3 space-y-1 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          <dd>{restaurant.hours}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden>·</span>
          <dd>
            {restaurant.cuisine.join(' · ')} · {'$'.repeat(restaurant.priceLevel)}
          </dd>
        </div>
        {restaurant.lastVerifiedAt && (
          <div className="flex items-center gap-2">
            <span aria-hidden>·</span>
            <dd>Safety info verified {formatMonthYear(restaurant.lastVerifiedAt)}</dd>
          </div>
        )}
      </dl>

      {/* MCAS / handling signals */}
      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          Kitchen signals
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Signal ok={restaurant.accommodatesMcas} label="MCAS-aware" Icon={Sparkles} />
          <Signal ok={restaurant.lowHistamineOptions} label="Low-histamine options" Icon={Flame} />
          <Signal ok={restaurant.cooksToOrder} label="Cooks to order" Icon={ChefHat} />
          <Signal ok={restaurant.hasSeparateFryer} label="Separate fryer" Icon={Flame} />
          <Signal
            ok={restaurant.hasDedicatedAllergenMenu}
            label="Allergen menu"
            Icon={ScrollText}
          />
        </div>
      </section>

      {/* Allergen match */}
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          Match against your profile
        </h2>
        {match && <AllergenMatchBreakdown match={match} />}
      </section>

      {/* Reviews */}
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          Structured reviews ({restaurant.reviews.length})
        </h2>
        {restaurant.reviews.length === 0 ? (
          <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
            No reports yet. If you eat here, come back and log how the kitchen
            handled your order.
          </p>
        ) : (
          <div className="space-y-3">
            {restaurant.reviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        )}
      </section>

      {restaurant.phone && (
        <a
          href={`tel:${restaurant.phone.replace(/\s/g, '')}`}
          className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call to ask about allergens
        </a>
      )}

      {/* Sticky actions */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2">
          <button
            type="button"
            onClick={toggleSave}
            disabled={busy}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition disabled:opacity-60',
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-800',
            )}
          >
            {saved ? (
              <>
                <BookmarkCheck className="h-4 w-4" aria-hidden />
                Saved to trip
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4" aria-hidden />
                Save to trip
              </>
            )}
          </button>
          <Link
            to="/allergy-card"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <IdCard className="h-4 w-4" aria-hidden />
            Allergy card
          </Link>
        </div>
      </div>
    </div>
  );
}
