import { forwardRef, useEffect, useState } from 'react';

const CodeOutput = forwardRef(function CodeOutput({ output, isStale }, headingRef) {
  const [copyState, setCopyState] = useState('idle');

  useEffect(() => {
    setCopyState('idle');
  }, [output]);

  useEffect(() => {
    if (copyState !== 'copied') return undefined;
    const timer = setTimeout(() => setCopyState('idle'), 2000);
    return () => clearTimeout(timer);
  }, [copyState]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output.code);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }

  return (
    <section aria-labelledby="output-heading" className="flex min-h-0 flex-col">
      <h2 id="output-heading" ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold tracking-tight">
        Generated code
      </h2>

      {!output ? (
        <div className="mt-4 rounded-xl border-2 border-dashed border-rule p-8 text-ink-soft">
          <p>Set your steps and framework, then press Generate code. Your component will appear here, ready to copy.</p>
        </div>
      ) : (
        <div className="mt-4 flex min-h-0 flex-col">
          {isStale && (
            <p role="status" className="mb-3 rounded-lg border-2 border-ink bg-marker px-3 py-2 text-sm font-medium">
              Your settings changed since this was generated. Generate again to update it.
            </p>
          )}

          <div className="flex items-center justify-between gap-3 rounded-t-xl bg-ink px-4 py-2.5 text-paper">
            <span className="truncate font-mono text-sm">{output.filename}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-md bg-paper px-3 py-1.5 text-sm font-bold text-ink hover:bg-marker focus-visible:outline-paper"
            >
              {copyState === 'copied' ? 'Copied' : 'Copy code'}
            </button>
          </div>
          <pre
            aria-label="Generated source"
            tabIndex={0}
            className="max-h-[32rem] overflow-auto rounded-b-xl bg-[#26374a] p-4 font-mono text-[13px] leading-relaxed text-[#e6ece8] lg:max-h-[calc(100vh-18rem)]"
          >
            <code>{output.code}</code>
          </pre>
          <p aria-live="polite" className="sr-only">
            {copyState === 'copied' ? 'Code copied to clipboard.' : ''}
          </p>
          {copyState === 'failed' && (
            <p className="mt-2 text-sm font-medium text-alert">
              Your browser blocked clipboard access. Select the code above and copy it manually.
            </p>
          )}

          {output.notes.length > 0 && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-soft">
              {output.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
});

export default CodeOutput;
