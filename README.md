# Stepwise: multistep form generator

A React + Vite web app that writes a multistep form component for you. Pick how many
steps you need, name each step and its fields, choose a framework, press **Generate code**,
and copy the result.

Supported output:

| Framework | File | Notes |
|---|---|---|
| React | `MultiStepForm.jsx` | Hooks; `onSubmit(values)` prop (can be async) |
| Next.js | `app/components/MultiStepForm.jsx` | `'use client'`; edit `submitForm()` to call a Server Action or API route |
| Svelte | `MultiStepForm.svelte` | Svelte 5 runes; `onsubmit(values)` prop |
| Angular | `multi-step-form.component.ts` | Standalone, signals, v17+ control flow; `(formSubmit)` output |
| Vue | `MultiStepForm.vue` | Vue 3 `<script setup>`; `@submit` event |

Every generated component includes a "Step X of N" indicator, per-step required-field
validation (with `aria-invalid` / `aria-describedby`), Back / Next / Submit buttons, Enter-to-advance,
and a success message. Output is intentionally unstyled; target the `.msf-*` class names.

## Getting started

Requires Node 20.19+ (Vite 7).

```bash
npm install
npm run dev        # http://localhost:5173
```

## Tests

Vitest + React Testing Library + jest-dom + user-event, running in jsdom.

```bash
npm test           # watch mode
npm run test:run   # single run (use in CI)
npm run coverage
```

| File | Covers |
|---|---|
| `src/__tests__/config.test.js` | step count clamping, resizing, name generation, validation |
| `src/__tests__/generators.test.js` | all five generators: filenames, markers, data, escaping |
| `src/__tests__/StepCountInput.test.jsx` | typing, clamping on blur, +/− limits |
| `src/__tests__/CodeOutput.test.jsx` | empty state, copy to clipboard, clipboard failure, stale warning |
| `src/__tests__/App.test.jsx` | full flow: change steps, pick framework, edit fields, validation, copy |

## Build and host

```bash
npm run build      # outputs static files to dist/
npm run preview    # serve the production build locally
```

`dist/` is plain static files, and `base: './'` in `vite.config.js` makes it work from
any path. Deploy to Netlify, Vercel, Cloudflare Pages, GitHub Pages or S3 with build command
`npm run build` and publish directory `dist`.

## Project structure

```
src/
  App.jsx                    page layout and state
  components/
    StepCountInput.jsx       number of steps (typed or +/−)
    FrameworkPicker.jsx      framework radio group
    StepEditor.jsx           one step: title and fields
    StepTrack.jsx            live preview of the step sequence
    CodeOutput.jsx           generated file, copy button
  lib/config.js              step model, naming, validation
  generators/                one file per framework + index.js
```

### Adding a framework

1. Create `src/generators/<name>.js` exporting a function that takes normalized steps
   (`[{ title, fields: [{ name, label, type, required }] }]`) and returns
   `{ filename, language, code, notes }`.
2. Register it in `GENERATORS` and `FRAMEWORKS` in `src/generators/index.js`.
3. Add an entry to `expectations` in `generators.test.js`.

Use `serializeSteps()` from `shared.js` to embed the form data. It escapes `<`, so a label
like `</script>` can't break out of a Svelte or Vue script block.
