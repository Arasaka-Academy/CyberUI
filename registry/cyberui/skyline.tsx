// Generated from packages/react/src/skyline.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { cx } from "./shared";
import s from "./skyline.module.css";
export function Skyline({ className }: {
    className?: string;
}) {
    return <svg data-slot="skyline" viewBox="0 0 600 240" preserveAspectRatio="none" aria-hidden className={cx(s.skyline, className)}>{Array.from({ length: 23 }, (_, i) => { const height = 36 + (i * 47) % 165; return <g key={i}><path d={`M${i * 27} 240V${240 - height}h23v${height}`} fill="currentColor" opacity={i % 2 ? .35 : .6}/>{Array.from({ length: Math.floor(height / 18) }, (_, j) => <path key={j} d={`M${i * 27 + 5} ${250 - height + j * 18}h4v6h-4zm10 0h4v6h-4z`} fill="var(--cyber-muted)" opacity={((i + j) % 3 + 1) / 4}/>)}</g>; })}<path d="M390 0 440 240M485 0 450 240" stroke="currentColor" strokeWidth="5" opacity=".5"/><circle cx="442" cy="105" r="28" fill="currentColor" opacity=".6"/></svg>;
}
