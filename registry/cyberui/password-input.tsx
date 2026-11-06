// Generated from packages/react/src/password-input.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { forwardRef, useState, useId } from 'react';
import { type InputProps } from "./input";
import { useCyberUI } from "./provider";

import { cx } from "./shared";
import { IconButton } from "./icon-button";
import fieldStyles from "./field.module.css";
import inputStyles from "./input.module.css";
export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput({ label = 'Password', description, error, id, className, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const generated = useId();
    const fieldId = id ?? generated;
    const { t } = useCyberUI();
    return <div className={fieldStyles.field}><label className={fieldStyles.label} htmlFor={fieldId}>{label}</label>
    <div className={fieldStyles.inputRow}><input {...props} ref={ref} id={fieldId} className={cx(inputStyles.input, className)} type={visible ? 'text' : 'password'} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={[props['aria-describedby'], description ? `${fieldId}-help` : null, error ? `${fieldId}-error` : null].filter(Boolean).join(' ') || undefined}/>
      <IconButton icon="eye" isDisabled={props.disabled} aria-label={visible ? t('Hide password', '隐藏密码') : t('Show password', '显示密码')} aria-pressed={visible} onPress={() => setVisible(!visible)}/>
    </div>{description && <span id={`${fieldId}-help`} className={fieldStyles.helper}>{description}</span>}{error && <span role="alert" id={`${fieldId}-error`} className={fieldStyles.error}>{error}</span>}
  </div>;
});
