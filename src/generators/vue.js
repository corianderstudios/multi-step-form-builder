import { INITIAL_VALUES_JS, serializeSteps } from './shared.js';

export function generateVue(steps) {
  const code = `<script setup>
import { computed, reactive, ref } from 'vue';

const emit = defineEmits(['submit']);

const steps = ${serializeSteps(steps)};

const currentStep = ref(0);
const values = reactive(${INITIAL_VALUES_JS});
const errors = ref({});
const status = ref('idle');

const step = computed(() => steps[currentStep.value]);
const isLastStep = computed(() => currentStep.value === steps.length - 1);

function validateStep() {
  const stepErrors = {};
  for (const field of step.value.fields) {
    if (field.required && !values[field.name].trim()) {
      stepErrors[field.name] = field.label + ' is required.';
    }
  }
  errors.value = stepErrors;
  return Object.keys(stepErrors).length === 0;
}

function handleBack() {
  errors.value = {};
  currentStep.value = Math.max(currentStep.value - 1, 0);
}

function handleSubmit() {
  if (!validateStep()) return;
  if (!isLastStep.value) {
    currentStep.value += 1;
    return;
  }
  emit('submit', { ...values });
  status.value = 'done';
}
</script>

<template>
  <div v-if="status === 'done'" class="msf-success" role="status">
    <h2>Thanks!</h2>
    <p>Your answers have been submitted.</p>
  </div>

  <form v-else class="msf" novalidate @submit.prevent="handleSubmit">
    <p class="msf-progress" aria-live="polite">Step {{ currentStep + 1 }} of {{ steps.length }}</p>
    <h2>{{ step.title }}</h2>

    <div v-for="field in step.fields" :key="field.name" class="msf-field">
      <label :for="field.name">
        {{ field.label }}<span v-if="field.required" aria-hidden="true"> *</span>
      </label>
      <textarea
        v-if="field.type === 'textarea'"
        :id="field.name"
        v-model="values[field.name]"
        :name="field.name"
        :aria-required="field.required"
        :aria-invalid="Boolean(errors[field.name])"
        :aria-describedby="errors[field.name] ? field.name + '-error' : undefined"
      />
      <input
        v-else
        :id="field.name"
        v-model="values[field.name]"
        :name="field.name"
        :type="field.type"
        :aria-required="field.required"
        :aria-invalid="Boolean(errors[field.name])"
        :aria-describedby="errors[field.name] ? field.name + '-error' : undefined"
      />
      <p v-if="errors[field.name]" :id="field.name + '-error'" class="msf-error">
        {{ errors[field.name] }}
      </p>
    </div>

    <div class="msf-actions">
      <button v-if="currentStep > 0" type="button" @click="handleBack">Back</button>
      <button type="submit">{{ isLastStep ? 'Submit' : 'Next' }}</button>
    </div>
  </form>
</template>
`;
  return {
    filename: 'MultiStepForm.vue',
    language: 'vue',
    code,
    notes: [
      'Vue 3 single-file component using <script setup>.',
      'Listen for the answers with <MultiStepForm @submit="save" />.',
    ],
  };
}
