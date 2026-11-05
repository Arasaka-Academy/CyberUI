'use client';
import * as A from 'react-aria-components';
import { forwardRef } from 'react';
import { cx } from './shared';
import s from './checkbox.module.css';
import { Icon } from './icon';
export interface CheckboxProps extends Omit<A.CheckboxProps, 'children' | 'className'> {
    label: string;
    className?: string;
}
export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(function Checkbox({ label, className, ...props }, ref) {
    return <A.Checkbox {...props} ref={ref} className={cx(s.choice, className)}><span aria-hidden className={s.checkBox}><Icon name="check" size={14}/></span><span>{label}</span></A.Checkbox>;
});
