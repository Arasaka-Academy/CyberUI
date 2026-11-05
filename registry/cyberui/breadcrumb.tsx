// Generated from packages/react/src/breadcrumb.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type DOMProps } from "./shared";
import { type NavItem } from "./navigation-types";
import s from "./breadcrumb.module.css";
export interface BreadcrumbProps extends DOMProps<HTMLElement> {
    items: Omit<NavItem, 'id'>[];
    label?: string;
}
export function Breadcrumb({ items, label = 'Breadcrumb', ...props }: BreadcrumbProps) {
    return <nav {...props} aria-label={label}><ol className={s.breadcrumb}>{items.map((item, index) => <li key={`${item.href}-${index}`}>{index > 0 && <span aria-hidden>/</span>}{index === items.length - 1 ? <span aria-current="page">{item.label}</span> : <a href={item.href}>{item.label}</a>}</li>)}</ol></nav>;
}
