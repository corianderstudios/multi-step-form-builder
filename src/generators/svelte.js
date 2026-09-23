import { INITIAL_VALUES_JS, serializeSteps } from './shared.js';

export function generateSvelte(steps) {
  const code = `<script>
  let { onsubmit = (values) => console.log(values) } = $props();

  const steps = ${serializeSteps(steps).replace(/\n/g, '\n  ')};

  let currentStep = $state(0);
  let values = $state(${INITIAL_VALUES_JS.replace(/\n/g, '\n  ')});
  let errors = $state({});
  let status = $state('idle');

  let step = $derived(steps[currentStep]);
  let isLastStep = $derived(currentStep === steps.length - 1);

  function validateStep() {
    const stepErrors = {};
    for (const field of step.fields) {
      if (field.required && !values[field.name].trim()) {
        stepErrors[field.name] = field.label + ' is required.';
      }
    }
    errors = stepErrors;
    return Object.keys(stepErrors).length === 0;
  }

  function handleBack() {
    errors = {};
    currentStep = Math.max(currentStep - 1, 0);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateStep()) return;
    if (!isLastStep) {
      currentStep += 1;
      return;
    }
    status = 'submitting';
    try {
      await onsubmit($state.snapshot(values));
      status = 'done';
    } catch (error) {
      console.error(error);
      status = 'idle';
    }
  }
</script>

{#if status === 'done'}
  <div class="msf-success" role="status">
    <h2>Thanks!</h2>
    <p>Your answers have been submitted.</p>
  </div>
{:else}
  <form class="msf" onsubmit={handleSubmit} novalidate>
    <p class="msf-progress" aria-live="polite">Step {currentStep + 1} of {steps.length}</p>
    <h2>{step.title}</h2>

    {#each step.fields as field (field.name)}
      <div class="msf-field">
        <label for={field.name}>
          {field.label}{#if field.required}<span aria-hidden="true"> *</span>{/if}
        </label>
        {#if field.type === 'textarea'}
          <textarea
            id={field.name}
            name={field.name}
            value={values[field.name]}
            oninput={(event) => (values[field.name] = event.currentTarget.value)}
            aria-required={field.required}
            aria-invalid={Boolean(errors[field.name])}
            aria-describedby={errors[field.name] ? field.name + '-error' : undefined}
          ></textarea>
        {:else}
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={values[field.name]}
            oninput={(event) => (values[field.name] = event.currentTarget.value)}
            aria-required={field.required}
            aria-invalid={Boolean(errors[field.name])}
            aria-describedby={errors[field.name] ? field.name + '-error' : undefined}
          />
        {/if}
        {#if errors[field.name]}
          <p class="msf-error" id={field.name + '-error'}>{errors[field.name]}</p>
        {/if}
      </div>
    {/each}

    <div class="msf-actions">
      {#if currentStep > 0}
        <button type="button" onclick={handleBack}>Back</button>
      {/if}
      <button type="submit" disabled={status === 'submitting'}>
        {isLastStep ? 'Submit' : 'Next'}
      </button>
    </div>
  </form>
{/if}
`;
  return {
    filename: 'MultiStepForm.svelte',
    language: 'svelte',
    code,
    notes: [
      'Written for Svelte 5 (runes). Use it as <MultiStepForm onsubmit={(values) => save(values)} />.',
      'onsubmit receives a plain object of answers keyed by field name. It can be async.',
    ],
  };
}
