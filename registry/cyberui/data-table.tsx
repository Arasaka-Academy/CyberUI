// Generated from packages/react/src/data-table.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type TableProps } from "./table";
import { useCyberUI } from "./provider";
import { useState, useMemo } from 'react';
import { Input } from "./input";
import s from "./data-table.module.css";
import { Pagination } from "./pagination";
import fieldStyles from "./field.module.css";
export interface DataTableProps<T extends {
    id: string;
}> extends TableProps<T> {
    pageSize?: number;
    selection?: string[];
    defaultSelection?: string[];
    onSelectionChange?: (ids: string[]) => void;
}
export function DataTable<T extends {
    id: string;
}>({ label, rows, columns, pageSize = 5, selection, defaultSelection = [], onSelectionChange, className, emptyMessage, ...props }: DataTableProps<T>) {
    const { t, locale } = useCyberUI();
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<{
        key: keyof T;
        direction: number;
    }>();
    const [localSelected, setLocalSelected] = useState(defaultSelection);
    const selected = selection ?? localSelected;
    const filtered = useMemo(() => {
        const result = rows.filter(row => columns.some(c => String(row[c.key]).toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale))));
        if (sort)
            result.sort((a, b) => typeof a[sort.key] === 'number' && typeof b[sort.key] === 'number' ? (Number(a[sort.key]) - Number(b[sort.key])) * sort.direction : String(a[sort.key]).localeCompare(String(b[sort.key]), locale, { numeric: true }) * sort.direction);
        return result;
    }, [rows, columns, query, sort, locale]);
    const size = Math.max(1, pageSize);
    const pages = Math.max(1, Math.ceil(filtered.length / size));
    const current = Math.min(page, pages);
    const shown = filtered.slice((current - 1) * size, current * size);
    const select = (ids: string[]) => { if (selection === undefined)
        setLocalSelected(ids); onSelectionChange?.(ids); };
    const selectable = onSelectionChange !== undefined || selection !== undefined || defaultSelection.length > 0;
    return <div {...props} className={className}>
    <Input label={t('Search', '搜索')} type="search" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder={t('Filter records…', '筛选记录…')}/>
    <div className={s.tableWrap} style={{ marginTop: 16 }}><table aria-label={label} className={s.table}><thead><tr>
      {selectable && <th scope="col"><input aria-label={t('Select all visible rows', '选择当前页全部行')} type="checkbox" checked={shown.length > 0 && shown.every(r => selected.includes(r.id))} onChange={e => select(e.target.checked ? Array.from(new Set([...selected, ...shown.map(r => r.id)])) : selected.filter(id => !shown.some(r => r.id === id)))}/></th>}
      {columns.map(c => <th key={c.key} scope="col" aria-sort={sort?.key === c.key ? (sort.direction === 1 ? 'ascending' : 'descending') : undefined}>{c.sortable === false ? c.label : <button type="button" onClick={() => { setSort({ key: c.key, direction: sort?.key === c.key ? -sort.direction : 1 }); setPage(1); }}>{c.label}<span aria-hidden>{sort?.key === c.key ? (sort.direction === 1 ? '↑' : '↓') : '↕'}</span></button>}</th>)}
    </tr></thead><tbody>{shown.map(row => <tr key={row.id} aria-selected={selectable ? selected.includes(row.id) : undefined}>
      {selectable && <td><input type="checkbox" aria-label={t(`Select ${row.id}`, `选择 ${row.id}`)} checked={selected.includes(row.id)} onChange={e => select(e.target.checked ? [...selected, row.id] : selected.filter(id => id !== row.id))}/></td>}
      {columns.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '')}</td>)}
    </tr>)}{!shown.length && <tr><td colSpan={columns.length + (selectable ? 1 : 0)}>{emptyMessage ?? t('No matching records', '没有匹配的记录')}</td></tr>}</tbody></table></div>
    <div className={s.tableFooter}><span className={fieldStyles.helper} role="status">{filtered.length} {t('records', '条记录')}{selectable ? ` · ${selected.length} ${t('selected', '已选')}` : ''}</span><Pagination page={current} totalPages={pages} onChange={setPage}/></div>
  </div>;
}
