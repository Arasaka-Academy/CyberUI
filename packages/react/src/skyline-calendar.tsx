'use client';
import { type DOMProps, useControllableState, cx } from './shared';
import { useCyberUI } from './provider';
import { useId, type CSSProperties } from 'react';
import s from './skyline-calendar.module.css';
export interface SkylineDay {
    day: number;
    pages: number;
}
export interface SkylineCalendarProps extends DOMProps<HTMLElement> {
    label?: string;
    days: SkylineDay[];
    value?: number;
    defaultValue?: number;
    onChange?: (day: number) => void;
    className?: string;
}
export function SkylineCalendar({ label = 'OCTOBER // 2026', days, value, defaultValue = 30, onChange, className, ...props }: SkylineCalendarProps) {
    const { t } = useCyberUI();
    const [selected, setSelected] = useControllableState(value, defaultValue, onChange);
    const id = useId();
    const max = Math.max(1, ...days.map(d => d.pages));
    const index = Math.max(0, days.findIndex(d => d.day === selected));
    const selectedDay = days[index]?.day ?? selected;
    return <figure {...props} className={cx(s.skyCalendar, className)} style={{ margin: 0, ...props.style }}><figcaption id={id}>{label}</figcaption><div className={s.buildings}>
    {days.map(d => <span key={d.day} aria-hidden className={s.buildingColumn} data-selected={selectedDay === d.day} style={{ '--height': `${Math.max(8, d.pages / max * 160)}px` } as CSSProperties}><span className={s.building}/><span>{d.day}</span></span>)}
    {days.length > 0 && <input className={s.skyRange} type="range" min={0} max={days.length - 1} step={1} value={index} aria-labelledby={id} aria-valuetext={t(`Day ${selectedDay}: ${days[index].pages} pages`, `${selectedDay} 日：${days[index].pages} 页`)} onChange={e => setSelected(days[Number(e.target.value)].day)}/>}
  </div><p role="status" className={s.micro}>{days.length ? t(`DAY ${selectedDay} // ${days[index].pages} PAGES READ`, `日期 ${selectedDay} // ${days[index].pages} 页已读`) : t('No reading data', '暂无阅读数据')}</p><details><summary>{t('Daily reading data', '每日阅读数据')}</summary><dl className={s.dailyData}>{days.map(d => <div key={d.day}><dt>{d.day}</dt><dd>{d.pages} {t('pages', '页')}</dd></div>)}</dl></details></figure>;
}
