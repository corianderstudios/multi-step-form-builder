import { normalizeSteps } from '../lib/config.js';
import { generateAngular } from './angular.js';
import { generateNextjs } from './nextjs.js';
import { generateReact } from './react.js';
import { generateSvelte } from './svelte.js';
import { generateVue } from './vue.js';

export const FRAMEWORKS = [
  { id: 'react', name: 'React', detail: 'Function component with hooks' },
  { id: 'nextjs', name: 'Next.js', detail: 'App Router client component' },
  { id: 'svelte', name: 'Svelte', detail: 'Svelte 5 component with runes' },
  { id: 'angular', name: 'Angular', detail: 'Standalone component, v17+' },
  { id: 'vue', name: 'Vue', detail: 'Vue 3 single-file component' },
];

const GENERATORS = {
  react: generateReact,
  nextjs: generateNextjs,
  svelte: generateSvelte,
  angular: generateAngular,
  vue: generateVue,
};

/**
 * Generates a multistep form component.
 * @param {string} framework - one of the FRAMEWORKS ids
 * @param {Array} steps - editor steps ({ title, fields: [{ label, type, required }] })
 * @returns {{ filename: string, language: string, code: string, notes: string[] }}
 */
export function generateCode(framework, steps) {
  const generator = GENERATORS[framework];
  if (!generator) {
    throw new Error(`Unknown framework "${framework}".`);
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error('A form needs at least one step.');
  }
  return generator(normalizeSteps(steps));
}
