// Generated from packages/react/src/radio-group.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import * as A from 'react-aria-components';
import { type Option } from "./option";
import { type Ref } from 'react';
import { cx } from "./shared";
import s from "./radio-group.module.css";
import fieldStyles from "./field.module.css";
export interface RadioGroupProps extends Omit<A.RadioGroupProps, 'children' | 'className'> {
    label: string;
    options: Option[];
    className?: string;
    ref?: Ref<HTMLDivElement>;
}
export function RadioGroup({ label, options, className, ...props }: RadioGroupProps) {
    return <A.RadioGroup {...props} className={cx(fieldStyles.field, className)}><A.Label className={fieldStyles.label}>{label}</A.Label>
    {options.map(o => <A.Radio key={o.id} value={o.id} isDisabled={o.disabled} className={cx(s.choice, s.radio)}><span aria-hidden className={s.checkBox}/>{o.label}</A.Radio>)}<A.FieldError className={fieldStyles.error}/>
  </A.RadioGroup>;
}
