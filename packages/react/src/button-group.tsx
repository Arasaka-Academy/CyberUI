'use client';
import { type NativeProps, cx } from './shared';
import s from './button-group.module.css';
export function ButtonGroup({ className, ...props }: NativeProps<HTMLDivElement>) { return <div role="group" {...props} className={cx(s.buttonGroup, className)}/>; }
