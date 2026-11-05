// Generated from packages/react/src/telemetry-panel.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type NativeProps, cx } from "./shared";
import { type ReactNode } from 'react';
import { Panel } from "./panel";
import s from "./telemetry-panel.module.css";
import { Progress } from "./progress";
export interface TelemetryMetric {
    label: string;
    value: string | number;
    percentage?: number;
    detail?: string;
}
export interface TelemetryPanelProps extends NativeProps<HTMLElement> {
    title?: string;
    metrics: TelemetryMetric[];
    className?: string;
    children?: ReactNode;
}
export function TelemetryPanel({ title = 'SYSTEM // TELEMETRY', metrics, className, children, ...props }: TelemetryPanelProps) { return <Panel {...props} shape="header" title={title} className={cx(s.telemetry, className)}>{metrics.map(m => <div className={s.metric} key={m.label}><div><span>{m.label}</span><strong>{m.value}</strong></div>{m.percentage !== undefined && <Progress label={m.label} value={m.percentage}/>} {m.detail && <span className={s.micro}>{m.detail}</span>}</div>)}{children}</Panel>; }
