// Generated from packages/react/src/alert-dialog.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type DialogProps } from "./dialog";
import { type ReactNode } from 'react';
import { ModalSurface } from "./modal-surface";
import { Confirmation } from "./confirmation";
export interface AlertDialogProps extends Omit<DialogProps, 'children' | 'role'> {
    children?: ReactNode;
    confirmLabel?: string;
    onConfirm?: () => void | Promise<void>;
}
export function AlertDialog({ children, confirmLabel, onConfirm, ...props }: AlertDialogProps) {
    return <ModalSurface {...props} role="alertdialog">{close => <Confirmation close={close} confirmLabel={confirmLabel} onConfirm={onConfirm}>{children}</Confirmation>}</ModalSurface>;
}
