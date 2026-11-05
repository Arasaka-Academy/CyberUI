// Generated from packages/react/src/tooltip.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type DOMProps, cx } from "./shared";
import { type ReactElement } from 'react';
import * as A from 'react-aria-components';
import s from "./tooltip.module.css";
export interface TooltipProps extends DOMProps {
    children: ReactElement;
    content: string;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}
export function Tooltip({ children, content, isOpen, defaultOpen, onOpenChange, className, ...props }: TooltipProps) {
    return <A.TooltipTrigger delay={300} isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>{children}<A.Tooltip {...props} className={cx(s.tooltip, className)}>{content}</A.Tooltip></A.TooltipTrigger>;
}
