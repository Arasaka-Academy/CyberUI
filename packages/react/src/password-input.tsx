'use client';
import { forwardRef, useState, useId } from 'react';
import { type InputProps } from './input';
import { useCyberUI } from './provider';
import s from './password-input.module.css';
import { cx } from './shared';
import { IconButton } from './icon-button';
export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput({ label = 'Password', description, error, id, className, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const generated = useId();
    const fieldId = id ?? generated;
    const { t } = useCyberUI();
    return <div className={s.field}><label className={s.label} htmlFor={fieldId}>{label}</label>
    <div className={s.inputRow}><input {...props} ref={ref} id={fieldId} className={cx(s.input, className)} type={visible ? 'text' : 'password'} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={[props['aria-describedby'], description ? `${fieldId}-help` : null, error ? `${fieldId}-error` : null].filter(Boolean).join(' ') || undefined}/>
      <IconButton icon="eye" isDisabled={props.disabled} aria-label={visible ? t('Hide password', '隐藏密码') : t('Show password', '显示密码')} aria-pressed={visible} onPress={() => setVisible(!visible)}/>
    </div>{description && <span id={`${fieldId}-help`} className={s.helper}>{description}</span>}{error && <span role="alert" id={`${fieldId}-error`} className={s.error}>{error}</span>}
  </div>;
});
