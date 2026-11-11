import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './date-picker';

describe('shared DatePicker', () => {
  it('validates real dates and preserves the incomplete visible draft', () => {
    const change = vi.fn();
    render(<DatePicker label="Start" defaultValue="2026-11-11" onChange={change} />);
    const input = screen.getByRole('textbox', { name: 'Start' });
    fireEvent.change(input, { target: { value: '2025-02-29' } });
    expect(input).toHaveValue('2025-02-29');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(change).toHaveBeenLastCalledWith(null);
    fireEvent.change(input, { target: { value: '2024-02-29' } });
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(change).toHaveBeenLastCalledWith('2024-02-29');
  });

  it('submits local date-time values and resets to the original default', () => {
    const { container } = render(<form><DatePicker label="Start" name="start" includeTime defaultValue="2026-11-11T12:00" /></form>);
    const input = screen.getByRole('textbox', { name: 'Start' });
    fireEvent.change(input, { target: { value: '2026-11-12 18:35' } });
    const form = container.querySelector('form')!;
    expect(new FormData(form).get('start')).toBe('2026-11-12T18:35');
    fireEvent.reset(form);
    expect(input).toHaveValue('2026-11-11 12:00');
    expect(new FormData(form).get('start')).toBe('2026-11-11T12:00');
  });

  it('keeps disabled, required and range constraints on the actual input', () => {
    const { rerender } = render(<DatePicker label="Start" isRequired isDisabled />);
    expect(screen.getByRole('textbox', { name: 'Start' })).toBeRequired();
    expect(screen.getByRole('textbox', { name: 'Start' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Choose date' })).toBeDisabled();
    rerender(<DatePicker label="Start" minValue="2026-11-01" maxValue="2026-11-11" />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '2026-11-12' } });
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps Escape inside the calendar and reports its open state', () => {
    const outer = vi.fn(); const open = vi.fn();
    render(<div onKeyDown={outer}><DatePicker label="Start" defaultValue="2026-11-11" onOpenChange={open} locale="zh-CN" /></div>);
    fireEvent.click(screen.getByRole('button', { name: '选择日期' }));
    expect(open).toHaveBeenLastCalledWith(true);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(open).toHaveBeenLastCalledWith(false);
    expect(outer).not.toHaveBeenCalled();
  });

  it('allows editing an empty time draft without committing invalid hours', () => {
    const change = vi.fn();
    render(<DatePicker label="Start" includeTime defaultValue="2026-11-11T12:00" onChange={change} />);
    fireEvent.click(screen.getByRole('button', { name: 'Choose date' }));
    const hours = screen.getByRole('spinbutton', { name: 'Hours' });
    const minutes = screen.getByRole('spinbutton', { name: 'Minutes' });
    const done = screen.getByRole('button', { name: 'Done' });
    fireEvent.change(hours, { target: { value: '' } });
    expect(hours).toHaveValue(null);
    expect(done).toBeDisabled();
    fireEvent.change(hours, { target: { value: '25' } });
    expect(done).toBeDisabled();
    fireEvent.change(hours, { target: { value: '8' } });
    fireEvent.blur(hours);
    expect(hours).toHaveDisplayValue('08');
    fireEvent.change(minutes, { target: { value: '5' } });
    fireEvent.click(done);
    expect(change).toHaveBeenLastCalledWith('2026-11-11T08:05');
  });
});
