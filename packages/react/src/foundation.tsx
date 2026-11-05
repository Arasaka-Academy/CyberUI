import { forwardRef, useState, type ReactNode, type SVGProps, type Ref } from 'react';
import { Button as AriaButton, Toolbar as AriaToolbar, type ButtonProps as AriaButtonProps, type ToolbarProps as AriaToolbarProps } from 'react-aria-components';
import { iconPaths } from './icons.generated';
import { cx, type NativeProps } from './shared';
import s from './ui.module.css';
import { useCyberUI } from './provider';

export interface IconProps extends SVGProps<SVGSVGElement> { name: string; size?: number; label?: string }
const extraIcons: Record<string,string> = {
  code:'<path d="m8 5-7 7 7 7 1.5-1.5L3.5 12l6-5.5ZM16 5l-1.5 1.5 6 5.5-6 5.5L16 19l7-7Z"/>',
  copy:'<path fill="none" stroke="currentColor" stroke-width="2" d="M8 8h12v13H8zM16 8V3H3v13h5"/>',
  external:'<path fill="none" stroke="currentColor" stroke-width="2" d="M14 3h7v7M21 3 10 14M10 3H3v18h18v-7"/>',
  chevron:'<path fill="none" stroke="currentColor" stroke-width="2" d="m9 5 7 7-7 7"/>',
  calendar:'<path fill="none" stroke="currentColor" stroke-width="2" d="M3 5h18v16H3zM3 10h18M7 2v6M17 2v6"/>',
  lock:'<path fill="none" stroke="currentColor" stroke-width="2" d="M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4"/>',
};
export function Icon({ name,size=20,label,className,...props }: IconProps) {
  return <svg {...props} width={size} height={size} style={{width:size,height:size,...props.style}} viewBox="0 0 24 24" className={cx(s.icon,className)}
    role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true}
    dangerouslySetInnerHTML={{ __html:iconPaths[name]??extraIcons[name]??iconPaths.tools }} />;
}
export interface ButtonProps extends Omit<AriaButtonProps,'children'|'className'|'style'> {
  children?: ReactNode; className?: string; style?: React.CSSProperties;
  variant?: 'primary'|'secondary'|'accent2'|'soft'|'ghost'|'danger';
  size?: 'sm'|'md'|'lg'; corners?: 'tr-bl'|'tl-br'|'tr'|'none';
  icon?: string; disabled?: boolean; isPending?: boolean;
}
export const Button = forwardRef<HTMLButtonElement,ButtonProps>(function Button({ children,variant='secondary',size='md',corners='tr-bl',icon,disabled,isDisabled,isPending,className,...props },ref) {
  return <AriaButton {...props} ref={ref} render={props.render??((nativeProps)=><button {...nativeProps} aria-busy={isPending||undefined}/>)} className={cx(s.button,className)} isDisabled={disabled||isDisabled||isPending} isPending={isPending}
    aria-busy={isPending||undefined} data-variant={variant} data-size={size} data-corners={corners}>
    <span aria-hidden data-slot="decoration" className={s.shape}/>{isPending?<span aria-hidden className={s.spinner}/>:icon?<Icon name={icon}/>:null}
    {children&&<span>{children}</span>}
  </AriaButton>;
});
export interface IconButtonProps extends Omit<ButtonProps,'children'|'icon'> { icon: string; 'aria-label': string }
export const IconButton = forwardRef<HTMLButtonElement,IconButtonProps>(function IconButton({ className,corners='none',...props },ref) {
  return <Button {...props} ref={ref} corners={corners} className={cx(s.iconButton,className)}/>;
});
export function ButtonGroup({ className,...props }: NativeProps<HTMLDivElement>) { return <div role="group" {...props} className={cx(s.buttonGroup,className)}/>; }
export interface BadgeProps extends NativeProps<HTMLSpanElement> { tone?: 'default'|'accent'|'success'|'warning'|'danger'; dot?: boolean }
export function Badge({ tone='default',dot,className,children,...props }: BadgeProps) {
  return <span {...props} className={cx(s.badge,className)} data-tone={tone}>{dot&&<span aria-hidden>▪</span>}{children}</span>;
}
export interface TagProps extends NativeProps<HTMLSpanElement> { onRemove?: ()=>void; removeLabel?: string }
export function Tag({ children,onRemove,removeLabel,className,...props }: TagProps) {
  const { t } = useCyberUI();
  return <span {...props} className={cx(s.tag,className)}><span>{children}</span>{onRemove&&<button type="button" onClick={onRemove} aria-label={removeLabel??t(`Remove ${children}`,`移除 ${children}`)}><Icon name="close" size={12}/></button>}</span>;
}
export interface AvatarProps extends NativeProps<HTMLSpanElement> { src?: string; name: string; size?: number }
export function Avatar({ src,name,size=52,className,style,...props }: AvatarProps) {
  const [failedSrc,setFailedSrc]=useState<string>();
  return <span {...props} role="img" aria-label={name} className={cx(s.avatar,className)} style={{ width:size,height:size,...style }}>
    {src&&failedSrc!==src?<img src={src} alt="" onError={()=>setFailedSrc(src)}/>:name.slice(0,2).toUpperCase()}
  </span>;
}
export function Divider(props: NativeProps<HTMLHRElement>) { return <hr {...props} className={cx(s.divider,props.className)}/>; }
export type PanelShape = 'frame'|'chamfer'|'brackets'|'header'|'rail'|'none';
export interface PanelProps extends NativeProps<HTMLElement> { shape?: PanelShape; label?: string; title?: string; titleRight?: ReactNode }
export function Panel({ shape='frame',label,title,titleRight,children,className,...props }: PanelProps) {
  return <section {...props} className={cx(s.panel,className)} data-shape={shape}>
    {shape==='chamfer'&&<span aria-hidden data-slot="decoration" className={s.shape}/>}
    {shape==='header'&&title?<div className={s.panelTitle}><span>{title}</span>{titleRight}</div>:label||title?<span className={s.panelLabel}>{label??title}</span>:null}
    {children}
  </section>;
}
export interface CardProps extends NativeProps<HTMLElement> { title?: string; description?: string; footer?: ReactNode }
export function Card({ title,description,footer,children,className,...props }: CardProps) {
  return <article {...props} className={cx(s.card,className)}>{title&&<h3>{title}</h3>}{description&&<p>{description}</p>}{children}{footer&&<footer style={{marginTop:18}}>{footer}</footer>}</article>;
}
export interface ToolbarProps extends Omit<AriaToolbarProps,'children'|'className'> {children:ReactNode;label?:string;className?:string;ref?:Ref<HTMLDivElement>}
export function Toolbar({ children,label='Actions',...props }: ToolbarProps) {
  return <AriaToolbar {...props} aria-label={label} className={cx(s.toolbar,props.className)}>{children}</AriaToolbar>;
}
