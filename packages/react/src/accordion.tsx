'use client';
import { type ReactNode } from 'react';
import { type DOMProps, cx } from './shared';
import * as A from 'react-aria-components';
import s from './accordion.module.css';
import { Icon } from './icon';
export interface AccordionItem {
    id: string;
    title: string;
    content: ReactNode;
    disabled?: boolean;
}
export interface AccordionProps extends DOMProps {
    items: AccordionItem[];
    allowsMultipleExpanded?: boolean;
    value?: string[];
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
}
export function Accordion({ items, allowsMultipleExpanded, value, defaultValue, onChange, className, ...props }: AccordionProps) {
    return <A.DisclosureGroup {...props} allowsMultipleExpanded={allowsMultipleExpanded} expandedKeys={value ? new Set(value) : undefined} defaultExpandedKeys={defaultValue} onExpandedChange={keys => onChange?.(Array.from(keys, String))} className={cx(s.accordion, className)}>
    {items.map(item => <A.Disclosure id={item.id} key={item.id} isDisabled={item.disabled} className={s.accordionItem}>{({ isExpanded }) => <><h3><A.Button slot="trigger" className={s.accordionTrigger}>{item.title}<Icon name={isExpanded ? 'minus' : 'plus'} size={16}/></A.Button></h3><A.DisclosurePanel className={s.accordionContent}>{item.content}</A.DisclosurePanel></>}</A.Disclosure>)}
  </A.DisclosureGroup>;
}
