'use client';
import { type DOMProps } from './shared';
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
