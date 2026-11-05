// Generated from packages/react/src/navigation-types.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type DOMProps } from "./shared";
export interface NavItem {
    id: string;
    label: string;
    href: string;
    icon?: string;
}
export interface NavigationProps extends DOMProps<HTMLElement> {
    items: NavItem[];
    activeId?: string;
    label?: string;
    onNavigate?: (item: NavItem) => void;
}
