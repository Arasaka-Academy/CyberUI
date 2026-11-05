import { useState, type ReactElement, type ReactNode } from 'react';
import * as A from 'react-aria-components';
import { Button, Icon, IconButton } from './foundation';
import { Input, type Option } from './forms';
import { Dialog } from './overlays';
import { cx, useControllableState, type DOMProps } from './shared';
import { useCyberUI } from './provider';
import s from './ui.module.css';

export interface TabItem { id: string; label: string; content: ReactNode; disabled?: boolean }
export interface TabsProps extends DOMProps { items: TabItem[]; label?: string; value?: string; defaultValue?: string; onChange?: (value:string)=>void }
export function Tabs({ items,label='Tabs',value,defaultValue,onChange,className,...props }: TabsProps) {
  return <A.Tabs {...props} selectedKey={value} defaultSelectedKey={defaultValue??items[0]?.id} onSelectionChange={key=>onChange?.(String(key))} className={className}>
    <A.TabList aria-label={label} className={s.tabList}>{items.map(item=><A.Tab key={item.id} id={item.id} isDisabled={item.disabled} className={s.tab}>{item.label}</A.Tab>)}</A.TabList>
    {items.map(item=><A.TabPanel key={item.id} id={item.id} className={s.tabPanel}>{item.content}</A.TabPanel>)}
  </A.Tabs>;
}
export interface SegmentedControlProps extends DOMProps { label: string; options: Option[]; value?: string; defaultValue?: string; onChange?: (value:string)=>void }
export function SegmentedControl({ label,options,value,defaultValue,onChange,className,...props }: SegmentedControlProps) {
  const [selected,setSelected]=useControllableState(value,defaultValue??options[0]?.id,onChange);
  return <A.ToggleButtonGroup {...props} aria-label={label} selectionMode="single" disallowEmptySelection selectedKeys={new Set(selected?[selected]:[])} onSelectionChange={keys=>{const key=Array.from(keys)[0];if(key!==undefined)setSelected(String(key));}} className={cx(s.segmented,className)}>
    {options.map(o=><A.ToggleButton key={o.id} id={o.id} isDisabled={o.disabled} className={s.segment}>{o.label}</A.ToggleButton>)}
  </A.ToggleButtonGroup>;
}
export interface NavItem { id: string; label: string; href: string; icon?: string }
export interface BreadcrumbProps extends DOMProps<HTMLElement> {items:Omit<NavItem,'id'>[];label?:string}
export function Breadcrumb({ items,label='Breadcrumb',...props }: BreadcrumbProps) {
  return <nav {...props} aria-label={label}><ol className={s.breadcrumb}>{items.map((item,index)=><li key={`${item.href}-${index}`}>{index>0&&<span aria-hidden>/</span>}{index===items.length-1?<span aria-current="page">{item.label}</span>:<a href={item.href}>{item.label}</a>}</li>)}</ol></nav>;
}
export interface PaginationProps extends DOMProps<HTMLElement> { page?: number; defaultPage?: number; totalPages: number; onChange?: (page:number)=>void }
export function Pagination({ page,defaultPage=1,totalPages,onChange,className,...props }: PaginationProps) {
  const [current,setCurrent]=useControllableState(page,defaultPage,onChange); const {t}=useCyberUI(); const count=Math.max(1,totalPages); const shown=Math.min(count,Math.max(1,current));
  return <nav {...props} aria-label={props['aria-label']??t('Pagination','分页')} className={cx(s.nav,className)}>
    <IconButton icon="first" size="sm" aria-label={t('First page','第一页')} isDisabled={shown<=1} onPress={()=>setCurrent(1)}/>
    <IconButton icon="back" size="sm" aria-label={t('Previous page','上一页')} isDisabled={shown<=1} onPress={()=>setCurrent(shown-1)}/>
    <span aria-live="polite" style={{fontFamily:'var(--cyber-font-mono)',fontSize:13,padding:'0 8px'}}>{String(shown).padStart(2,'0')} / {String(count).padStart(2,'0')}</span>
    <IconButton icon="forward" size="sm" aria-label={t('Next page','下一页')} isDisabled={shown>=count} onPress={()=>setCurrent(shown+1)}/>
    <IconButton icon="last" size="sm" aria-label={t('Last page','最后一页')} isDisabled={shown>=count} onPress={()=>setCurrent(count)}/>
  </nav>;
}
export interface NavigationProps extends DOMProps<HTMLElement> { items: NavItem[]; activeId?: string; label?: string; onNavigate?: (item:NavItem)=>void }
function NavigationLinks({ items,activeId,onNavigate }: NavigationProps) {
  return <>{items.map(item=><a key={item.id} href={item.href} aria-current={item.id===activeId?'page':undefined} onClick={e=>{if(onNavigate){e.preventDefault();onNavigate(item);}}}>{item.icon&&<Icon name={item.icon}/>}<span>{item.label}</span></a>)}</>;
}
export function Sidebar({ className,label='Navigation',items,activeId,onNavigate,...props }: NavigationProps) { return <nav {...props} aria-label={label} className={cx(s.sideNav,className)}><NavigationLinks items={items} activeId={activeId} onNavigate={onNavigate}/></nav>; }
export function BottomNavigation({ className,label='Navigation',items,activeId,onNavigate,...props }: NavigationProps) { return <nav {...props} aria-label={label} className={cx(s.bottomNav,className)}><NavigationLinks items={items.slice(0,5)} activeId={activeId} onNavigate={onNavigate}/></nav>; }
export function NavigationMenu({ className,label='Navigation',items,activeId,onNavigate,...props }: NavigationProps) { return <nav {...props} aria-label={label} className={cx(s.nav,className)}><NavigationLinks items={items} activeId={activeId} onNavigate={onNavigate}/></nav>; }
export interface MenuItem { id: string; label: string; icon?: string; disabled?: boolean; danger?: boolean; onAction?: ()=>void }
export interface DropdownMenuProps extends DOMProps { trigger?: ReactElement; label?: string; items: MenuItem[]; onAction?: (id:string)=>void }
export function DropdownMenu({ trigger,label='Actions',items,onAction,className,...props }: DropdownMenuProps) {
  return <A.MenuTrigger>{trigger??<Button icon="menu">{label}</Button>}<A.Popover className={s.popover}><A.Menu {...props} aria-label={label} className={cx(s.listBox,className)} disabledKeys={items.filter(i=>i.disabled).map(i=>i.id)} onAction={key=>{items.find(i=>i.id===key)?.onAction?.();onAction?.(String(key));}}>
    {items.map(item=><A.MenuItem key={item.id} id={item.id} textValue={item.label} className={s.listItem} style={item.danger?{color:'var(--cyber-danger)'}:undefined}>{item.icon&&<Icon name={item.icon} size={16}/>}<span>{item.label}</span></A.MenuItem>)}
  </A.Menu></A.Popover></A.MenuTrigger>;
}
export interface CommandPaletteProps extends Omit<DOMProps,'role'> { trigger?: ReactElement; isOpen?: boolean; defaultOpen?:boolean; onOpenChange?: (open:boolean)=>void; items: MenuItem[]; label?: string; onAction?: (id:string)=>void }
export function CommandPalette({ trigger,isOpen,onOpenChange,items,label='Command palette',onAction,...props }: CommandPaletteProps) {
  const [query,setQuery]=useState(''); const {t}=useCyberUI(); const filtered=items.filter(i=>i.label.toLowerCase().includes(query.toLowerCase()));
  return <Dialog {...props} trigger={trigger} isOpen={isOpen} onOpenChange={open=>{onOpenChange?.(open);if(!open)setQuery('');}} title={label}>
    {close=><><Input autoFocus label={t('Search commands','搜索命令')} type="search" value={query} onChange={e=>setQuery(e.target.value)}/>
      <A.ListBox aria-label={label} items={filtered} disabledKeys={items.filter(i=>i.disabled).map(i=>i.id)} className={s.listBox} selectionMode="single" onAction={key=>{items.find(i=>i.id===key)?.onAction?.();onAction?.(String(key));close();}} renderEmptyState={()=>t('No commands found','没有匹配的命令')}>
        {item=><A.ListBoxItem id={item.id} textValue={item.label} className={s.listItem}>{item.icon&&<Icon name={item.icon} size={18}/>}<span>{item.label}</span><Icon name="forward" size={14} style={{marginLeft:'auto'}}/></A.ListBoxItem>}
      </A.ListBox><span className={s.helper}>↑ ↓ {t('Navigate','移动')} · Enter {t('Open','打开')} · Esc {t('Close','关闭')}</span></>}
  </Dialog>;
}
