import { describe, expect, it } from 'vitest';
import { createField, resizeSteps } from '../lib/config.js';
import { FRAMEWORKS, generateCode } from '../generators/index.js';

const steps = resizeSteps([], 3);

const expectations = {
  react: { filename: 'MultiStepForm.jsx', markers: ["import { useState } from 'react'", 'export default function MultiStepForm({ onSubmit'] },
  nextjs: { filename: 'app/components/MultiStepForm.jsx', markers: ["'use client';", 'async function submitForm(values)'] },
  svelte: { filename: 'MultiStepForm.svelte', markers: ['$props()', '$state(0)', '{#each step.fields as field'] },
  angular: { filename: 'multi-step-form.component.ts', markers: ['@Component({', 'standalone: true', 'export class MultiStepFormComponent'] },
  vue: { filename: 'MultiStepForm.vue', markers: ['<script setup>', "defineEmits(['submit'])", '<template>'] },
};

describe('generateCode', () => {
  it('covers every framework in the picker', () => {
    expect(FRAMEWORKS.map((framework) => framework.id).sort()).toEqual(Object.keys(expectations).sort());
  });

  describe.each(Object.entries(expectations))('%s', (framework, { filename, markers }) => {
    const result = generateCode(framework, steps);

    it('names the file for the framework', () => {
      expect(result.filename).toBe(filename);
    });

    it('includes framework-specific code', () => {
      for (const marker of markers) {
        expect(result.code).toContain(marker);
      }
    });

    it('embeds every step title and field name', () => {
      for (const title of ['Your details', 'Address', 'Anything else?']) {
        expect(result.code).toContain(`"title": "${title}"`);
      }
      for (const name of ['fullName', 'email', 'streetAddress', 'city', 'message']) {
        expect(result.code).toContain(`"name": "${name}"`);
      }
    });

    it('has Back, Next and Submit controls with required-field validation', () => {
      expect(result.code).toContain('Back');
      expect(result.code).toContain("'Submit'");
      expect(result.code).toContain("'Next'");
      expect(result.code).toContain(' is required.');
    });

    it('returns usage notes', () => {
      expect(result.notes.length).toBeGreaterThan(0);
    });

    it('keeps awkward labels from breaking out of the code', () => {
      const tricky = [
        {
          id: 't',
          title: 'Quotes " and `ticks` ${x}',
          fields: [createField({ label: '</script><b>hi</b>' })],
        },
      ];
      const { code } = generateCode(framework, tricky);
      expect(code).toContain('Quotes \\" and `ticks` ${x}');
      expect(code).toContain('\\u003c/script>');
      const closingTags = code.match(/<\/script>/g) ?? [];
      expect(closingTags.length).toBe(framework === 'svelte' || framework === 'vue' ? 1 : 0);
    });
  });

  it('rejects unknown frameworks', () => {
    expect(() => generateCode('ember', steps)).toThrow('Unknown framework "ember".');
  });

  it('rejects an empty form', () => {
    expect(() => generateCode('react', [])).toThrow('at least one step');
  });
});
