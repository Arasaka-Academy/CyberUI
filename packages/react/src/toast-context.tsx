'use client';
import { type ToastProps } from './toast';
import { createContext } from 'react';
export interface ToastEntry extends ToastProps {
    entryKey: number;
}
export const ToastContext = createContext<(message: string, action?: ToastProps['action']) => void>(() => { });
