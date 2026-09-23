import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App.jsx';

const stepGroups = () => screen.getAllByRole('group', { name: /^Step \d+$/ });
const source = () => screen.getByLabelText('Generated source');

describe('App', () => {
  it('starts with three steps and React selected', () => {
    render(<App />);
    expect(screen.getByLabelText('Number of steps')).toHaveValue(3);
    expect(stepGroups()).toHaveLength(3);
    expect(screen.getByRole('radio', { name: /^React/ })).toBeChecked();
  });

  it('changes the number of steps from the input and the buttons', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText('Number of steps');
    await user.clear(input);
    await user.type(input, '5');
    expect(stepGroups()).toHaveLength(5);

    await user.click(screen.getByRole('button', { name: 'Remove a step' }));
    expect(stepGroups()).toHaveLength(4);
    expect(input).toHaveValue(4);

    await user.click(screen.getByRole('button', { name: 'Add a step' }));
    expect(stepGroups()).toHaveLength(5);
  });

  it('generates React code on submit', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.queryByLabelText('Generated source')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Generate code' }));

    expect(screen.getByText('MultiStepForm.jsx')).toBeInTheDocument();
    expect(source()).toHaveTextContent("import { useState } from 'react'");
    expect(source()).toHaveTextContent('"title": "Your details"');
    expect(screen.getByRole('heading', { name: 'Generated code' })).toHaveFocus();
  });

  it.each([
    ['Next.js', 'app/components/MultiStepForm.jsx', "'use client'"],
    ['Svelte', 'MultiStepForm.svelte', '$state(0)'],
    ['Angular', 'multi-step-form.component.ts', '@Component'],
    ['Vue', 'MultiStepForm.vue', '<script setup>'],
  ])('generates %s code', async (name, filename, marker) => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('radio', { name: new RegExp(`^${name.replace('.', '\\.')}`) }));
    await user.click(screen.getByRole('button', { name: 'Generate code' }));

    expect(screen.getByText(filename)).toBeInTheDocument();
    expect(source()).toHaveTextContent(marker);
  });

  it('uses edited titles and fields in the output', async () => {
    const user = userEvent.setup();
    render(<App />);

    const title = screen.getByLabelText('Step 1 title');
    await user.clear(title);
    await user.type(title, 'Account');
    await user.click(screen.getByRole('button', { name: 'Add field to step 1' }));
    await user.type(screen.getByLabelText('Step 1, field 3 label'), 'Company size');
    await user.selectOptions(screen.getByLabelText('Step 1, field 3 type'), 'number');
    await user.click(screen.getByLabelText('Step 1, field 3 required'));
    await user.click(screen.getByRole('button', { name: 'Remove step 3, field 1' }));
    await user.click(screen.getByRole('button', { name: 'Add field to step 3' }));
    await user.type(screen.getByLabelText('Step 3, field 1 label'), 'Notes');
    await user.click(screen.getByRole('button', { name: 'Generate code' }));

    expect(source()).toHaveTextContent('"title": "Account"');
    expect(source()).toHaveTextContent(
      '"name": "companySize", "label": "Company size", "type": "number", "required": true',
    );
    expect(source()).toHaveTextContent('"name": "notes"');
    expect(source()).not.toHaveTextContent('"name": "message"');
  });

  it('blocks generation and explains problems until they are fixed', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText('Step 2 title'));
    await user.clear(screen.getByLabelText('Step 1, field 1 label'));
    await user.click(screen.getByRole('button', { name: 'Generate code' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Fix 2 problems above before generating.');
    expect(screen.getByText('Give step 2 a title.')).toBeInTheDocument();
    expect(screen.getByText('Give field 1 in step 1 a label.')).toBeInTheDocument();
    expect(screen.getByLabelText('Step 2 title')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByLabelText('Generated source')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Step 2 title'), 'Shipping');
    expect(screen.queryByText('Give step 2 a title.')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Fix 1 problem above');

    await user.type(screen.getByLabelText('Step 1, field 1 label'), 'Name');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Generate code' }));
    expect(source()).toHaveTextContent('"title": "Shipping"');
  });

  it('copies the generated code', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Generate code' }));
    await user.click(screen.getByRole('button', { name: 'Copy code' }));

    expect(await navigator.clipboard.readText()).toContain('export default function MultiStepForm');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('flags output as out of date after settings change', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Generate code' }));
    expect(screen.queryByText(/settings changed/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /^Vue/ }));
    expect(screen.getByText(/settings changed/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Generate code' }));
    expect(screen.queryByText(/settings changed/i)).not.toBeInTheDocument();
    expect(screen.getByText('MultiStepForm.vue')).toBeInTheDocument();
  });
});
