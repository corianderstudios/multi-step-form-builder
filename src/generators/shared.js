/**
 * Serialises the steps as a JS/TS literal. JSON is valid in every target language,
 * and escaping "<" keeps a label such as "</script>" from closing an SFC script block.
 */
export function serializeSteps(steps) {
  return JSON.stringify(steps, null, 2).replace(/</g, '\\u003c');
}

export const INITIAL_VALUES_JS = `Object.fromEntries(
  steps.flatMap((step) => step.fields.map((field) => [field.name, '']))
)`;
