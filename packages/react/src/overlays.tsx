import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import * as A from 'react-aria-components';
import { Button, Icon, IconButton } from './foundation';
import { cx, type DOMProps } from './shared';
import { useCyberUI } from './provider';
import s from './ui.module.css';

export interface DialogProps extends Omit<DOMProps,'role'> { title: string; trigger?: ReactElement; children: ReactNode|((close:()=>void)=>ReactNode); isOpen?: boolean; defaultOpen?: boolean; onOpenChange?: (open:boolean)=>void; role?: 'dialog'|'alertdialog' }
function ModalSurface({ title,trigger,children,isOpen,defaultOpen,onOpenChange,className,role='dialog',drawer=false,...props }: DialogProps&{drawer?:boolean}) {
  const {t}=useCyberUI();
  const surface=<A.ModalOverlay isOpen={trigger?undefined:isOpen} defaultOpen={trigger?undefined:defaultOpen} onOpenChange={trigger?undefined:onOpenChange} isDismissable className={cx(s.overlay,drawer&&s.drawerOverlay)}><A.Modal className={cx(s.modal,drawer&&s.drawer,className)}>
      <A.Dialog {...props} className={s.dialog} role={role}>{({close})=><><header className={s.dialogHead}><A.Heading slot="title">{title}</A.Heading><IconButton icon="close" aria-label={t('Close dialog','关闭弹窗')} variant="ghost" onPress={close}/></header>{typeof children==='function'?children(close):children}</>}</A.Dialog>
    </A.Modal></A.ModalOverlay>;
  return trigger?<A.DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>{trigger}{surface}</A.DialogTrigger>:surface;
}
export function Dialog(props:DialogProps) { return <ModalSurface {...props}/>; }
export function Drawer(props:DialogProps) { return <ModalSurface {...props} drawer/>; }
export interface AlertDialogProps extends Omit<DialogProps,'children'|'role'> { children?: ReactNode; confirmLabel?: string; onConfirm?: ()=>void|Promise<void> }
function Confirmation({ close,children,confirmLabel,onConfirm }: Pick<AlertDialogProps,'children'|'confirmLabel'|'onConfirm'>&{close:()=>void}) {
  const [pending,setPending]=useState(false); const [error,setError]=useState(''); const {t}=useCyberUI();
  return <><div style={{color:'var(--cyber-muted)',marginBottom:24}}>{children}</div>{error&&<p role="alert" className={s.error}>{error}</p>}<div className={s.buttonGroup}>
    <Button onPress={close}>{t('Cancel','取消')}</Button><Button variant="danger" isPending={pending} onPress={async()=>{setPending(true);try{await onConfirm?.();close();}catch{setError(t('The action failed. Please try again.','操作失败，请重试。'));}finally{setPending(false);}}}>{confirmLabel??t('Confirm','确认')}</Button>
  </div></>;
}
export function AlertDialog({ children,confirmLabel,onConfirm,...props }:AlertDialogProps) {
  return <ModalSurface {...props} role="alertdialog">{close=><Confirmation close={close} confirmLabel={confirmLabel} onConfirm={onConfirm}>{children}</Confirmation>}</ModalSurface>;
}
export interface PopoverProps extends Omit<DOMProps,'role'> { trigger: ReactElement; title: string; children: ReactNode; placement?: A.Placement; isOpen?:boolean; defaultOpen?:boolean; onOpenChange?:(open:boolean)=>void }
export function Popover({trigger,title,children,placement='bottom',isOpen,defaultOpen,onOpenChange,className,...props}:PopoverProps) {
  return <A.DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>{trigger}<A.Popover className={cx(s.popover,className)} placement={placement}><A.Dialog {...props} aria-label={title} style={{padding:14,outline:0,...props.style}}>{children}</A.Dialog></A.Popover></A.DialogTrigger>;
}
export interface TooltipProps extends DOMProps {children:ReactElement;content:string;isOpen?:boolean;defaultOpen?:boolean;onOpenChange?:(open:boolean)=>void}
export function Tooltip({children,content,isOpen,defaultOpen,onOpenChange,className,...props}: TooltipProps) {
  return <A.TooltipTrigger delay={300} isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>{children}<A.Tooltip {...props} className={cx(s.tooltip,className)}>{content}</A.Tooltip></A.TooltipTrigger>;
}
export interface ToastProps extends DOMProps { message: string; onDismiss?: ()=>void; duration?: number; action?: {label:string;onAction:()=>void}; tone?: 'default'|'success'|'danger' }
export function Toast({message,onDismiss,duration=5000,action,tone='default',className,...props}:ToastProps) {
  const [paused,setPaused]=useState(false); const dismiss=useRef(onDismiss); const {t}=useCyberUI();
  useEffect(()=>{dismiss.current=onDismiss;},[onDismiss]);
  useEffect(()=>{if(paused||!duration||!onDismiss)return;const timer=setTimeout(()=>dismiss.current?.(),duration);return()=>clearTimeout(timer);},[paused,duration,onDismiss]);
  return <div {...props} className={cx(s.toast,className)} role="status" aria-live="polite" onPointerEnter={e=>{setPaused(true);props.onPointerEnter?.(e);}} onPointerLeave={e=>{setPaused(false);props.onPointerLeave?.(e);}} onFocusCapture={e=>{setPaused(true);props.onFocusCapture?.(e);}} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setPaused(false);props.onBlurCapture?.(e);}}>
    <Icon name={tone==='danger'?'warning':'check'}/><span style={{fontSize:14,flex:1}}>{message}</span>{action&&<Button size="sm" variant="ghost" onPress={()=>{action.onAction();onDismiss?.();}}>{action.label}</Button>}
    {onDismiss&&<IconButton icon="close" size="sm" variant="ghost" aria-label={t('Dismiss notification','关闭通知')} onPress={onDismiss}/>}
  </div>;
}
interface ToastEntry extends ToastProps { entryKey:number }
const ToastContext=createContext<(message:string,action?:ToastProps['action'])=>void>(()=>{});
export function ToastProvider({children}:{children:ReactNode}) {
  const [entries,setEntries]=useState<ToastEntry[]>([]); const next=useRef(0); const {t}=useCyberUI();
  const notify=useCallback((message:string,action?:ToastProps['action'])=>setEntries(previous=>[...previous.slice(-3),{entryKey:++next.current,message,action}]),[]);
  const remove=useCallback((id:number)=>setEntries(previous=>previous.filter(item=>item.entryKey!==id)),[]);
  return <ToastContext.Provider value={notify}>{children}<div role="region" aria-label={t('Notifications','通知')} className={s.toastRegion}>{entries.map(({entryKey,...item})=><Toast key={entryKey} {...item} onDismiss={()=>remove(entryKey)}/>)}</div></ToastContext.Provider>;
}
export const useToast=()=>useContext(ToastContext);
