'use client';
import { type DOMProps, cx } from './shared';
import * as A from 'react-aria-components';
import { date } from './date-utils';
import s from './date-picker.module.css';
import { Button } from './button';
import { CalendarBody } from './calendar-body';
import { type InputHTMLAttributes } from 'react';
export interface DatePickerProps extends DOMProps {
    label: string;
    value?: string | null;
    defaultValue?: string;
    onChange?: (date: string | null) => void;
    isDisabled?: boolean;
    isRequired?: boolean;
    name?: string;
}
export function DatePicker({ label, value, defaultValue, onChange, className, ...props }: DatePickerProps) {
    return <A.DatePicker {...props} value={value === undefined ? undefined : date(value)} defaultValue={date(defaultValue)} onChange={v => onChange?.(v?.toString() ?? null)} className={cx(s.field, className)}>
    <A.Label className={s.label}>{label}</A.Label><A.Group className={s.inputRow}><A.DateInput className={s.dateInput}>{segment => <A.DateSegment segment={segment} className={s.dateSegment}/>}</A.DateInput><Button icon="calendar" aria-label={label}/></A.Group>
    <A.Popover className={s.popover}><A.Dialog aria-label={label}><A.Calendar className={s.calendar}><CalendarBody /></A.Calendar></A.Dialog></A.Popover><A.FieldError className={s.error}/>
  </A.DatePicker>;
}
export type NativeDateInputProps = InputHTMLAttributes<HTMLInputElement>;
