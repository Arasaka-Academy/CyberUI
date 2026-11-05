'use client';
import { type NavigationProps } from './navigation-types';
import { cx } from './shared';
import s from './bottom-navigation.module.css';
import { NavigationLinks } from './navigation-links';
export function BottomNavigation({ className, label = 'Navigation', items, activeId, onNavigate, ...props }: NavigationProps) { return <nav {...props} aria-label={label} className={cx(s.bottomNav, className)}><NavigationLinks items={items.slice(0, 5)} activeId={activeId} onNavigate={onNavigate}/></nav>; }
