import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Utensils } from 'lucide-react';
import type { McasPresets, TriggerEntry } from '../data';
import { DEFAULT_MCAS_PRESETS } from '../data';
import { TriggerEditor } from '../components/TriggerEditor';
import { useAppStore } from '../store/appStore';
import { useToast } from '../store/toastStore';

export function OnboardingPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const saveProfile = useAppStore((s) => s.saveProfile);
  const toast = useToast();

  const [triggers, setTriggers] = useState<TriggerEntry[]>([]);
  const [mcasMode, setMcasMode] = useState(false);
  const [mcasPresets, setMcasPresets] = useState<McasPresets>({
    ...DEFAULT_MCAS_PRESETS,
  });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Seed once from the profile when it first loads, so re-running onboarding
  // keeps prior choices without clobbering in-progress edits afterwards.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !profile) return;
    seeded.current = true;
    setTriggers(profile.triggers);
    setMcasMode(profile.mcasMode);
    setMcasPresets(profile.mcasPresets);
    setNotes(profile.additionalNotes);
  }, [profile]);

  async function finish() {
    setSaving(true);
    try {
      await saveProfile({
        triggers,
        mcasMode,
        mcasPresets,
        additionalNotes: notes,
      });
      toast('Trigger profile saved', 'success');
      navigate('/');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-24">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-brand-600 p-2.5 text-white">
          <Utensils className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Build your trigger profile</h1>
          <p className="text-sm text-slate-500">
            Pick everything you react to and how badly. You can change this anytime.
          </p>
        </div>
      </div>

      <TriggerEditor
        triggers={triggers}
        onTriggersChange={setTriggers}
        mcasMode={mcasMode}
        onMcasModeChange={setMcasMode}
        mcasPresets={mcasPresets}
        onMcasPresetsChange={setMcasPresets}
      />

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          Anything a chef should know
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. I react to shared fryers and grill surfaces. Plain grilled protein + rice + steamed veg is always safe."
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </section>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <span className="text-sm text-slate-500">
            {triggers.length} trigger{triggers.length === 1 ? '' : 's'} selected
          </span>
          <button
            type="button"
            onClick={finish}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save & see restaurants'}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
