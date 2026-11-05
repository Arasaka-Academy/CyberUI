// Generated from packages/react/src/popover.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type DOMProps, cx } from "./shared";
import { type ReactElement, type ReactNode } from 'react';
import * as A from 'react-aria-components';
import s from "./popover.module.css";
export interface PopoverProps extends Omit<DOMProps, 'role'> {
    trigger: ReactElement;
    title: string;
    children: ReactNode;
    placement?: A.Placement;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}
export function Popover({ trigger, title, children, placement = 'bottom', isOpen, defaultOpen, onOpenChange, className, ...props }: PopoverProps) {
    return <A.DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>{trigger}<A.Popover className={cx(s.popover, className)} placement={placement}><A.Dialog {...props} aria-label={title} style={{ padding: 14, outline: 0, ...props.style }}>{children}</A.Dialog></A.Popover></A.DialogTrigger>;
}
