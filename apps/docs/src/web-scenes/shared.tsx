import type { ReactNode } from 'react';
import * as C from '@cyberui/react';
import s from './web.module.css';

export function Brand({ name, subtitle, icon = 'network' }: { name: string; subtitle: string; icon?: string }) {
  return <div className={s.brand}><span className={s.brandMark}><C.Icon name={icon} size={22}/></span><div><strong>{name}<span>®</span></strong><small>{subtitle}</small></div></div>;
}
export function SectionTitle({ code, title, action }: { code: string; title: string; action?: ReactNode }) {
  return <div className={s.sectionTitle}><div><span className={s.kicker}>{code}</span><h3>{title}</h3></div>{action}</div>;
}
export async function copyText(value: string) {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(value);
}
export function downloadText(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
