// Generated from packages/react/src/ascii-cover.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type NativeProps, cx } from "./shared";
import s from "./ascii-cover.module.css";
export type AsciiVariant = 'ascii' | 'braille' | 'blocks' | 'halftone' | 'contour';
export interface AsciiCoverProps extends Omit<NativeProps<HTMLDivElement>, 'color'> {
    title?: string;
    seed?: number;
    variant?: AsciiVariant;
    color?: boolean;
    artwork?: 'city' | 'orbit' | 'pyramid' | 'circuit';
    badge?: string;
}
export function AsciiCover({ title = 'NEUROMANCER', seed = 7, variant = 'braille', color = true, artwork = 'city', badge, className, ...props }: AsciiCoverProps) {
    const alphabets = { ascii: ' .,:;+xX#@', braille: ' ⠁⠃⠉⠋⠓⠛⠟⠿⣿', blocks: ' ░░▒▒▓▓███', halftone: ' ·∙•●●◉◉██', contour: '  ..─┼┤╬▓█' };
    const rows = Array.from({ length: 32 }, (_, y) => Array.from({ length: 28 }, (_, x) => {
        const n = ((x * 17 + y * 31 + seed * 13) % 97) / 97;
        const dx = x - 14, dy = y - 15;
        const v = artwork === 'orbit' ? Math.abs(Math.sin(Math.sqrt(dx * dx + dy * dy) / 2 + seed)) * 0.8 + n * .2 : artwork === 'pyramid' ? (y > Math.abs(dx) * 1.45 ? 1 - n * .45 : n * .3) : artwork === 'circuit' ? ((x + seed) % 7 < 2 || (y + seed) % 8 < 2 ? .8 : n * .25) : (y > 32 - ((x * 7 + seed * 3) % 21 + 5) ? (x + y) % 3 === 0 ? .95 : .55 : n * .32);
        return alphabets[variant][Math.min(9, Math.floor(v * 10))];
    }).join(''));
    return <div {...props} role="img" aria-label={title} data-slot="ascii-cover" className={cx(s.cover, className)} data-color={color} data-art={artwork}>
    <div aria-hidden data-slot="cover-decor" className={s.coverDecor}><span>{title.slice(0, 24)}</span><span>FILE // {String(seed).padStart(4, '0')}</span></div>
    <pre aria-hidden>{rows.map((line, i) => <span key={i} style={color ? { color: i < 10 ? 'var(--cyber-accent)' : i < 20 ? 'var(--cyber-muted)' : 'var(--cyber-ink)' } : undefined}>{line}{'\n'}</span>)}</pre>
    {badge && <span data-slot="cover-badge" className={s.coverBadge}>{badge}</span>}
  </div>;
}
