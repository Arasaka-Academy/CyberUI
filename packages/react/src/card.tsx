'use client';
import { type NativeProps, cx } from './shared';
import { type ReactNode } from 'react';
import s from './card.module.css';
export interface CardProps extends NativeProps<HTMLElement> {
    title?: string;
    description?: string;
    footer?: ReactNode;
}
export function Card({ title, description, footer, children, className, ...props }: CardProps) {
    return <article {...props} className={cx(s.card, className)}>{title && <h3>{title}</h3>}{description && <p>{description}</p>}{children}{footer && <footer style={{ marginTop: 18 }}>{footer}</footer>}</article>;
}
