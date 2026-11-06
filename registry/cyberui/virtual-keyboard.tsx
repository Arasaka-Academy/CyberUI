// Generated from packages/react/src/virtual-keyboard.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type DOMProps, useControllableState, cx } from "./shared";
import { useCyberUI } from "./provider";
import s from "./virtual-keyboard.module.css";
import { Button } from "./button";
export interface VirtualKeyboardProps extends DOMProps {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onSubmit?: () => void;
    layout?: 'alpha' | 'numeric';
    isDisabled?: boolean;
    className?: string;
}
export function VirtualKeyboard({ value, defaultValue = '', onChange, onSubmit, layout = 'alpha', isDisabled, className, ...props }: VirtualKeyboardProps) {
    const [text, setText] = useControllableState(value, defaultValue, onChange);
    const { t, locale } = useCyberUI();
    const backspace = () => {
        const last = Array.from(new Intl.Segmenter(locale, { granularity: 'grapheme' }).segment(text)).at(-1);
        setText(text.slice(0, last?.index ?? 0));
    };
    const rows = layout === 'numeric' ? ['123', '456', '789', '0'] : ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    return <div {...props} role="group" aria-label={t('Virtual keyboard', '虚拟键盘')} aria-disabled={isDisabled || undefined} className={cx(s.keyboard, className)}>{rows.map(row => <div key={row}>{row.split('').map(key => <Button corners="none" key={key} size="sm" isDisabled={isDisabled} onPress={() => setText(text + key)}>{key}</Button>)}</div>)}<div><Button size="sm" isDisabled={isDisabled} onPress={() => setText(text + ' ')}>{t('Space', '空格')}</Button><Button size="sm" isDisabled={isDisabled} icon="backspace" aria-label={t('Backspace', '退格')} onPress={backspace}/>{onSubmit && <Button size="sm" variant="primary" isDisabled={isDisabled} onPress={onSubmit}>{t('Enter', '确认')}</Button>}</div></div>;
}
