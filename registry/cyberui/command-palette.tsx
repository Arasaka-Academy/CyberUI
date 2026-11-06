// Generated from packages/react/src/command-palette.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type DOMProps } from "./shared";
import { type ReactElement, useState } from 'react';
import { type MenuItem } from "./menu-types";
import { useCyberUI } from "./provider";
import { Dialog } from "./dialog";
import * as A from 'react-aria-components';

import { Icon } from "./icon";
import choiceStyles from "./choice.module.css";
import fieldStyles from "./field.module.css";
import inputStyles from "./input.module.css";
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
    const { contains } = A.useFilter({ sensitivity: 'base' });
    return <Dialog {...props} trigger={trigger} isOpen={isOpen} onOpenChange={open => { onOpenChange?.(open); if (!open)
        setQuery(''); }} title={label}>
    {close => <><A.Autocomplete inputValue={query} onInputChange={setQuery} filter={contains}>
      <A.SearchField autoFocus className={fieldStyles.field} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); close(); } }}>
        <A.Label className={fieldStyles.label}>{t('Search commands', '搜索命令')}</A.Label>
        <A.Input className={inputStyles.input}/>
      </A.SearchField>
      <A.ListBox aria-label={label} items={items} disabledKeys={items.filter(i => i.disabled).map(i => i.id)} className={choiceStyles.listBox} selectionMode="single" onAction={key => { items.find(i => i.id === key)?.onAction?.(); onAction?.(String(key)); close(); }} renderEmptyState={() => t('No commands found', '没有匹配的命令')}>
        {item => <A.ListBoxItem id={item.id} textValue={item.label} className={choiceStyles.listItem}>{item.icon && <Icon name={item.icon} size={18}/>}<span>{item.label}</span><Icon name="forward" size={14} style={{ marginLeft: 'auto' }}/></A.ListBoxItem>}
      </A.ListBox></A.Autocomplete><span className={fieldStyles.helper}>↑ ↓ {t('Navigate', '移动')} · Enter {t('Open', '打开')} · Esc {t('Close', '关闭')}</span></>}
  </Dialog>;
}
