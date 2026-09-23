/** A live preview of the form's sequence, drawn as folder tabs. */
export default function StepTrack({ steps }) {
  return (
    <ol className="flex gap-1 overflow-x-auto pb-1" aria-label="Form steps preview">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`min-w-24 flex-1 rounded-t-lg border-2 border-b-0 px-3 pb-3 pt-2 ${
            index === 0 ? 'border-ink bg-marker' : 'border-ink/25 bg-sheet'
          }`}
        >
          <span className="block text-sm font-bold tabular-nums">{index + 1}</span>
          <span className="block truncate text-sm">{step.title.trim() || 'Untitled'}</span>
        </li>
      ))}
    </ol>
  );
}
