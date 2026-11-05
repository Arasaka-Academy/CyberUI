'use client';
import { type NativeProps, cx } from './shared';
import s from './status-bar.module.css';
export interface StatusBarProps extends NativeProps<HTMLDivElement> {
    time?: string;
    battery?: number;
    cpu?: number;
    memory?: number;
    label?: string;
}
export function StatusBar({ time = '17:46', battery = 76, cpu = 12, memory = 42, label = 'CYBR//DECK', className, ...props }: StatusBarProps) {
    return <div {...props} className={cx(s.status, className)}><span>{label}</span><span aria-hidden className={s.ticks}/><time>{time}</time><span>BAT {battery}%</span><span>CPU {cpu}%</span><span>MEM {memory}%</span></div>;
}
