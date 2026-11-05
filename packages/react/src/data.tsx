import { useId, useMemo, useState, type ReactNode } from 'react';
import * as A from 'react-aria-components';
import { CartesianGrid, Line, LineChart, Bar, BarChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import { Input } from './forms';
import { Icon } from './foundation';
import { Pagination } from './navigation';
import { useCyberUI } from './provider';
import { cx, type DOMProps } from './shared';
import s from './ui.module.css';

export interface TableColumn<T> { key: keyof T & string; label: string; render?: (value:T[keyof T],row:T)=>ReactNode; sortable?: boolean }
export interface TableProps<T extends {id:string}> extends DOMProps { label:string; rows:T[]; columns:TableColumn<T>[]; emptyMessage?:string }
export function Table<T extends {id:string}>({label,rows,columns,className,emptyMessage,...props}:TableProps<T>) {
  const {t}=useCyberUI();
  return <div {...props} className={cx(s.tableWrap,className)}><table aria-label={label} className={s.table}><thead><tr>{columns.map(c=><th scope="col" key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id}>{columns.map(c=><td key={c.key}>{c.render?c.render(row[c.key],row):String(row[c.key]??'')}</td>)}</tr>)}{!rows.length&&<tr><td colSpan={columns.length}>{emptyMessage??t('No results','没有结果')}</td></tr>}</tbody></table></div>;
}
export interface DataTableProps<T extends {id:string}> extends TableProps<T> { pageSize?:number; selection?:string[]; defaultSelection?:string[]; onSelectionChange?:(ids:string[])=>void }
export function DataTable<T extends {id:string}>({label,rows,columns,pageSize=5,selection,defaultSelection=[],onSelectionChange,className,emptyMessage,...props}:DataTableProps<T>) {
  const {t,locale}=useCyberUI(); const [query,setQuery]=useState(''); const [page,setPage]=useState(1);
  const [sort,setSort]=useState<{key:keyof T;direction:number}>(); const [localSelected,setLocalSelected]=useState(defaultSelection); const selected=selection??localSelected;
  const filtered=useMemo(()=>{
    const result=rows.filter(row=>columns.some(c=>String(row[c.key]).toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale))));
    if(sort)result.sort((a,b)=>typeof a[sort.key]==='number'&&typeof b[sort.key]==='number'?(Number(a[sort.key])-Number(b[sort.key]))*sort.direction:String(a[sort.key]).localeCompare(String(b[sort.key]),locale,{numeric:true})*sort.direction);
    return result;
  },[rows,columns,query,sort,locale]);
  const size=Math.max(1,pageSize); const pages=Math.max(1,Math.ceil(filtered.length/size)); const current=Math.min(page,pages); const shown=filtered.slice((current-1)*size,current*size);
  const select=(ids:string[])=>{if(selection===undefined)setLocalSelected(ids);onSelectionChange?.(ids);};
  const selectable=onSelectionChange!==undefined||selection!==undefined||defaultSelection.length>0;
  return <div {...props} className={className}>
    <Input label={t('Search','搜索')} type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder={t('Filter records…','筛选记录…')}/>
    <div className={s.tableWrap} style={{marginTop:16}}><table aria-label={label} className={s.table}><thead><tr>
      {selectable&&<th scope="col"><input aria-label={t('Select all visible rows','选择当前页全部行')} type="checkbox" checked={shown.length>0&&shown.every(r=>selected.includes(r.id))} onChange={e=>select(e.target.checked?Array.from(new Set([...selected,...shown.map(r=>r.id)])):selected.filter(id=>!shown.some(r=>r.id===id)))}/></th>}
      {columns.map(c=><th key={c.key} scope="col" aria-sort={sort?.key===c.key?(sort.direction===1?'ascending':'descending'):undefined}>{c.sortable===false?c.label:<button type="button" onClick={()=>{setSort({key:c.key,direction:sort?.key===c.key?-sort.direction:1});setPage(1);}}>{c.label}<span aria-hidden>{sort?.key===c.key?(sort.direction===1?'↑':'↓'):'↕'}</span></button>}</th>)}
    </tr></thead><tbody>{shown.map(row=><tr key={row.id} aria-selected={selectable?selected.includes(row.id):undefined}>
      {selectable&&<td><input type="checkbox" aria-label={t(`Select ${row.id}`,`选择 ${row.id}`)} checked={selected.includes(row.id)} onChange={e=>select(e.target.checked?[...selected,row.id]:selected.filter(id=>id!==row.id))}/></td>}
      {columns.map(c=><td key={c.key}>{c.render?c.render(row[c.key],row):String(row[c.key]??'')}</td>)}
    </tr>)}{!shown.length&&<tr><td colSpan={columns.length+(selectable?1:0)}>{emptyMessage??t('No matching records','没有匹配的记录')}</td></tr>}</tbody></table></div>
    <div className={s.tableFooter}><span className={s.helper} role="status">{filtered.length} {t('records','条记录')}{selectable?` · ${selected.length} ${t('selected','已选')}`:''}</span><Pagination page={current} totalPages={pages} onChange={setPage}/></div>
  </div>;
}
export interface AccordionItem {id:string;title:string;content:ReactNode;disabled?:boolean}
export interface AccordionProps extends DOMProps {items:AccordionItem[];allowsMultipleExpanded?:boolean;value?:string[];defaultValue?:string[];onChange?:(value:string[])=>void}
export function Accordion({items,allowsMultipleExpanded,value,defaultValue,onChange,className,...props}:AccordionProps) {
  return <A.DisclosureGroup {...props} allowsMultipleExpanded={allowsMultipleExpanded} expandedKeys={value?new Set(value):undefined} defaultExpandedKeys={defaultValue} onExpandedChange={keys=>onChange?.(Array.from(keys,String))} className={cx(s.accordion,className)}>
    {items.map(item=><A.Disclosure id={item.id} key={item.id} isDisabled={item.disabled} className={s.accordionItem}>{({isExpanded})=><><h3><A.Button slot="trigger" className={s.accordionTrigger}>{item.title}<Icon name={isExpanded?'minus':'plus'} size={16}/></A.Button></h3><A.DisclosurePanel className={s.accordionContent}>{item.content}</A.DisclosurePanel></>}</A.Disclosure>)}
  </A.DisclosureGroup>;
}
export interface TreeNode {id:string;label:string;children?:TreeNode[]}
export interface TreeViewProps extends DOMProps {label:string;items:TreeNode[];value?:string;defaultValue?:string;onChange?:(value:string)=>void;defaultExpanded?:string[]}
export function TreeView({label,items,value,defaultValue,onChange,defaultExpanded,className,...props}:TreeViewProps) {
  const node=(item:TreeNode):ReactNode=><A.TreeItem key={item.id} id={item.id} textValue={item.label} className={s.treeRow} style={({level})=>({paddingLeft:(level-1)*20})}>
    <A.TreeItemContent>{({isExpanded,hasChildItems})=><>{hasChildItems?<A.Button slot="chevron" aria-label={item.label}><Icon name={isExpanded?'down':'forward'} size={14}/></A.Button>:<span style={{width:28}}/>}<Icon name={item.children?'folder':'book'} size={18}/>{item.label}</>}</A.TreeItemContent>
    {item.children?.map(node)}
  </A.TreeItem>;
  return <A.Tree {...props} aria-label={label} selectionMode="single" selectedKeys={value===undefined?undefined:new Set(value?[value]:[])} defaultSelectedKeys={defaultValue?[defaultValue]:undefined} defaultExpandedKeys={defaultExpanded} onSelectionChange={keys=>{if(keys!=='all'){onChange?.(String(Array.from(keys)[0]??''));}}} className={cx(s.tree,className)}>{items.map(node)}</A.Tree>;
}
export interface ChartDatum {label:string;value:number}
export interface ChartProps extends DOMProps<HTMLElement> {label:string;data:ChartDatum[];variant?:'line'|'bar'|'sparkline';height?:number;unit?:string}
export function Chart({label,data,variant='line',height=220,unit='',className,...props}:ChartProps) {
  const {t}=useCyberUI(); const id=useId(); const compact=variant==='sparkline';
  const axes=<><CartesianGrid stroke="var(--cyber-line)" strokeDasharray="3 6" vertical={false}/><XAxis dataKey="label" stroke="var(--cyber-muted)" tickLine={false} axisLine={false} fontSize={11}/><YAxis stroke="var(--cyber-muted)" tickLine={false} axisLine={false} fontSize={11} width={36}/></>;
  return <figure {...props} className={cx(s.chart,className)} style={{margin:0,...props.style}} aria-labelledby={id}>
    <figcaption id={id} className={s.label}>{label}</figcaption><div style={{height:compact?64:height,minWidth:0}} role="img" aria-label={`${label}: ${data.map(d=>`${d.label} ${d.value}${unit}`).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        {variant==='bar'?<BarChart data={data} accessibilityLayer margin={{top:20,right:8,left:0,bottom:0}}>{axes}<ChartTooltip contentStyle={{border:'1px solid var(--cyber-ink)',background:'var(--cyber-bg)',color:'var(--cyber-ink)'}}/><Bar dataKey="value" name={label} fill="var(--cyber-accent)" isAnimationActive={false}/></BarChart>:<LineChart data={data} accessibilityLayer margin={compact?{top:8,right:2,bottom:8,left:2}:{top:20,right:8,left:0,bottom:0}}>{!compact&&axes}{!compact&&<ChartTooltip contentStyle={{border:'1px solid var(--cyber-ink)',background:'var(--cyber-bg)',color:'var(--cyber-ink)'}}/>}<Line dataKey="value" name={label} stroke="var(--cyber-ink)" strokeWidth={2} dot={compact?false:{r:3,fill:'var(--cyber-bg)'}} activeDot={{r:5}} isAnimationActive={false}/></LineChart>}
      </ResponsiveContainer>
    </div><details><summary>{t('View exact values','查看精确数值')}</summary><Table label={label} rows={data.map((d,i)=>({...d,id:String(i)}))} columns={[{key:'label',label:t('Period','时段')},{key:'value',label:unit||t('Value','数值')}]}/></details>
  </figure>;
}
