// Generated from packages/react/src/toast.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type DOMProps, cx } from "./shared";
import { useState, useRef, useEffect } from 'react';
import { useCyberUI } from "./provider";
import s from "./toast.module.css";
import { Icon } from "./icon";
import { Button } from "./button";
import { IconButton } from "./icon-button";
export interface ToastProps extends DOMProps {
    message: string;
    onDismiss?: () => void;
    duration?: number;
    action?: {
        label: string;
        onAction: () => void;
    };
    tone?: 'default' | 'success' | 'danger';
}
export function Toast({ message, onDismiss, duration = 5000, action, tone = 'default', className, ...props }: ToastProps) {
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const paused = hovered || focused;
    const dismissible = onDismiss !== undefined;
    const dismiss = useRef(onDismiss);
    const { t } = useCyberUI();
    useEffect(() => { dismiss.current = onDismiss; }, [onDismiss]);
    useEffect(() => { if (paused || !duration || !dismissible)
        return; const timer = setTimeout(() => dismiss.current?.(), duration); return () => clearTimeout(timer); }, [paused, duration, dismissible]);
    return <div {...props} className={cx(s.toast, className)} role="status" aria-live="polite" onPointerEnter={e => { setHovered(true); props.onPointerEnter?.(e); }} onPointerLeave={e => { setHovered(false); props.onPointerLeave?.(e); }} onFocusCapture={e => { setFocused(true); props.onFocusCapture?.(e); }} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node))
        setFocused(false); props.onBlurCapture?.(e); }}>
    <Icon name={tone === 'danger' ? 'warning' : 'check'}/><span style={{ fontSize: 14, flex: 1 }}>{message}</span>{action && <Button size="sm" variant="ghost" onPress={() => { action.onAction(); onDismiss?.(); }}>{action.label}</Button>}
    {onDismiss && <IconButton icon="close" size="sm" variant="ghost" aria-label={t('Dismiss notification', '关闭通知')} onPress={onDismiss}/>}
  </div>;
}
