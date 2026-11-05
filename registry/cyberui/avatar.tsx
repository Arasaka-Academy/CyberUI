// Generated from packages/react/src/avatar.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type NativeProps, cx } from "./shared";
import { useState } from 'react';
import s from "./avatar.module.css";
export interface AvatarProps extends NativeProps<HTMLSpanElement> {
    src?: string;
    name: string;
    size?: number;
}
export function Avatar({ src, name, size = 52, className, style, ...props }: AvatarProps) {
    const [failedSrc, setFailedSrc] = useState<string>();
    return <span {...props} role="img" aria-label={name} className={cx(s.avatar, className)} style={{ width: size, height: size, ...style }}>
    {src && failedSrc !== src ? <img src={src} alt="" onError={() => setFailedSrc(src)}/> : name.slice(0, 2).toUpperCase()}
  </span>;
}
