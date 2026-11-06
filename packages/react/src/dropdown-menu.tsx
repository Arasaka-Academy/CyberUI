'use client';
import { type DOMProps, cx } from './shared';
import { type ReactElement } from 'react';
import { type MenuItem } from './menu-types';
import * as A from 'react-aria-components';
import { Button } from './button';

import { Icon } from './icon';
import popoverStyles from './popover.module.css';
import choiceStyles from './choice.module.css';
export interface DropdownMenuProps extends DOMProps {
    trigger?: ReactElement;
    label?: string;
    items: MenuItem[];
    onAction?: (id: string) => void;
}
export function DropdownMenu({ trigger, label = 'Actions', items, onAction, className, ...props }: DropdownMenuProps) {
    return <A.MenuTrigger>{trigger ?? <Button icon="menu">{label}</Button>}<A.Popover className={popoverStyles.popover}><A.Menu {...props} aria-label={label} className={cx(choiceStyles.listBox, className)} disabledKeys={items.filter(i => i.disabled).map(i => i.id)} onAction={key => { items.find(i => i.id === key)?.onAction?.(); onAction?.(String(key)); }}>
    {items.map(item => <A.MenuItem key={item.id} id={item.id} textValue={item.label} className={choiceStyles.listItem} style={item.danger ? { color: 'var(--cyber-danger)' } : undefined}>{item.icon && <Icon name={item.icon} size={16}/>}<span>{item.label}</span></A.MenuItem>)}
  </A.Menu></A.Popover></A.MenuTrigger>;
}
