// Generated from packages/react/src/confirmation.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type AlertDialogProps } from "./alert-dialog";
import { useState } from 'react';
import { useCyberUI } from "./provider";
import s from "./confirmation.module.css";
import { Button } from "./button";
import fieldStyles from "./field.module.css";
export function Confirmation({ close, children, confirmLabel, onConfirm }: Pick<AlertDialogProps, 'children' | 'confirmLabel' | 'onConfirm'> & {
    close: () => void;
}) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const { t } = useCyberUI();
    return <><div style={{ color: 'var(--cyber-muted)', marginBottom: 24 }}>{children}</div>{error && <p role="alert" className={fieldStyles.error}>{error}</p>}<div className={s.buttonGroup}>
    <Button onPress={close}>{t('Cancel', '取消')}</Button><Button variant="danger" isPending={pending} onPress={async () => { setPending(true); try {
        await onConfirm?.();
        close();
    }
    catch {
        setError(t('The action failed. Please try again.', '操作失败，请重试。'));
    }
    finally {
        setPending(false);
    } }}>{confirmLabel ?? t('Confirm', '确认')}</Button>
  </div></>;
}
