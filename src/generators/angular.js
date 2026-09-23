import { serializeSteps } from './shared.js';

export function generateAngular(steps) {
  const code = `import { Component, EventEmitter, Output, computed, signal } from '@angular/core';

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface FormStep {
  title: string;
  fields: FormField[];
}

type FormValues = Record<string, string>;

const STEPS: FormStep[] = ${serializeSteps(steps)};

@Component({
  selector: 'app-multi-step-form',
  standalone: true,
  template: \`
    @if (status() === 'done') {
      <div class="msf-success" role="status">
        <h2>Thanks!</h2>
        <p>Your answers have been submitted.</p>
      </div>
    } @else {
      <form class="msf" novalidate (submit)="handleSubmit($event)">
        <p class="msf-progress" aria-live="polite">Step {{ currentStep() + 1 }} of {{ steps.length }}</p>
        <h2>{{ step().title }}</h2>

        @for (field of step().fields; track field.name) {
          <div class="msf-field">
            <label [attr.for]="field.name">
              {{ field.label }}@if (field.required) {<span aria-hidden="true"> *</span>}
            </label>
            @if (field.type === 'textarea') {
              <textarea
                [id]="field.name"
                [name]="field.name"
                [value]="values()[field.name]"
                (input)="updateValue(field.name, $event)"
                [attr.aria-required]="field.required"
                [attr.aria-invalid]="!!errors()[field.name]"
                [attr.aria-describedby]="errors()[field.name] ? field.name + '-error' : null"
              ></textarea>
            } @else {
              <input
                [id]="field.name"
                [name]="field.name"
                [type]="field.type"
                [value]="values()[field.name]"
                (input)="updateValue(field.name, $event)"
                [attr.aria-required]="field.required"
                [attr.aria-invalid]="!!errors()[field.name]"
                [attr.aria-describedby]="errors()[field.name] ? field.name + '-error' : null"
              />
            }
            @if (errors()[field.name]; as error) {
              <p class="msf-error" [id]="field.name + '-error'">{{ error }}</p>
            }
          </div>
        }

        <div class="msf-actions">
          @if (currentStep() > 0) {
            <button type="button" (click)="handleBack()">Back</button>
          }
          <button type="submit">{{ isLastStep() ? 'Submit' : 'Next' }}</button>
        </div>
      </form>
    }
  \`,
})
export class MultiStepFormComponent {
  @Output() formSubmit = new EventEmitter<FormValues>();

  readonly steps = STEPS;
  readonly currentStep = signal(0);
  readonly values = signal<FormValues>(
    Object.fromEntries(STEPS.flatMap((step) => step.fields.map((field) => [field.name, '']))),
  );
  readonly errors = signal<FormValues>({});
  readonly status = signal<'idle' | 'done'>('idle');

  readonly step = computed(() => this.steps[this.currentStep()]);
  readonly isLastStep = computed(() => this.currentStep() === this.steps.length - 1);

  updateValue(name: string, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.values.update((current) => ({ ...current, [name]: value }));
  }

  handleBack(): void {
    this.errors.set({});
    this.currentStep.update((index) => Math.max(index - 1, 0));
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    if (!this.validateStep()) return;
    if (!this.isLastStep()) {
      this.currentStep.update((index) => index + 1);
      return;
    }
    this.formSubmit.emit(this.values());
    this.status.set('done');
  }

  private validateStep(): boolean {
    const stepErrors: FormValues = {};
    for (const field of this.step().fields) {
      if (field.required && !this.values()[field.name].trim()) {
        stepErrors[field.name] = field.label + ' is required.';
      }
    }
    this.errors.set(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }
}
`;
  return {
    filename: 'multi-step-form.component.ts',
    language: 'typescript',
    code,
    notes: [
      'Standalone component using signals and the built-in control flow (Angular 17+). No FormsModule needed.',
      'Use it as <app-multi-step-form (formSubmit)="save($event)" />.',
    ],
  };
}
