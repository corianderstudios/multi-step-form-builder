import { FIELD_TYPES } from '../lib/config.js';

const inputClass =
  'w-full rounded-md border-2 border-rule bg-sheet px-3 py-2 focus:border-ink aria-[invalid=true]:border-alert';

export default function StepEditor({
  step,
  index,
  errors,
  onTitleChange,
  onFieldChange,
  onAddField,
  onRemoveField,
}) {
  const stepNumber = index + 1;
  const titleError = errors[`${step.id}:title`];
  const fieldsError = errors[`${step.id}:fields`];

  return (
    <li className="relative pl-12">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 grid size-9 place-items-center rounded-full bg-ink font-bold text-paper tabular-nums"
      >
        {stepNumber}
      </span>
      <fieldset className="rounded-xl border-2 border-rule bg-sheet p-4">
        <legend className="sr-only">Step {stepNumber}</legend>

        <label htmlFor={`${step.id}-title`} className="sr-only">
          Step {stepNumber} title
        </label>
        <input
          id={`${step.id}-title`}
          value={step.title}
          onChange={(event) => onTitleChange(step.id, event.target.value)}
          placeholder="Step title"
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? `${step.id}-title-error` : undefined}
          className="w-full border-b-2 border-rule bg-transparent pb-1 text-xl font-bold focus:border-ink aria-[invalid=true]:border-alert"
        />
        {titleError && (
          <p id={`${step.id}-title-error`} className="mt-1 text-sm font-medium text-alert">
            {titleError}
          </p>
        )}

        <ul className="mt-4 space-y-3">
          {step.fields.map((field, fieldIndex) => {
            const prefix = `Step ${stepNumber}, field ${fieldIndex + 1}`;
            const labelError = errors[field.id];
            return (
              <li key={field.id} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_9rem_auto_auto] sm:items-center">
                <div className="col-span-2 sm:col-span-1">
                  <input
                    value={field.label}
                    onChange={(event) => onFieldChange(step.id, field.id, { label: event.target.value })}
                    placeholder="Field label"
                    aria-label={`${prefix} label`}
                    aria-invalid={Boolean(labelError)}
                    aria-describedby={labelError ? `${field.id}-error` : undefined}
                    className={inputClass}
                  />
                  {labelError && (
                    <p id={`${field.id}-error`} className="mt-1 text-sm font-medium text-alert">
                      {labelError}
                    </p>
                  )}
                </div>
                <select
                  value={field.type}
                  onChange={(event) => onFieldChange(step.id, field.id, { type: event.target.value })}
                  aria-label={`${prefix} type`}
                  className={inputClass}
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(event) =>
                      onFieldChange(step.id, field.id, { required: event.target.checked })
                    }
                    aria-label={`${prefix} required`}
                    className="size-4 accent-ink"
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => onRemoveField(step.id, field.id)}
                  aria-label={`Remove ${prefix.toLowerCase()}`}
                  className="justify-self-end rounded-md px-2 py-1 text-sm text-ink-soft underline decoration-rule underline-offset-4 hover:text-alert hover:decoration-alert"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
        {fieldsError && <p className="mt-2 text-sm font-medium text-alert">{fieldsError}</p>}

        <button
          type="button"
          onClick={() => onAddField(step.id)}
          className="mt-3 rounded-md border-2 border-dashed border-rule px-3 py-1.5 text-sm font-medium hover:border-ink"
        >
          Add field to step {stepNumber}
        </button>
      </fieldset>
    </li>
  );
}
