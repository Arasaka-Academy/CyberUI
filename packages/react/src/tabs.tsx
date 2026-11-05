'use client';
import { type ReactNode } from 'react';
import { type DOMProps } from './shared';
import * as A from 'react-aria-components';
import s from './tabs.module.css';
export interface TabItem {
    id: string;
    label: string;
    content: ReactNode;
    disabled?: boolean;
}
export interface TabsProps extends DOMProps {
    items: TabItem[];
    label?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
}
export function Tabs({ items, label = 'Tabs', value, defaultValue, onChange, className, ...props }: TabsProps) {
    return <A.Tabs {...props} selectedKey={value} defaultSelectedKey={defaultValue ?? items[0]?.id} onSelectionChange={key => onChange?.(String(key))} className={className}>
    <A.TabList aria-label={label} className={s.tabList}>{items.map(item => <A.Tab key={item.id} id={item.id} isDisabled={item.disabled} className={s.tab}>{item.label}</A.Tab>)}</A.TabList>
    {items.map(item => <A.TabPanel key={item.id} id={item.id} className={s.tabPanel}>{item.content}</A.TabPanel>)}
  </A.Tabs>;
}
