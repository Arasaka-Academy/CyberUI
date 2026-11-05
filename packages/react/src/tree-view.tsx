'use client';
import { type DOMProps, cx } from './shared';
import { type ReactNode } from 'react';
import * as A from 'react-aria-components';
import s from './tree-view.module.css';
import { Icon } from './icon';
export interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
}
export interface TreeViewProps extends DOMProps {
    label: string;
    items: TreeNode[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    defaultExpanded?: string[];
}
export function TreeView({ label, items, value, defaultValue, onChange, defaultExpanded, className, ...props }: TreeViewProps) {
    const node = (item: TreeNode): ReactNode => <A.TreeItem key={item.id} id={item.id} textValue={item.label} className={s.treeRow} style={({ level }) => ({ paddingLeft: (level - 1) * 20 })}>
    <A.TreeItemContent>{({ isExpanded, hasChildItems }) => <>{hasChildItems ? <A.Button slot="chevron" aria-label={item.label}><Icon name={isExpanded ? 'down' : 'forward'} size={14}/></A.Button> : <span style={{ width: 28 }}/>}<Icon name={item.children ? 'folder' : 'book'} size={18}/>{item.label}</>}</A.TreeItemContent>
    {item.children?.map(node)}
  </A.TreeItem>;
    return <A.Tree {...props} aria-label={label} selectionMode="single" selectedKeys={value === undefined ? undefined : new Set(value ? [value] : [])} defaultSelectedKeys={defaultValue ? [defaultValue] : undefined} defaultExpandedKeys={defaultExpanded} onSelectionChange={keys => { if (keys !== 'all') {
        onChange?.(String(Array.from(keys)[0] ?? ''));
    } }} className={cx(s.tree, className)}>{items.map(node)}</A.Tree>;
}
