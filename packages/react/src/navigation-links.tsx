'use client';
import { type NavigationProps } from './navigation-types';
import { Icon } from './icon';
export function NavigationLinks({ items, activeId, onNavigate }: NavigationProps) {
    return <>{items.map(item => <a key={item.id} href={item.href} aria-current={item.id === activeId ? 'page' : undefined} onClick={e => { if (onNavigate) {
        e.preventDefault();
        onNavigate(item);
    } }}>{item.icon && <Icon name={item.icon}/>}<span>{item.label}</span></a>)}</>;
}
