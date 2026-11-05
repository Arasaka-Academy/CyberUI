'use client';
import { type DialogProps } from './dialog';
import { ModalSurface } from './modal-surface';
export function Drawer(props: DialogProps) { return <ModalSurface {...props} drawer/>; }
