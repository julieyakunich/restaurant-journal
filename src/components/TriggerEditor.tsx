import { Plus, Check } from 'lucide-react';
import type { AllergenId, McasPresets, Severity, TriggerEntry } from '../data';
import {
  ALLERGEN_CATALOG,
  MCAS_PRESET_META,
  type AllergenKind,
} from '../data';
import { SeveritySelect } from './SeveritySelect';
import { Toggle } from './Toggle';
import { cn } from '../lib/cn';

interface Props {
  triggers: TriggerEntry[];
  onTriggersChange: (next: TriggerEntry[]) => void;
  mcasMode: boolean;
  onMcasModeChange: (v: boolean) => void;
  mcasPresets: McasPresets;
  onMcasPresetsChange: (next: McasPresets) => void;
}

const KIND_HEADINGS: Record<AllergenKind, string> = {
  allergen: 'Allergens',
  intolerance: 'Intolerances & sensitivities',
  'mcas-trigger': 'Histamine / MCAS triggers',
};

const DEFAULT_SEVERITY: Severity = 'moderate';

export function TriggerEditor({
  triggers,
  onTriggersChange,
  mcasMode,
  onMcasModeChange,
  mcasPresets,
  onMcasPresetsChange,
}: Props) {
  const byId = new Map(triggers.map((t) => [t.allergenId, t]));

  function toggleTrigger(id: AllergenId) {
    if (byId.has(id)) {
      onTriggersChange(triggers.filter((t) => t.allergenId !== id));
    } else {
      onTriggersChange([
        ...triggers,
        { allergenId: id, severity: DEFAULT_SEVERITY },
      ]);
    }
  }

  function setSeverity(id: AllergenId, severity: Severity) {
    onTriggersChange(
      triggers.map((t) => (t.allergenId === id ? { ...t, severity } : t)),
    );
  }

  function setNote(id: AllergenId, notes: string) {
    onTriggersChange(
      triggers.map((t) => (t.allergenId === id ? { ...t, notes } : t)),
    );
  }

  const groups = (['allergen', 'intolerance', 'mcas-trigger'] as AllergenKind[]).map(
    (kind) => ({
      kind,
      items: ALLERGEN_CATALOG.filter((a) => a.kind === kind),
    }),
  );

  return (
    <div className="space-y-6">
      {groups.map(({ kind, items }) => (
        <section key={kind}>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            {KIND_HEADINGS[kind]}
          </h2>
          <ul className="space-y-2">
            {items.map((def) => {
              const active = byId.get(def.id);
              return (
                <li
                  key={def.id}
                  className={cn(
                    'rounded-xl border p-3 transition',
                    active
                      ? 'border-brand-300 bg-brand-50/50'
                      : 'border-slate-200 bg-white',
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={!!active}
                    onClick={() => toggleTrigger(def.id)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition',
                        active
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-slate-300 bg-white text-slate-300',
                      )}
                    >
                      {active ? (
                        <Check className="h-4 w-4" aria-hidden />
                      ) : (
                        <Plus className="h-4 w-4" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900">
                        {def.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {def.description}
                      </span>
                    </span>
                  </button>

                  {active && (
                    <div className="mt-3 space-y-2 pl-9">
                      <SeveritySelect
                        value={active.severity}
                        onChange={(s) => setSeverity(def.id, s)}
                      />
                      <input
                        type="text"
                        value={active.notes ?? ''}
                        onChange={(e) => setNote(def.id, e.target.value)}
                        placeholder="Personal note (optional) — e.g. trace amounts are ok"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
        <Toggle
          id="mcas-mode"
          checked={mcasMode}
          onChange={onMcasModeChange}
          label="MCAS / histamine mode"
          hint="Adds histamine-load handling to matching and your allergy card."
        />
        {mcasMode && (
          <div className="mt-2 divide-y divide-violet-200 border-t border-violet-200 pt-1">
            {MCAS_PRESET_META.map((preset) => (
              <Toggle
                key={preset.key}
                checked={mcasPresets[preset.key]}
                onChange={(v) =>
                  onMcasPresetsChange({ ...mcasPresets, [preset.key]: v })
                }
                label={preset.label}
                hint={preset.hint}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
