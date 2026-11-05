import { useId, type ReactNode } from 'react';
import { Icon } from './foundation';
import { cx, type DOMProps, type NativeProps } from './shared';
import { useCyberUI } from './provider';
import s from './ui.module.css';

export interface AlertProps extends DOMProps { title: string; children?: ReactNode; tone?: 'info'|'success'|'warning'|'danger' }
export function Alert({title,children,tone='info',className,...props}:AlertProps) {
  return <div {...props} role={tone==='danger'?'alert':'status'} className={cx(s.alert,className)} data-tone={tone}><Icon name={tone==='success'?'check':'warning'}/><div><strong>{title}</strong>{children&&<p>{children}</p>}</div></div>;
}
export type ProgressVariant='segments'|'ascii'|'heartbeat'|'scanline'|'equalizer';
export interface ProgressProps extends DOMProps { value: number; variant?: ProgressVariant; segments?: number; label?: string; showValue?:boolean }
export function Progress({value,variant='segments',segments=20,label='Progress',showValue,className,style,...props}:ProgressProps) {
  const v=Number.isFinite(value)?Math.min(100,Math.max(0,value)):0; const id=useId().replace(/:/g,''); const total=Math.min(100,Math.max(1,segments));
  const wave=Array.from({length:501},(_,i)=>{const p=(i%72)/72;const y=22-(p>.36&&p<.48?Math.sin((p-.36)/.12*Math.PI)*18:p>.48&&p<.57?-Math.sin((p-.48)/.09*Math.PI)*10:Math.sin(p*Math.PI*5)*2);return `${i},${y.toFixed(1)}`;}).join(' ');
  return <div {...props} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} className={className} style={style}>
    {showValue&&<div style={{display:'flex',justifyContent:'space-between',font:'12px var(--cyber-font-mono)',marginBottom:10}} aria-hidden><span>{label}</span><span>{v}%</span></div>}
    {variant==='segments'?<div className={s.progress} aria-hidden>{Array.from({length:total},(_,i)=><span key={i} className={s.progressCell} data-filled={i<Math.round(v/100*total)}/>)}</div>:
      variant==='ascii'?<div className={s.progressAscii} aria-hidden>[<span>{'#'.repeat(Math.round(v/5))}</span><span>{'·'.repeat(20-Math.round(v/5))}</span>]</div>:
      <svg viewBox="0 0 500 44" preserveAspectRatio="none" className={s.progressWave} aria-hidden>
        <defs><clipPath id={id}><rect width={v*5} height="44"/></clipPath></defs>
        {variant==='heartbeat'?<><polyline points={wave} fill="none" stroke="var(--cyber-muted)" strokeWidth="1" strokeDasharray="1 2"/><polyline points={wave} fill="none" stroke="var(--cyber-accent)" strokeWidth="2" clipPath={`url(#${id})`}/></>:
          variant==='scanline'?<><path d="M0 32H500" stroke="var(--cyber-muted)"/>{Array.from({length:11},(_,i)=><path key={i} d={`M${i*50} 28v9`} stroke="var(--cyber-muted)"/>)}<path d={`M0 32H${v*5}`} stroke="var(--cyber-accent)" strokeWidth="4"/></>:
          Array.from({length:64},(_,i)=>{const h=10+Math.abs(Math.sin(i*.9)*Math.cos(i*.37))*30;return <rect key={i} x={i*7.85} y={44-h} width="5" height={h} fill={i/64<v/100?'var(--cyber-accent)':'var(--cyber-line)'}/>;})}
        <path d={`M${Math.min(498,v*5)} 1V43`} stroke="var(--cyber-ink)" strokeWidth="2"/>
      </svg>}
  </div>;
}
export function Skeleton({className,style,...props}:NativeProps<HTMLDivElement>) {
  const {t}=useCyberUI();return <div {...props} role="status" aria-label={t('Loading content','正在加载内容')} className={cx(s.skeleton,className)} style={style}/>;
}
export interface SpinnerProps extends DOMProps<HTMLSpanElement> {label?:string}
export function Spinner({label,className,...props}:SpinnerProps) {
  const {t}=useCyberUI();return <span {...props} role="status" aria-label={label??t('Loading','加载中')} className={cx(s.spinner,className)}/>;
}
export interface EmptyStateProps extends DOMProps { title: string; description?: string; icon?: string; action?: ReactNode }
export function EmptyState({title,description,icon='folder',action,className,...props}:EmptyStateProps) {
  return <div {...props} className={cx(s.empty,className)}><Icon name={icon} size={36}/><h3>{title}</h3>{description&&<p>{description}</p>}{action}</div>;
}
