'use client';
import { cx } from './shared';
import s from './barcode.module.css';
export function Barcode({ label, className }: {
    label?: string;
    className?: string;
}) {
    return <span role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} data-slot="barcode" className={cx(s.barcode, className)}>{Array.from({ length: 42 }, (_, i) => <i key={i} style={{ width: [2, 1, 4, 2, 3, 1, 1][i % 7], marginRight: [2, 3, 1, 4][i % 4] }}/>)}</span>;
}
