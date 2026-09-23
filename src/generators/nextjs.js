import { buildReactComponent } from './react.js';

export function generateNextjs(steps) {
  return {
    filename: 'app/components/MultiStepForm.jsx',
    language: 'jsx',
    code: buildReactComponent(steps, {
      header: "'use client';\n\n",
      beforeComponent: `
async function submitForm(values) {
  // Replace with a Server Action or a fetch() to your route handler, e.g.:
  // await fetch('/api/submit', { method: 'POST', body: JSON.stringify(values) });
  console.log('Form submitted', values);
}
`,
      signature: '',
      submitCall: 'submitForm(values)',
    }),
    notes: [
      "The 'use client' directive is required because the form keeps state.",
      'Render it from any server page: import MultiStepForm from "@/app/components/MultiStepForm".',
      'Edit submitForm() to call your Server Action or API route.',
    ],
  };
}
