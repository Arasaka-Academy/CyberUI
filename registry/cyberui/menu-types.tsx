// Generated from packages/react/src/menu-types.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    danger?: boolean;
    onAction?: () => void;
}
