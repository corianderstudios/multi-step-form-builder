export const MIN_STEPS = 1;
export const MAX_STEPS = 10;

export const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'tel', label: 'Phone' },
  { value: 'date', label: 'Date' },
  { value: 'password', label: 'Password' },
  { value: 'textarea', label: 'Long text' },
];

let idCounter = 0;
export function createId(prefix = 'id') {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function createField(overrides = {}) {
  return { id: createId('field'), label: '', type: 'text', required: false, ...overrides };
}

const STARTER_STEPS = [
  {
    title: 'Your details',
    fields: [
      { label: 'Full name', type: 'text', required: true },
      { label: 'Email', type: 'email', required: true },
    ],
  },
  {
    title: 'Address',
    fields: [
      { label: 'Street address', type: 'text', required: true },
      { label: 'City', type: 'text', required: true },
    ],
  },
  {
    title: 'Anything else?',
    fields: [{ label: 'Message', type: 'textarea', required: false }],
  },
];

/** Creates a step for the given zero-based position, with sensible starter content. */
export function createStep(index) {
  const starter = STARTER_STEPS[index];
  if (starter) {
    return {
      id: createId('step'),
      title: starter.title,
      fields: starter.fields.map((field) => createField(field)),
    };
  }
  return {
    id: createId('step'),
    title: `Step ${index + 1}`,
    fields: [createField({ label: `Question ${index + 1}` })],
  };
}

/** Parses any input into a whole number of steps within the allowed range. */
export function clampStepCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return MIN_STEPS;
  return Math.min(MAX_STEPS, Math.max(MIN_STEPS, parsed));
}

/** Grows or shrinks the step list, keeping any steps the user already edited. */
export function resizeSteps(steps, count) {
  const target = clampStepCount(count);
  if (target <= steps.length) return steps.slice(0, target);
  const added = Array.from({ length: target - steps.length }, (_, offset) =>
    createStep(steps.length + offset),
  );
  return [...steps, ...added];
}

/** Turns a human label into a safe camelCase identifier, e.g. "Street address" -> "streetAddress". */
export function toCamelCase(label) {
  const words = String(label)
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'field';
  const name = words
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
  return /^[0-9]/.test(name) ? `field${name}` : name;
}

/**
 * Converts editor state into the clean shape the generators use.
 * Field names are unique across the whole form, because every step shares one values object.
 */
export function normalizeSteps(steps) {
  const used = new Map();
  return steps.map((step) => ({
    title: step.title.trim(),
    fields: step.fields.map((field) => {
      const base = toCamelCase(field.label);
      const count = (used.get(base) ?? 0) + 1;
      used.set(base, count);
      return {
        name: count === 1 ? base : `${base}${count}`,
        label: field.label.trim(),
        type: field.type,
        required: Boolean(field.required),
      };
    }),
  }));
}

/** Returns a map of problems keyed by "stepId:title", "stepId:fields" or "fieldId". Empty means valid. */
export function validateSteps(steps) {
  const errors = {};
  steps.forEach((step, stepIndex) => {
    const stepNumber = stepIndex + 1;
    if (!step.title.trim()) {
      errors[`${step.id}:title`] = `Give step ${stepNumber} a title.`;
    }
    if (step.fields.length === 0) {
      errors[`${step.id}:fields`] = `Add at least one field to step ${stepNumber}.`;
    }
    step.fields.forEach((field, fieldIndex) => {
      if (!field.label.trim()) {
        errors[field.id] = `Give field ${fieldIndex + 1} in step ${stepNumber} a label.`;
      }
    });
  });
  return errors;
}
