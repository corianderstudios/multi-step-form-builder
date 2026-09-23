import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StepCountInput from '../components/StepCountInput.jsx';

describe('StepCountInput', () => {
  it('calls onChange with the typed value when it is in range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StepCountInput value={3} onChange={onChange} />);

    const input = screen.getByLabelText('Number of steps');
    await user.clear(input);
    expect(onChange).not.toHaveBeenCalled();
    await user.type(input, '6');
    expect(onChange).toHaveBeenLastCalledWith(6);
  });

  it('clamps out-of-range values when the field loses focus', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StepCountInput value={3} onChange={onChange} />);

    const input = screen.getByLabelText('Number of steps');
    await user.clear(input);
    await user.type(input, '42');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(input).toHaveValue(10);
  });

  it('disables the buttons at the limits', () => {
    const { rerender } = render(<StepCountInput value={1} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Remove a step' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add a step' })).toBeEnabled();

    rerender(<StepCountInput value={10} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Add a step' })).toBeDisabled();
  });
});
