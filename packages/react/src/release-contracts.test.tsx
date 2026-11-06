import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, CommandPalette, CyberUIProvider, MultiSelect } from './index';
import { NavigationLinks } from './navigation-links';

describe('release integration contracts', () => {
  it('omits disabled multi-select values from native submission and restores them when enabled', () => {
    const control = (disabled: boolean) => <CyberUIProvider><form aria-label="Permissions"><MultiSelect label="Roles" name="roles" options={[{ id: 'admin', label: 'Admin' }, { id: 'reader', label: 'Reader' }]} defaultValue={['admin', 'reader']} isDisabled={disabled}/></form></CyberUIProvider>;
    const { rerender } = render(control(false));
    const values = () => new FormData(screen.getByRole('form') as HTMLFormElement).getAll('roles');
    expect(values()).toEqual(['admin', 'reader']);
    rerender(control(true));
    expect(values()).toEqual([]);
    expect(screen.getByRole('button', { name: 'Roles' })).toBeDisabled();
    rerender(control(false));
    expect(values()).toEqual(['admin', 'reader']);
  });

  it('leaves modified, non-primary and already prevented link activations to the browser', () => {
    const navigate = vi.fn();
    render(<NavigationLinks items={[{ id: 'archive', label: 'Archive', href: '#archive' }]} onNavigate={navigate}/>);
    const link = screen.getByRole('link', { name: 'Archive' });
    for (const init of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
      link.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    const prevented = new MouseEvent('click', { bubbles: true, cancelable: true });
    prevented.preventDefault();
    link.dispatchEvent(prevented);
    expect(navigate).not.toHaveBeenCalled();
    const primary = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(primary);
    expect(primary.defaultPrevented).toBe(true);
    expect(navigate).toHaveBeenCalledExactlyOnceWith({ id: 'archive', label: 'Archive', href: '#archive' });
  });

  it('runs commands from the focused search field using arrows and Enter and resets after closing', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const itemAction = vi.fn();
    render(<CyberUIProvider><CommandPalette trigger={<Button>Commands</Button>} items={[{ id: 'blocked', label: 'Read blocked', disabled: true }, { id: 'read', label: 'Read file', onAction: itemAction }, { id: 'settings', label: 'Settings' }]} onAction={action}/></CyberUIProvider>);
    await user.click(screen.getByRole('button', { name: 'Commands' }));
    const search = screen.getByRole('searchbox', { name: 'Search commands' });
    await waitFor(() => expect(search).toHaveFocus());
    await user.type(search, 'Read');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(action).toHaveBeenCalledExactlyOnceWith('read');
    expect(itemAction).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Commands' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    await user.type(screen.getByRole('searchbox'), 'missing');
    expect(screen.getByText('No commands found')).toBeVisible();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(action).toHaveBeenCalledOnce();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Commands' })).toHaveFocus());
  });
});
