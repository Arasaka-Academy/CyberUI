'use client';
import { type DOMProps, cx } from './shared';
import { useCyberUI } from './provider';
import { useId } from 'react';
import { CartesianGrid, XAxis, YAxis, ResponsiveContainer, BarChart, Tooltip as ChartTooltip, Bar, LineChart, Line } from 'recharts';
import s from './chart.module.css';
import { Table } from './table';
import fieldStyles from './field.module.css';
export interface ChartDatum {
    label: string;
    value: number;
}
export interface ChartProps extends DOMProps<HTMLElement> {
    label: string;
    data: ChartDatum[];
    variant?: 'line' | 'bar' | 'sparkline';
    height?: number;
    unit?: string;
}
export function Chart({ label, data, variant = 'line', height = 220, unit = '', className, ...props }: ChartProps) {
    const { t } = useCyberUI();
    const id = useId();
    const compact = variant === 'sparkline';
    const axes = <><CartesianGrid stroke="var(--cyber-line)" strokeDasharray="3 6" vertical={false}/><XAxis dataKey="label" stroke="var(--cyber-muted)" tickLine={false} axisLine={false} fontSize={11}/><YAxis stroke="var(--cyber-muted)" tickLine={false} axisLine={false} fontSize={11} width={36}/></>;
    return <figure {...props} className={cx(s.chart, className)} style={{ margin: 0, ...props.style }} aria-labelledby={id}>
    <figcaption id={id} className={fieldStyles.label}>{label}</figcaption><div className={s.plot} style={{ height: compact ? 64 : height }} role="img" aria-label={`${label}: ${data.map(d => `${d.label} ${d.value}${unit}`).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        {variant === 'bar' ? <BarChart data={data} accessibilityLayer margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>{axes}<ChartTooltip contentStyle={{ border: '1px solid var(--cyber-ink)', background: 'var(--cyber-bg)', color: 'var(--cyber-ink)' }}/><Bar dataKey="value" name={label} fill="var(--cyber-accent)" isAnimationActive={false}/></BarChart> : <LineChart data={data} accessibilityLayer margin={compact ? { top: 8, right: 2, bottom: 8, left: 2 } : { top: 20, right: 8, left: 0, bottom: 0 }}>{!compact && axes}{!compact && <ChartTooltip contentStyle={{ border: '1px solid var(--cyber-ink)', background: 'var(--cyber-bg)', color: 'var(--cyber-ink)' }}/>}<Line dataKey="value" name={label} stroke="var(--cyber-ink)" strokeWidth={2} dot={compact ? false : { r: 3, fill: 'var(--cyber-bg)' }} activeDot={{ r: 5 }} isAnimationActive={false}/></LineChart>}
      </ResponsiveContainer>
    </div><details><summary>{t('View exact values', '查看精确数值')}</summary><Table label={label} rows={data.map((d, i) => ({ ...d, id: String(i) }))} columns={[{ key: 'label', label: t('Period', '时段') }, { key: 'value', label: unit || t('Value', '数值') }]}/></details>
  </figure>;
}
