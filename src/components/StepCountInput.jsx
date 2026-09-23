import { useEffect, useState } from 'react';
import { MAX_STEPS, MIN_STEPS, clampStepCount } from '../lib/config.js';

export default function StepCountInput({ value, onChange }) {
  // A draft lets people clear the box and type a new number without it snapping back.
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function handleInput(event) {
    const next = event.target.value;
    setDraft(next);
    const parsed = Number(next);
    if (next !== '' && Number.isInteger(parsed) && parsed >= MIN_STEPS && parsed <= MAX_STEPS) {
      onChange(parsed);
    }
  }

  function handleBlur() {
    const clamped = clampStepCount(draft);
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  }

  const buttonClass =
    'grid size-12 place-items-center rounded-lg border-2 border-ink text-2xl font-bold leading-none transition-colors hover:bg-marker disabled:cursor-not-allowed disabled:border-rule disabled:text-rule disabled:hover:bg-transparent';

  return (
    <div>
      <label htmlFor="step-count" className="block text-lg font-bold">
        Number of steps
      </label>
      <p id="step-count-hint" className="mt-1 text-sm text-ink-soft">
        Between {MIN_STEPS} and {MAX_STEPS}.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className={buttonClass}
          aria-label="Remove a step"
          disabled={value <= MIN_STEPS}
          onClick={() => onChange(value - 1)}
        >
          −
        </button>
        <input
          id="step-count"
          type="number"
          inputMode="numeric"
          min={MIN_STEPS}
          max={MAX_STEPS}
          value={draft}
          onChange={handleInput}
          onBlur={handleBlur}
          aria-describedby="step-count-hint"
          className="h-12 w-20 rounded-lg border-2 border-ink bg-sheet text-center text-2xl font-bold tabular-nums"
        />
        <button
          type="button"
          className={buttonClass}
          aria-label="Add a step"
          disabled={value >= MAX_STEPS}
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
