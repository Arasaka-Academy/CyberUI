'use client';
import { type ButtonHTMLAttributes, type Ref } from 'react';
import { cx } from './shared';
import s from './launcher-tile.module.css';
import { Icon } from './icon';
export interface LauncherTileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
    ref?: Ref<HTMLButtonElement>;
    title: string;
    subtitle?: string;
    icon?: string;
    onPress?: () => void;
    disabled?: boolean;
}
export function LauncherTile({ title, subtitle, icon = 'deck', onPress, disabled, className, ...props }: LauncherTileProps) { return <button type="button" {...props} disabled={disabled} onClick={onPress} className={cx(s.launcher, className)}><Icon name={icon} size={26}/><span><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span><Icon name="forward" size={16}/></button>; }
