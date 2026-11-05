// Generated from packages/react/src/file-upload.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type InputHTMLAttributes, type Ref, useState, useId, type ChangeEvent } from 'react';
import { useCyberUI } from "./provider";
import { useControllableState, cx } from "./shared";
import s from "./file-upload.module.css";
import { Icon } from "./icon";
export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value' | 'defaultValue' | 'disabled'> {
    label: string;
    value?: File[];
    defaultValue?: File[];
    onChange?: (files: File[]) => void;
    isDisabled?: boolean;
    description?: string;
    ref?: Ref<HTMLInputElement>;
}
export function FileUpload({ label, accept, multiple, onChange, value, defaultValue = [], isDisabled, description, className, ...props }: FileUploadProps) {
    const { t } = useCyberUI();
    const [files, setFiles] = useControllableState(value, defaultValue, onChange);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState('');
    const generated = useId();
    const id = props.id ?? generated;
    const receive = (incoming: File[]) => {
        const allowed = (file: File) => !accept || accept.split(',').some(rule => { const r = rule.trim().toLowerCase(); return r.startsWith('.') ? file.name.toLowerCase().endsWith(r) : r.endsWith('/*') ? file.type.startsWith(r.slice(0, -1)) : file.type === r; });
        if (incoming.some(f => !allowed(f))) {
            setError(t('Unsupported file type. Choose a matching file.', '文件类型不支持，请选择符合格式的文件。'));
            return false;
        }
        const chosen = multiple ? incoming : incoming.slice(0, 1);
        setFiles(chosen);
        setError('');
        return true;
    };
    return <div className={cx(s.field, className)}><label className={s.label} htmlFor={id}>{label}</label><div className={s.fileDrop} data-dragging={dragging} onDragOver={e => { if (!isDisabled) {
        e.preventDefault();
        setDragging(true);
    } }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); if (!isDisabled)
        receive(Array.from(e.dataTransfer.files)); }}>
    <Icon name="download" size={28}/><span>{t('Drop files here or choose a file', '拖入文件，或选择文件')}</span>
    <input {...props} type="file" id={id} accept={accept} multiple={multiple} disabled={isDisabled} aria-invalid={!!error} aria-describedby={[description ? `${id}-help` : null, error ? `${id}-error` : null, props['aria-describedby']].filter(Boolean).join(' ') || undefined} onChange={(e: ChangeEvent<HTMLInputElement>) => { if (!receive(Array.from(e.target.files ?? [])))
        e.target.value = ''; }}/>
    {files.map(f => <span key={f.name} className={s.helper}>{f.name} · {Math.ceil(f.size / 1024)} KB</span>)}
  </div>{description && <span className={s.helper} id={`${id}-help`}>{description}</span>}{error && <span id={`${id}-error`} className={s.error} role="alert">{error}</span>}</div>;
}
