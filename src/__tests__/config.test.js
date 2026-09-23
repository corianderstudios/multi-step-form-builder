import { describe, expect, it } from 'vitest';
import {
  MAX_STEPS,
  MIN_STEPS,
  clampStepCount,
  createField,
  createStep,
  normalizeSteps,
  resizeSteps,
  toCamelCase,
  validateSteps,
} from '../lib/config.js';

describe('clampStepCount', () => {
  it.each([
    ['3', 3],
    [7, 7],
    [0, MIN_STEPS],
    [-4, MIN_STEPS],
    [99, MAX_STEPS],
    ['abc', MIN_STEPS],
    ['', MIN_STEPS],
    ['4.8', 4],
  ])('turns %p into %p', (input, expected) => {
    expect(clampStepCount(input)).toBe(expected);
  });
});

describe('resizeSteps', () => {
  it('creates starter steps from nothing', () => {
    const steps = resizeSteps([], 3);
    expect(steps.map((step) => step.title)).toEqual(['Your details', 'Address', 'Anything else?']);
  });

  it('keeps existing steps when growing', () => {
    const original = resizeSteps([], 2);
    const grown = resizeSteps(original, 5);
    expect(grown).toHaveLength(5);
    expect(grown[0]).toBe(original[0]);
    expect(grown[1]).toBe(original[1]);
    expect(grown[4].title).toBe('Step 5');
  });

  it('drops steps from the end when shrinking', () => {
    const original = resizeSteps([], 4);
    const shrunk = resizeSteps(original, 2);
    expect(shrunk).toEqual(original.slice(0, 2));
  });

  it('never goes outside the allowed range', () => {
    expect(resizeSteps([], 50)).toHaveLength(MAX_STEPS);
    expect(resizeSteps(resizeSteps([], 3), 0)).toHaveLength(MIN_STEPS);
  });

  it('gives every step and field a unique id', () => {
    const steps = resizeSteps([], MAX_STEPS);
    const ids = steps.flatMap((step) => [step.id, ...step.fields.map((field) => field.id)]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('toCamelCase', () => {
  it.each([
    ['Full name', 'fullName'],
    ['E-mail address', 'eMailAddress'],
    ['  ZIP / postal code ', 'zipPostalCode'],
    ['2nd phone', 'field2ndPhone'],
    ['Café', 'cafe'],
    ['!!!', 'field'],
  ])('%p -> %p', (label, expected) => {
    expect(toCamelCase(label)).toBe(expected);
  });
});

describe('normalizeSteps', () => {
  it('produces clean data with unique field names across steps', () => {
    const steps = [
      { id: 's1', title: ' Contact ', fields: [createField({ label: 'Email', type: 'email', required: true })] },
      { id: 's2', title: 'Backup', fields: [createField({ label: 'Email' }), createField({ label: 'email!' })] },
    ];
    expect(normalizeSteps(steps)).toEqual([
      { title: 'Contact', fields: [{ name: 'email', label: 'Email', type: 'email', required: true }] },
      {
        title: 'Backup',
        fields: [
          { name: 'email2', label: 'Email', type: 'text', required: false },
          { name: 'email3', label: 'email!', type: 'text', required: false },
        ],
      },
    ]);
  });
});

describe('validateSteps', () => {
  it('accepts the starter steps', () => {
    expect(validateSteps(resizeSteps([], 5))).toEqual({});
  });

  it('reports blank titles, blank labels and empty steps', () => {
    const blankLabel = createField({ label: '   ' });
    const steps = [
      { ...createStep(0), id: 'a', title: '' },
      { id: 'b', title: 'Ok', fields: [blankLabel] },
      { id: 'c', title: 'Empty', fields: [] },
    ];
    expect(validateSteps(steps)).toEqual({
      'a:title': 'Give step 1 a title.',
      [blankLabel.id]: 'Give field 1 in step 2 a label.',
      'c:fields': 'Add at least one field to step 3.',
    });
  });
});
