'use client';
import { type DOMProps, useControllableState, cx } from './shared';
import { type Ref, useId, useState } from 'react';
import s from './color-picker.module.css';
import { Input } from './input';
export interface ColorPickerProps extends DOMProps {
    label: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    isDisabled?: boolean;
    inputRef?: Ref<HTMLInputElement>;
}
export function ColorPicker({ label, value, defaultValue = '#E0574B', onChange, isDisabled, className, inputRef, ...props }: ColorPickerProps) {
    const [color, setColor] = useControllableState(value, defaultValue, onChange);
    const id = useId();
    const [draft, setDraft] = useState<string>();
    const valid = draft === undefined || /^#[0-9a-f]{6}$/i.test(draft);
    return <div {...props} className={cx(s.field, className)}><label htmlFor={id} className={s.label}>{label}</label><div className={s.inputRow}>
    <input id={id} type="color" className={s.colorSwatch} value={color} disabled={isDisabled} onChange={e => { setColor(e.target.value); setDraft(undefined); }}/>
    <Input ref={inputRef} aria-label={`${label} HEX`} value={draft ?? color} disabled={isDisabled} aria-invalid={!valid} onChange={e => { setDraft(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value))
        setColor(e.target.value); }} onBlur={() => setDraft(undefined)}/>
  </div>{!valid && <span role="alert" className={s.error}>HEX: #RRGGBB</span>}</div>;
}
