// Generated from packages/react/src/sidebar.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type NavigationProps } from "./navigation-types";
import { cx } from "./shared";
import s from "./sidebar.module.css";
import { NavigationLinks } from "./navigation-links";
export function Sidebar({ className, label = 'Navigation', items, activeId, onNavigate, ...props }: NavigationProps) { return <nav {...props} aria-label={label} className={cx(s.sideNav, className)}><NavigationLinks items={items} activeId={activeId} onNavigate={onNavigate}/></nav>; }
