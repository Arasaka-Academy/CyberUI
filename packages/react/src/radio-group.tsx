'use client';
import * as A from 'react-aria-components';
import { type Option } from './option';
import { type Ref } from 'react';
import { cx } from './shared';
import s from './radio-group.module.css';
export interface RadioGroupProps extends Omit<A.RadioGroupProps, 'children' | 'className'> {
    label: string;
    options: Option[];
    className?: string;
    ref?: Ref<HTMLDivElement>;
}
export function RadioGroup({ label, options, className, ...props }: RadioGroupProps) {
    return <A.RadioGroup {...props} className={cx(s.field, className)}><A.Label className={s.label}>{label}</A.Label>
    {options.map(o => <A.Radio key={o.id} value={o.id} isDisabled={o.disabled} className={cx(s.choice, s.radio)}><span aria-hidden className={s.checkBox}/>{o.label}</A.Radio>)}<A.FieldError className={s.error}/>
  </A.RadioGroup>;
}
