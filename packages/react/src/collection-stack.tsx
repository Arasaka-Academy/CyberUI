'use client';
import { type ButtonHTMLAttributes, type Ref } from 'react';
import { useCyberUI } from './provider';
import { cx } from './shared';
import s from './collection-stack.module.css';
import { AsciiCover } from './ascii-cover';
import { Icon } from './icon';
export interface CollectionStackProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
    ref?: Ref<HTMLButtonElement>;
    title: string;
    count: number;
    seed?: number;
    onOpen?: () => void;
    className?: string;
}
export function CollectionStack({ title, count, seed = 3, onOpen, className, ...props }: CollectionStackProps) { const { t } = useCyberUI(); return <button {...props} type="button" className={cx(s.collection, className)} onClick={onOpen}><span className={s.stackArt}><AsciiCover title={title} seed={seed} color={false}/><span className={s.stackLabel}><Icon name="folder"/> {t('CACHE', '收藏集')} // {count}</span></span><span>{title}</span></button>;}
 // {count}</span></span><span>{title}</span></button>; }
