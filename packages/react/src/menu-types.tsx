'use client';
export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    danger?: boolean;
    onAction?: () => void;
}
