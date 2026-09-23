import { useMemo, useRef, useState } from "react";
import CodeOutput from "./components/CodeOutput.jsx";
import FrameworkPicker from "./components/FrameworkPicker.jsx";
import StepCountInput from "./components/StepCountInput.jsx";
import StepEditor from "./components/StepEditor.jsx";
import StepTrack from "./components/StepTrack.jsx";
import { generateCode } from "./generators/index.js";
import {
  createField,
  normalizeSteps,
  resizeSteps,
  validateSteps,
} from "./lib/config.js";

export default function App() {
  const [steps, setSteps] = useState(() => resizeSteps([], 3));
  const [framework, setFramework] = useState("react");
  const [showErrors, setShowErrors] = useState(false);
  const [output, setOutput] = useState(null);
  const outputHeadingRef = useRef(null);

  const signature = useMemo(
    () => JSON.stringify({ framework, steps: normalizeSteps(steps) }),
    [framework, steps],
  );
  const isStale = Boolean(output) && output.signature !== signature;
  // After the first failed attempt, errors update live so they disappear as they're fixed.
  const errors = useMemo(
    () => (showErrors ? validateSteps(steps) : {}),
    [showErrors, steps],
  );
  const errorCount = Object.keys(errors).length;

  function updateStep(stepId, update) {
    setSteps((current) =>
      current.map((step) => (step.id === stepId ? update(step) : step)),
    );
  }

  const handlers = {
    onTitleChange: (stepId, title) =>
      updateStep(stepId, (step) => ({ ...step, title })),
    onFieldChange: (stepId, fieldId, patch) =>
      updateStep(stepId, (step) => ({
        ...step,
        fields: step.fields.map((field) =>
          field.id === fieldId ? { ...field, ...patch } : field,
        ),
      })),
    onAddField: (stepId) =>
      updateStep(stepId, (step) => ({
        ...step,
        fields: [...step.fields, createField()],
      })),
    onRemoveField: (stepId, fieldId) =>
      updateStep(stepId, (step) => ({
        ...step,
        fields: step.fields.filter((field) => field.id !== fieldId),
      })),
  };

  function handleSubmit(event) {
    event.preventDefault();
    const problems = validateSteps(steps);
    if (Object.keys(problems).length > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setOutput({ ...generateCode(framework, steps), signature });
    outputHeadingRef.current?.focus();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="font-bold">Stepwise</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Describe the steps. <br /> Paste the form.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-soft">
          Choose how many steps your form has, what each one asks, and your
          framework. You get one component with step validation, Back and Next
          buttons, and a submit handler.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Form builder"
          className="space-y-8"
        >
          <div className="grid gap-8 sm:grid-cols-[auto_1fr]">
            <StepCountInput
              value={steps.length}
              onChange={(count) =>
                setSteps((current) => resizeSteps(current, count))
              }
            />
            <FrameworkPicker value={framework} onChange={setFramework} />
          </div>

          <div>
            <h2 className="text-lg font-bold">Steps</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Name each step and list the fields it asks for.
            </p>
            <div className="mt-4">
              <StepTrack steps={steps} />
              <ol className="space-y-5 border-t-2 border-ink pt-5">
                {steps.map((step, index) => (
                  <StepEditor
                    key={step.id}
                    step={step}
                    index={index}
                    errors={errors}
                    {...handlers}
                  />
                ))}
              </ol>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-4 bg-paper/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0">
            {errorCount > 0 && (
              <p role="alert" className="mb-3 font-medium text-alert">
                {errorCount === 1
                  ? "Fix 1 problem"
                  : `Fix ${errorCount} problems`}{" "}
                above before generating.
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-ink px-6 py-4 text-lg font-bold text-paper transition-colors hover:bg-go sm:w-auto"
            >
              Generate code
            </button>
          </div>
        </form>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <CodeOutput
            ref={outputHeadingRef}
            output={output}
            isStale={isStale}
          />
        </div>
      </div>
    </div>
  );
}
