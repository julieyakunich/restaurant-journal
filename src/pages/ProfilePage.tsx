import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Save, RefreshCw, LogOut } from 'lucide-react';
import type { McasPresets, TriggerEntry } from '../data';
import { DEFAULT_MCAS_PRESETS, getCardLanguages } from '../data';
import { TriggerEditor } from '../components/TriggerEditor';
import { PageHeader } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../store/toastStore';

export function ProfilePage() {
  const profile = useAppStore((s) => s.profile);
  const saveProfile = useAppStore((s) => s.saveProfile);
  const userEmail = useAuthStore((s) => s.user?.email);
  const signOut = useAuthStore((s) => s.signOut);
  const toast = useToast();
  const languages = getCardLanguages();

  const [triggers, setTriggers] = useState<TriggerEntry[]>([]);
  const [mcasMode, setMcasMode] = useState(false);
  const [mcasPresets, setMcasPresets] = useState<McasPresets>({
    ...DEFAULT_MCAS_PRESETS,
  });
  const [notes, setNotes] = useState('');
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setTriggers(profile.triggers);
    setMcasMode(profile.mcasMode);
    setMcasPresets(profile.mcasPresets);
    setNotes(profile.additionalNotes);
    setLanguage(profile.preferredCardLanguage);
  }, [profile]);

  const dirty = useMemo(() => {
    if (!profile) return false;
    return (
      JSON.stringify(profile.triggers) !== JSON.stringify(triggers) ||
      profile.mcasMode !== mcasMode ||
      JSON.stringify(profile.mcasPresets) !== JSON.stringify(mcasPresets) ||
      profile.additionalNotes !== notes ||
      profile.preferredCardLanguage !== language
    );
  }, [profile, triggers, mcasMode, mcasPresets, notes, language]);

  if (!profile) return <Spinner label="Loading profile…" />;

  async function save() {
    setSaving(true);
    try {
      await saveProfile({
        triggers,
        mcasMode,
        mcasPresets,
        additionalNotes: notes,
        preferredCardLanguage: language,
      });
      toast('Profile updated', 'success');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-24">
      <PageHeader
        title="Profile & settings"
        subtitle={`Last updated ${new Date(profile.updatedAt).toLocaleDateString()}`}
        action={
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Redo onboarding
          </Link>
        }
      />

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
          Notes for chefs
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          Default allergy-card language
        </h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          Account
        </h2>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <span className="min-w-0 truncate text-sm text-slate-600">
            {userEmail ?? 'Signed in'}
          </span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Sign out
          </button>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <span className="text-sm text-slate-500">
            {dirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" aria-hidden />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
