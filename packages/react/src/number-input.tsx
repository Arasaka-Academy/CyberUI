'use client';
import * as A from 'react-aria-components';
import { type Ref } from 'react';
import { useCyberUI } from './provider';
import { cx } from './shared';
import s from './number-input.module.css';
import { Button } from './button';
export interface NumberInputProps extends Omit<A.NumberFieldProps, 'children' | 'className'> {
    label: string;
    description?: string;
    className?: string;
    ref?: Ref<HTMLDivElement>;
    inputRef?: Ref<HTMLInputElement>;
}
export function NumberInput({ label, description, className, inputRef, ...props }: NumberInputProps) {
    const { t } = useCyberUI();
    return <A.NumberField {...props} className={cx(s.field, className)}>
    <A.Label className={s.label}>{label}</A.Label>
    <A.Group className={s.inputRow}>
      <Button slot="decrement" aria-label={t('Decrease', '减少')} corners="none">−</Button>
      <A.Input ref={inputRef} className={s.input}/>
      <Button slot="increment" aria-label={t('Increase', '增加')} corners="none">+</Button>
    </A.Group>
    {description && <A.Text slot="description" className={s.helper}>{description}</A.Text>}
    <A.FieldError className={s.error}/>
  </A.NumberField>;
}
