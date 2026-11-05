// Generated from packages/react/src/toast-context.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type ToastProps } from "./toast";
import { createContext } from 'react';
export interface ToastEntry extends ToastProps {
    entryKey: number;
}
export const ToastContext = createContext<(message: string, action?: ToastProps['action']) => void>(() => { });
