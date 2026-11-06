// Generated from packages/react/src/time-picker.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type DatePickerProps } from "./date-picker";
import * as A from 'react-aria-components';
import { time } from "./date-utils";
import { cx } from "./shared";
import s from "./time-picker.module.css";
import fieldStyles from "./field.module.css";
export function TimePicker({ label, value, defaultValue, onChange, className, ...props }: DatePickerProps) {
    return <A.TimeField {...props} value={value === undefined ? undefined : time(value)} defaultValue={time(defaultValue)} onChange={v => onChange?.(v?.toString() ?? null)} hourCycle={24} className={cx(fieldStyles.field, className)}>
    <A.Label className={fieldStyles.label}>{label}</A.Label><A.DateInput className={s.dateInput}>{segment => <A.DateSegment segment={segment} className={s.dateSegment}/>}</A.DateInput><A.FieldError className={fieldStyles.error}/>
  </A.TimeField>;
}
