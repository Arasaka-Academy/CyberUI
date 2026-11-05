'use client';
import { type DOMProps } from './shared';
import { type ReactElement, useState } from 'react';
import { type MenuItem } from './menu-types';
import { useCyberUI } from './provider';
import { Dialog } from './dialog';
import { Input } from './input';
import * as A from 'react-aria-components';
import s from './command-palette.module.css';
import { Icon } from './icon';
export interface CommandPaletteProps extends Omit<DOMProps, 'role'> {
    trigger?: ReactElement;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    items: MenuItem[];
    label?: string;
    onAction?: (id: string) => void;
}
export function CommandPalette({ trigger, isOpen, onOpenChange, items, label = 'Command palette', onAction, ...props }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const { t } = useCyberUI();
    const filtered = items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()));
    return <Dialog {...props} trigger={trigger} isOpen={isOpen} onOpenChange={open => { onOpenChange?.(open); if (!open)
        setQuery(''); }} title={label}>
    {close => <><Input autoFocus label={t('Search commands', '搜索命令')} type="search" value={query} onChange={e => setQuery(e.target.value)}/>
      <A.ListBox aria-label={label} items={filtered} disabledKeys={items.filter(i => i.disabled).map(i => i.id)} className={s.listBox} selectionMode="single" onAction={key => { items.find(i => i.id === key)?.onAction?.(); onAction?.(String(key)); close(); }} renderEmptyState={() => t('No commands found', '没有匹配的命令')}>
        {item => <A.ListBoxItem id={item.id} textValue={item.label} className={s.listItem}>{item.icon && <Icon name={item.icon} size={18}/>}<span>{item.label}</span><Icon name="forward" size={14} style={{ marginLeft: 'auto' }}/></A.ListBoxItem>}
      </A.ListBox><span className={s.helper}>↑ ↓ {t('Navigate', '移动')} · Enter {t('Open', '打开')} · Esc {t('Close', '关闭')}</span></>}
  </Dialog>;
}
