'use client';
import { type ReactNode, useState, useRef, useCallback, useContext } from 'react';
import { type ToastEntry, ToastContext } from './toast-context';
import { useCyberUI } from './provider';
import { type ToastProps, Toast } from './toast';
import s from './toast-provider.module.css';
export function ToastProvider({ children }: {
    children: ReactNode;
}) {
    const [entries, setEntries] = useState<ToastEntry[]>([]);
    const next = useRef(0);
    const { t } = useCyberUI();
    const notify = useCallback((message: string, action?: ToastProps['action']) => setEntries(previous => [...previous.slice(-3), { entryKey: ++next.current, message, action }]), []);
    const remove = useCallback((id: number) => setEntries(previous => previous.filter(item => item.entryKey !== id)), []);
    return <ToastContext.Provider value={notify}>{children}<div role="region" aria-label={t('Notifications', '通知')} className={s.toastRegion}>{entries.map(({ entryKey, ...item }) => <Toast key={entryKey} {...item} onDismiss={() => remove(entryKey)}/>)}</div></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
