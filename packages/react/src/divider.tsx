'use client';
import { type NativeProps, cx } from './shared';
import s from './divider.module.css';
export function Divider(props: NativeProps<HTMLHRElement>) { return <hr {...props} className={cx(s.divider, props.className)}/>; }
