import { INITIAL_VALUES_JS, serializeSteps } from './shared.js';

/**
 * Builds the shared React component body. The Next.js generator reuses it with a
 * 'use client' directive and a local submit handler instead of a prop.
 */
export function buildReactComponent(steps, { header, beforeComponent = '', signature, submitCall }) {
  return `${header}import { useState } from 'react';

const steps = ${serializeSteps(steps)};

const initialValues = ${INITIAL_VALUES_JS};
${beforeComponent}
export default function MultiStepForm(${signature}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function validateStep() {
    const stepErrors = {};
    for (const field of step.fields) {
      if (field.required && !values[field.name].trim()) {
        stepErrors[field.name] = field.label + ' is required.';
      }
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function handleBack() {
    setErrors({});
    setCurrentStep((index) => Math.max(index - 1, 0));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateStep()) return;
    if (!isLastStep) {
      setCurrentStep((index) => index + 1);
      return;
    }
    setStatus('submitting');
    try {
      await ${submitCall};
      setStatus('done');
    } catch (error) {
      console.error(error);
      setStatus('idle');
    }
  }

  if (status === 'done') {
    return (
      <div className="msf-success" role="status">
        <h2>Thanks!</h2>
        <p>Your answers have been submitted.</p>
      </div>
    );
  }

  return (
    <form className="msf" onSubmit={handleSubmit} noValidate>
      <p className="msf-progress" aria-live="polite">
        Step {currentStep + 1} of {steps.length}
      </p>
      <h2>{step.title}</h2>

      {step.fields.map((field) => {
        const errorId = field.name + '-error';
        const Control = field.type === 'textarea' ? 'textarea' : 'input';
        return (
          <div className="msf-field" key={field.name}>
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span aria-hidden="true"> *</span>}
            </label>
            <Control
              id={field.name}
              name={field.name}
              type={field.type === 'textarea' ? undefined : field.type}
              value={values[field.name]}
              onChange={handleChange}
              aria-required={field.required}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={errors[field.name] ? errorId : undefined}
            />
            {errors[field.name] && (
              <p className="msf-error" id={errorId}>
                {errors[field.name]}
              </p>
            )}
          </div>
        );
      })}

      <div className="msf-actions">
        {currentStep > 0 && (
          <button type="button" onClick={handleBack}>
            Back
          </button>
        )}
        <button type="submit" disabled={status === 'submitting'}>
          {isLastStep ? 'Submit' : 'Next'}
        </button>
      </div>
    </form>
  );
}
`;
}

export function generateReact(steps) {
  return {
    filename: 'MultiStepForm.jsx',
    language: 'jsx',
    code: buildReactComponent(steps, {
      header: '',
      signature: '{ onSubmit = (values) => console.log(values) }',
      submitCall: 'onSubmit(values)',
    }),
    notes: [
      'Import it anywhere: <MultiStepForm onSubmit={(values) => save(values)} />.',
      'onSubmit receives every answer as one object keyed by field name. It can be async.',
    ],
  };
}
