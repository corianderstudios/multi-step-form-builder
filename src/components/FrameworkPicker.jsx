import { FRAMEWORKS } from '../generators/index.js';

export default function FrameworkPicker({ value, onChange }) {
  return (
    <fieldset>
      <legend className="text-lg font-bold">Framework</legend>
      <p className="mt-1 text-sm text-ink-soft">The code will be written for this one.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FRAMEWORKS.map((framework) => {
          const checked = framework.id === value;
          return (
            <label
              key={framework.id}
              className={`relative cursor-pointer rounded-lg border-2 px-3 py-2.5 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
                checked ? 'border-ink bg-marker' : 'border-rule bg-sheet hover:border-ink'
              }`}
            >
              <input
                type="radio"
                name="framework"
                value={framework.id}
                checked={checked}
                onChange={() => onChange(framework.id)}
                className="sr-only"
              />
              <span className="block font-bold">{framework.name}</span>
              <span className="block text-xs leading-snug text-ink-soft">{framework.detail}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
