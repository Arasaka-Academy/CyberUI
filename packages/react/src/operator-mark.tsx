'use client';
import s from './operator-mark.module.css';
export function OperatorMark({ src, alt }: {
    src?: string;
    alt?: string;
}) { return <span aria-hidden={src ? undefined : true} data-slot="operator-mark" className={s.operatorMark}>{src ? <img src={src} alt={alt ?? ""}/> : <svg viewBox="0 0 24 24" fill="currentColor" width="80%" height="80%"><path d="M2 3h20v5h-6v8h6v5H2v-5h6V8H2Z"/></svg>}</span>; }
