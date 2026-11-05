'use client';
import { type NavigationProps } from './navigation-types';
import { cx } from './shared';
import s from './navigation-menu.module.css';
import { NavigationLinks } from './navigation-links';
export function NavigationMenu({ className, label = 'Navigation', items, activeId, onNavigate, ...props }: NavigationProps) { return <nav {...props} aria-label={label} className={cx(s.nav, className)}><NavigationLinks items={items} activeId={activeId} onNavigate={onNavigate}/></nav>; }
