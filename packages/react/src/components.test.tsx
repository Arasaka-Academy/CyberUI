import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, Checkbox, CyberUIProvider, DataTable, Dialog, Input, MultiSelect, NumberInput, Switch } from './index';

describe('public components', () => {
  it('forwards native input refs, names, and change events', async () => {
    const user = userEvent.setup(); const change = vi.fn(); const ref = { current: null as HTMLInputElement | null };
    render(<CyberUIProvider><Input label="Handle" name="handle" ref={ref} onChange={change} /></CyberUIProvider>);
    await user.type(screen.getByRole('textbox', { name: 'Handle' }), 'NOVA_8');
    expect(ref.current?.value).toBe('NOVA_8'); expect(ref.current?.name).toBe('handle'); expect(change).toHaveBeenCalled();
  });
  it('supports keyboard activation and a controlled checkbox without hidden local state', async () => {
    const user = userEvent.setup(); const changed = vi.fn();
    const { rerender } = render(<CyberUIProvider><Checkbox label="Telemetry" isSelected={false} onChange={changed} /></CyberUIProvider>);
    await user.tab(); await user.keyboard(' ');
    expect(changed).toHaveBeenCalledWith(true); expect(screen.getByRole('checkbox')).not.toBeChecked();
    rerender(<CyberUIProvider><Checkbox label="Telemetry" isSelected onChange={changed} /></CyberUIProvider>);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
  it('keeps an uncontrolled switch state and associates its label', async () => {
    const user = userEvent.setup();
    render(<CyberUIProvider><Switch label="Night mode" defaultSelected /></CyberUIProvider>);
    expect(screen.getByRole('switch', { name: 'Night mode' })).toBeChecked();
    await user.click(screen.getByRole('switch')); expect(screen.getByRole('switch')).not.toBeChecked();
  });
  it('bounds a number stepper and disables a repeated decrement at the minimum', async () => {
    const user = userEvent.setup();
    render(<CyberUIProvider><NumberInput label="Copies" minValue={1} maxValue={3} defaultValue={1} /></CyberUIProvider>);
    expect(screen.getByRole('button', { name: /decrease/i })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /increase/i }));
    expect(screen.getByRole('textbox', { name: 'Copies' })).toHaveValue('2');
  });
  it('keeps a pending button disabled with an accessible busy state', () => {
    render(<CyberUIProvider><Button isPending>Save changes</Button></CyberUIProvider>);
    const button = screen.getByRole('button', { name: /save changes/i });
    expect(button).toBeDisabled(); expect(button).toHaveAttribute('aria-busy', 'true');
  });
  it('closes a dialog with Escape and restores focus to its trigger', async () => {
    const user = userEvent.setup();
    render(<CyberUIProvider><Dialog trigger={<Button>Open settings</Button>} title="Settings"><Input label="Name" /></Dialog></CyberUIProvider>);
    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    expect(await screen.findByRole('dialog', { name: 'Settings' })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(()=>expect(screen.getByRole('button', { name: 'Open settings' })).toHaveFocus());
  });
  it('filters and sorts a data table and keeps filtered pagination valid', async () => {
    const user = userEvent.setup();
    render(<CyberUIProvider><DataTable label="Archive" pageSize={2} rows={[{ id: '1', name: 'Zebra' }, { id: '2', name: 'Alpha' }, { id: '3', name: 'Beta' }]} columns={[{ key: 'name', label: 'Name' }]} /></CyberUIProvider>);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.type(screen.getByRole('searchbox', { name: /search/i }), 'Alpha');
    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeVisible();
    expect(screen.queryByRole('cell', { name: 'Zebra' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });
  it('exposes multi-selection values and lets users remove individual values', async () => {
    const user = userEvent.setup();
    render(<CyberUIProvider><MultiSelect label="Collections" options={[{ id: 'a', label: 'Classics' }, { id: 'b', label: 'Favorites' }]} defaultValue={['a']} /></CyberUIProvider>);
    expect(screen.getByText('Classics')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Remove Classics' }));
    expect(screen.queryByRole('button', { name: 'Remove Classics' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /collections/i }));
    const list = screen.getByRole('listbox');
    await user.click(within(list).getByText('Favorites'));
    expect(within(list).getByRole('option',{name:'Favorites'})).toHaveAttribute('aria-selected','true');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Remove Favorites' })).toBeVisible();
  });
});
