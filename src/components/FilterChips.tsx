import type { AllergenId } from '../data';
import { AllergenChip } from './AllergenChip';

interface Props {
  options: AllergenId[];
  selected: AllergenId[];
  onChange: (next: AllergenId[]) => void;
  label?: string;
}

/** Horizontal, wrapping row of toggleable allergen filter chips. */
export function FilterChips({ options, selected, onChange, label }: Props) {
  function toggle(id: AllergenId) {
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  }

  if (options.length === 0) return null;

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </span>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((id) => (
          <AllergenChip
            key={id}
            allergenId={id}
            selectable
            selected={selected.includes(id)}
            onToggle={toggle}
          />
        ))}
      </div>
    </div>
  );
}
