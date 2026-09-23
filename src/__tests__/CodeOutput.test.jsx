import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CodeOutput from '../components/CodeOutput.jsx';

const output = {
  filename: 'MultiStepForm.jsx',
  language: 'jsx',
  code: 'export default function MultiStepForm() {}',
  notes: ['A helpful note.'],
};

describe('CodeOutput', () => {
  it('shows an empty state before anything is generated', () => {
    render(<CodeOutput output={null} isStale={false} />);
    expect(screen.getByText(/press Generate code/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('shows the filename, code and notes', () => {
    render(<CodeOutput output={output} isStale={false} />);
    expect(screen.getByText('MultiStepForm.jsx')).toBeInTheDocument();
    expect(screen.getByLabelText('Generated source')).toHaveTextContent(output.code);
    expect(screen.getByText('A helpful note.')).toBeInTheDocument();
  });

  it('copies the code to the clipboard', async () => {
    const user = userEvent.setup();
    render(<CodeOutput output={output} isStale={false} />);

    await user.click(screen.getByRole('button', { name: 'Copy code' }));

    expect(await navigator.clipboard.readText()).toBe(output.code);
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('explains what to do when the clipboard is blocked', async () => {
    const user = userEvent.setup();
    render(<CodeOutput output={output} isStale={false} />);
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('denied'));

    await user.click(screen.getByRole('button', { name: 'Copy code' }));

    expect(await screen.findByText(/copy it manually/i)).toBeInTheDocument();
  });

  it('warns when the output is out of date', () => {
    render(<CodeOutput output={output} isStale />);
    expect(screen.getByRole('status')).toHaveTextContent(/Generate again/);
  });
});
