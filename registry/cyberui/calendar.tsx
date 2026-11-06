// Generated from packages/react/src/calendar.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type DatePickerProps } from "./date-picker";
import * as A from 'react-aria-components';
import { date } from "./date-utils";
import { cx } from "./shared";
import s from "./calendar.module.css";
import { CalendarBody } from "./calendar-body";
export function Calendar({ label, value, defaultValue, onChange, isDisabled, className, ...props }: DatePickerProps) {
    return <A.Calendar {...props} aria-label={label} value={value === undefined ? undefined : date(value)} defaultValue={date(defaultValue) ?? undefined} onChange={v => onChange?.(v.toString())} isDisabled={isDisabled} className={cx(s.calendar, className)}><CalendarBody /></A.Calendar>;
}
