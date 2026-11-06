'use client';
import { type DialogProps } from './dialog';
import { type ReactNode } from 'react';
import { ModalSurface } from './modal-surface';
import { Confirmation } from './confirmation';
import { useControllableState } from './shared';
export interface AlertDialogProps extends Omit<DialogProps, 'children' | 'role'> {
    children?: ReactNode;
    confirmLabel?: string;
    onConfirm?: () => void | Promise<void>;
}
export function AlertDialog({ children, confirmLabel, onConfirm, isOpen, defaultOpen = false, onOpenChange, ...props }: AlertDialogProps) {
    const [open, setOpen] = useControllableState(isOpen, defaultOpen, onOpenChange);
    return <ModalSurface {...props} isOpen={open} onOpenChange={setOpen} role="alertdialog">{close => <Confirmation close={close} isOpen={open} confirmLabel={confirmLabel} onConfirm={onConfirm}>{children}</Confirmation>}</ModalSurface>;
}
