'use client';
import { type InputHTMLAttributes, type Ref, useState, useId, useRef, useImperativeHandle, useLayoutEffect } from 'react';
import { useCyberUI } from './provider';
import { useControllableState, cx } from './shared';
import s from './file-upload.module.css';
import { Icon } from './icon';
import fieldStyles from './field.module.css';
import { useFormReset } from './use-form-reset';
export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value' | 'defaultValue' | 'disabled'> {
    label: string;
    value?: File[];
    defaultValue?: File[];
    onChange?: (files: File[]) => void;
    isDisabled?: boolean;
    description?: string;
    ref?: Ref<HTMLInputElement>;
}
function syncFiles(input: HTMLInputElement | null, files: File[]) {
    if (!input || (input.files?.length === files.length && files.every((file, index) => input.files?.[index] === file))) return;
    if (!files.length) { input.value = ''; return; }
    if (typeof DataTransfer === 'undefined') return;
    const transfer = new DataTransfer();
    files.forEach(file => transfer.items.add(file));
    input.files = transfer.files;
}
export function FileUpload({ label, accept, multiple, onChange, value, defaultValue = [], isDisabled, description, className, ref, ...props }: FileUploadProps) {
    const { t } = useCyberUI();
    const [files, setFiles] = useControllableState(value, defaultValue, onChange);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState('');
    const input = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => input.current!);
    useLayoutEffect(() => { syncFiles(input.current, files); }, [files]);
    useFormReset(input, () => {
        syncFiles(input.current, value ?? defaultValue);
        if (value === undefined) setFiles(defaultValue);
        setError('');
        setDragging(false);
    }, props.form);
    const generated = useId();
    const id = props.id ?? generated;
    const receive = (incoming: File[]) => {
        const allowed = (file: File) => !accept || accept.split(',').some(rule => { const r = rule.trim().toLowerCase(); return r.startsWith('.') ? file.name.toLowerCase().endsWith(r) : r.endsWith('/*') ? file.type.startsWith(r.slice(0, -1)) : file.type === r; });
        if (incoming.some(f => !allowed(f))) {
            syncFiles(input.current, files);
            setError(t('Unsupported file type. Choose a matching file.', '文件类型不支持，请选择符合格式的文件。'));
            return false;
        }
        const chosen = multiple ? incoming : incoming.slice(0, 1);
        syncFiles(input.current, chosen);
        setFiles(chosen);
        if (value !== undefined) syncFiles(input.current, value);
        setError('');
        return true;
    };
    return <div className={cx(fieldStyles.field, className)}><label className={fieldStyles.label} htmlFor={id}>{label}</label><div className={s.fileDrop} data-dragging={dragging} onDragOver={e => { if (!isDisabled) {
        e.preventDefault();
        setDragging(true);
    } }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); if (!isDisabled)
        receive(Array.from(e.dataTransfer.files)); }}>
    <Icon name="download" size={28}/><span>{t('Drop files here or choose a file', '拖入文件，或选择文件')}</span>
    <input {...props} ref={input} type="file" id={id} accept={accept} multiple={multiple} disabled={isDisabled} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={[description ? `${id}-help` : null, error ? `${id}-error` : null, props['aria-describedby']].filter(Boolean).join(' ') || undefined} onChange={e => receive(Array.from(e.target.files ?? []))}/>
    {files.map(f => <span key={f.name} className={fieldStyles.helper}>{f.name} · {Math.ceil(f.size / 1024)} KB</span>)}
  </div>{description && <span className={fieldStyles.helper} id={`${id}-help`}>{description}</span>}{error && <span id={`${id}-error`} className={fieldStyles.error} role="alert">{error}</span>}</div>;
}
