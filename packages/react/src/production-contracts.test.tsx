import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AlertDialog, Button, Calendar, CommandPalette, CyberUIProvider, FileUpload, Input, MultiSelect, PasswordInput, SegmentedControl, Select, Tabs, TimePicker, Toast, VirtualKeyboard } from './index';

afterEach(() => vi.useRealTimers());

describe('production consumer contracts', () => {
  const options = [{ id: 'reader', label: 'Reader' }, { id: 'admin', label: 'Admin', disabled: true }];

  it('keeps disabled select options unavailable to pointer and keyboard selection', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<CyberUIProvider><form aria-label="Settings"><Select label="Role" name="role" defaultValue="reader" options={options} onChange={change}/></form></CyberUIProvider>);
    await user.click(screen.getByRole('button', { name: /Role/ }));
    expect(screen.getByRole('option', { name: 'Admin' })).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('option', { name: 'Admin' }));
    expect(change).not.toHaveBeenCalled();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('role')).toBe('reader');
  });

  it('restores an uncontrolled multi-select to its default values when its form resets', async () => {
    const user = userEvent.setup();
    render(<CyberUIProvider><form aria-label="Permissions"><MultiSelect label="Roles" name="roles" defaultValue={['reader']} options={options}/><button type="reset">Reset</button></form></CyberUIProvider>);
    await user.click(screen.getByRole('button', { name: 'Remove Reader' }));
    const values = () => new FormData(screen.getByRole('form') as HTMLFormElement).getAll('roles');
    expect(values()).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(values()).toEqual(['reader']));
    expect(screen.getByRole('button', { name: 'Remove Reader' })).toBeVisible();
  });

  it('clears uncontrolled upload selection and validation feedback on form reset', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<CyberUIProvider><form><FileUpload label="Document" accept=".txt"/><button type="reset">Reset</button></form></CyberUIProvider>);
    const input = screen.getByLabelText('Document');
    await user.upload(input, new File(['text'], 'notes.txt', { type: 'text/plain' }));
    await user.upload(input, new File(['bad'], 'notes.exe', { type: 'application/octet-stream' }));
    expect(screen.getByRole('alert')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(screen.queryByText(/notes.txt ·/)).not.toBeInTheDocument());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('honors a canceled form reset and preserves controlled multi-select values', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const control = (cancel: boolean) => <CyberUIProvider><form aria-label="Permissions" onReset={event => { if (cancel) event.preventDefault(); }}><MultiSelect label="Roles" name="roles" defaultValue={['reader']} options={options}/><MultiSelect label="Fixed roles" name="fixed" value={['reader']} onChange={change} options={options}/><button type="reset">Reset</button></form></CyberUIProvider>;
    const { rerender } = render(control(true));
    await user.click(screen.getAllByRole('button', { name: 'Remove Reader' })[0]);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    const values = (name: string) => new FormData(screen.getByRole('form') as HTMLFormElement).getAll(name);
    expect(values('roles')).toEqual([]);
    expect(values('fixed')).toEqual(['reader']);
    rerender(control(false));
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(values('roles')).toEqual(['reader']));
    expect(values('fixed')).toEqual(['reader']);
    expect(change).not.toHaveBeenCalled();
  });

  it('keeps a canceled upload reset from clearing its selection', async () => {
    const user = userEvent.setup();
    render(<CyberUIProvider><form onReset={event => event.preventDefault()}><FileUpload label="Document"/><button type="reset">Reset</button></form></CyberUIProvider>);
    await user.upload(screen.getByLabelText('Document'), new File(['text'], 'notes.txt', { type: 'text/plain' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByText(/notes.txt ·/)).toBeVisible();
  });

  it('resets an externally associated upload only when its current form owner resets', async () => {
    const user = userEvent.setup();
    const control = (owner: string) => <CyberUIProvider><form id="first"><button type="reset">Reset first</button></form><form id="second"><button type="reset">Reset second</button></form><FileUpload label="Document" form={owner}/></CyberUIProvider>;
    const { rerender } = render(control('first'));
    await user.upload(screen.getByLabelText('Document'), new File(['text'], 'notes.txt', { type: 'text/plain' }));
    rerender(control('second'));
    await user.click(screen.getByRole('button', { name: 'Reset first' }));
    expect(screen.getByText(/notes.txt ·/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Reset second' }));
    await waitFor(() => expect(screen.queryByText(/notes.txt ·/)).not.toBeInTheDocument());
  });

  it('starts with an empty query after a controlled command palette is closed externally', async () => {
    const user = userEvent.setup();
    const control = (open: boolean) => <CyberUIProvider><CommandPalette isOpen={open} items={[{ id: 'read', label: 'Read file' }]}/></CyberUIProvider>;
    const { rerender } = render(control(true));
    await user.type(await screen.findByRole('searchbox'), 'missing');
    rerender(control(false));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    rerender(control(true));
    expect(await screen.findByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Read file' })).toBeVisible();
  });

  it('does not close a newly opened confirmation when an earlier dismissed operation finishes', async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    const operation = new Promise<void>(resolve => { finish = resolve; });
    render(<CyberUIProvider><AlertDialog title="Delete archive" trigger={<Button>Open confirmation</Button>} confirmLabel="Delete" onConfirm={() => operation}>Delete these records?</AlertDialog></CyberUIProvider>);
    await user.click(screen.getByRole('button', { name: 'Open confirmation' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Open confirmation' }));
    await act(async () => { finish(); await operation; });
    expect(screen.getByRole('alertdialog', { name: 'Delete archive' })).toBeVisible();
  });

  it('lets a failed confirmation retry and closes after the current operation succeeds', async () => {
    const user = userEvent.setup();
    const confirm = vi.fn().mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValueOnce(undefined);
    render(<CyberUIProvider><AlertDialog title="Delete archive" trigger={<Button>Open confirmation</Button>} confirmLabel="Delete" onConfirm={confirm}>Delete these records?</AlertDialog></CyberUIProvider>);
    await user.click(screen.getByRole('button', { name: 'Open confirmation' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The action failed');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it('keeps a toast paused while it is hovered after keyboard focus leaves it', async () => {
    vi.useFakeTimers();
    const dismiss = vi.fn();
    render(<CyberUIProvider><Toast message="Saved" duration={1000} onDismiss={dismiss} action={{ label: 'Undo', onAction: vi.fn() }}/><button>Outside</button></CyberUIProvider>);
    fireEvent.pointerEnter(screen.getByRole('status'));
    fireEvent.focus(screen.getByRole('button', { name: 'Undo' }));
    fireEvent.blur(screen.getByRole('button', { name: 'Undo' }), { relatedTarget: screen.getByRole('button', { name: 'Outside' }) });
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(dismiss).not.toHaveBeenCalled();
    fireEvent.pointerLeave(screen.getByRole('status'));
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('does not restart a toast lifetime when its dismissal callback changes', async () => {
    vi.useFakeTimers();
    const first = vi.fn();
    const latest = vi.fn();
    const control = (onDismiss: () => void) => <CyberUIProvider><Toast message="Saved" duration={1000} onDismiss={onDismiss}/></CyberUIProvider>;
    const { rerender } = render(control(first));
    await act(() => vi.advanceTimersByTimeAsync(500));
    rerender(control(latest));
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledOnce();
  });

  it('keeps a toast paused while focused after the pointer leaves it', async () => {
    vi.useFakeTimers();
    const dismiss = vi.fn();
    render(<CyberUIProvider><Toast message="Saved" duration={1000} onDismiss={dismiss} action={{ label: 'Undo', onAction: vi.fn() }}/></CyberUIProvider>);
    fireEvent.focus(screen.getByRole('button', { name: 'Undo' }));
    fireEvent.pointerEnter(screen.getByRole('status'));
    fireEvent.pointerLeave(screen.getByRole('status'));
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('selects the first enabled tab when the first item is disabled', () => {
    render(<CyberUIProvider><Tabs items={[{ id: 'blocked', label: 'Blocked', disabled: true, content: 'Blocked content' }, { id: 'ready', label: 'Ready', content: 'Ready content' }]}/></CyberUIProvider>);
    expect(screen.getByRole('tab', { name: 'Ready' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Ready content');
  });

  it('selects the first enabled segment when the first option is disabled', () => {
    render(<CyberUIProvider><SegmentedControl label="Mode" options={[{ id: 'blocked', label: 'Blocked', disabled: true }, { id: 'ready', label: 'Ready' }]}/></CyberUIProvider>);
    expect(screen.getByRole('radio', { name: 'Ready' })).toBeChecked();
  });

  it('keeps helper and error descriptions available when an input uses an external label', () => {
    render(<CyberUIProvider><Input aria-label="Handle" description="Public handle" error="Handle is required"/></CyberUIProvider>);
    expect(screen.getByRole('textbox', { name: 'Handle' })).toHaveAccessibleDescription('Public handle Handle is required');
    expect(screen.getByRole('alert')).toBeVisible();
  });

  it('associates multi-select helper and consumer descriptions with its interactive trigger', () => {
    render(<CyberUIProvider><p id="roles-extra">Optional permissions</p><MultiSelect label="Roles" options={options} description="Choose one or more roles" aria-describedby="roles-extra"/></CyberUIProvider>);
    expect(screen.getByRole('button', { name: 'Roles' })).toHaveAccessibleDescription('Choose one or more roles Optional permissions');
  });

  it('applies password wrapperClassName to its wrapper without leaking it to the input', () => {
    render(<CyberUIProvider><PasswordInput label="Password" wrapperClassName="settings-field"/></CyberUIProvider>);
    expect(screen.getByLabelText('Password').closest('.settings-field')).not.toBeNull();
    expect(screen.getByLabelText('Password')).not.toHaveAttribute('wrapperClassName');
  });

  it('preserves consumer-provided invalid state on file upload controls', () => {
    render(<CyberUIProvider><FileUpload label="Document" aria-invalid="true"/></CyberUIProvider>);
    expect(screen.getByLabelText('Document')).toHaveAttribute('aria-invalid', 'true');
  });

  it.each(['👩🏽‍💻', '🇨🇳', 'e\u0301'])('removes the whole final grapheme %s from the virtual keyboard', async character => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<CyberUIProvider><VirtualKeyboard defaultValue={`Name ${character}`} onChange={change}/></CyberUIProvider>);
    await user.click(screen.getByRole('button', { name: 'Backspace' }));
    expect(change).toHaveBeenCalledWith('Name ');
  });

  it('does not submit a demonstration time when no initial time is provided', () => {
    render(<CyberUIProvider><form aria-label="Appointment"><TimePicker label="Time" name="time"/></form></CyberUIProvider>);
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('time')).toBe('');
  });

  it('opens an uninitialized calendar at the current month without selecting a demonstration date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-05-15T12:00:00Z'));
    render(<CyberUIProvider><Calendar label="Date"/></CyberUIProvider>);
    expect(screen.getByRole('heading')).toHaveTextContent('May 2030');
    expect(screen.getByRole('grid')).not.toContainHTML('aria-selected="true"');
  });
});
