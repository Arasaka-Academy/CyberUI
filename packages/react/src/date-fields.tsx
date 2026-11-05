import { useId, useState, type ChangeEvent, type InputHTMLAttributes, type Ref } from 'react';
import * as A from 'react-aria-components';
import { parseDate, parseTime } from '@internationalized/date';
import { Button, Icon } from './foundation';
import { Input } from './forms';
import { cx, useControllableState, type DOMProps } from './shared';
import { useCyberUI } from './provider';
import s from './ui.module.css';

export interface DatePickerProps extends DOMProps { label: string; value?: string|null; defaultValue?: string; onChange?: (date:string|null)=>void; isDisabled?: boolean; isRequired?: boolean; name?:string }
function date(value?:string|null) { try { return value?parseDate(value):null; } catch { return null; } }
function time(value?:string|null) { try { return value?parseTime(value):null; } catch { return null; } }
export function CalendarBody() {
  const {t}=useCyberUI();
  return <><header className={s.calendarHead}><Button slot="previous" icon="back" size="sm" aria-label={t('Previous month','上个月')}/><A.Heading/><Button slot="next" icon="forward" size="sm" aria-label={t('Next month','下个月')}/></header>
    <A.CalendarGrid className={s.calendarGrid}><A.CalendarGridHeader>{day=><A.CalendarHeaderCell>{day}</A.CalendarHeaderCell>}</A.CalendarGridHeader><A.CalendarGridBody>{day=><A.CalendarCell date={day} className={s.calendarCell}/>}</A.CalendarGridBody></A.CalendarGrid>
  </>;
}
export function DatePicker({ label,value,defaultValue,onChange,className,...props }: DatePickerProps) {
  return <A.DatePicker {...props} value={value===undefined?undefined:date(value)} defaultValue={date(defaultValue)} onChange={v=>onChange?.(v?.toString()??null)} className={cx(s.field,className)}>
    <A.Label className={s.label}>{label}</A.Label><A.Group className={s.inputRow}><A.DateInput className={s.dateInput}>{segment=><A.DateSegment segment={segment} className={s.dateSegment}/>}</A.DateInput><Button icon="calendar" aria-label={label}/></A.Group>
    <A.Popover className={s.popover}><A.Dialog aria-label={label}><A.Calendar className={s.calendar}><CalendarBody/></A.Calendar></A.Dialog></A.Popover><A.FieldError className={s.error}/>
  </A.DatePicker>;
}
export function Calendar({ label,value,defaultValue='2026-10-30',onChange,isDisabled,className,...props }: DatePickerProps) {
  return <A.Calendar {...props} aria-label={label} value={value===undefined?undefined:date(value)} defaultValue={date(defaultValue)??undefined} onChange={v=>onChange?.(v.toString())} isDisabled={isDisabled} className={cx(s.calendar,className)}><CalendarBody/></A.Calendar>;
}
export function TimePicker({ label,value,defaultValue='17:46',onChange,className,...props }: DatePickerProps) {
  return <A.TimeField {...props} value={value===undefined?undefined:time(value)} defaultValue={time(defaultValue)} onChange={v=>onChange?.(v?.toString()??null)} hourCycle={24} className={cx(s.field,className)}>
    <A.Label className={s.label}>{label}</A.Label><A.DateInput className={s.dateInput}>{segment=><A.DateSegment segment={segment} className={s.dateSegment}/>}</A.DateInput><A.FieldError className={s.error}/>
  </A.TimeField>;
}
export interface ColorPickerProps extends DOMProps { label: string; value?: string; defaultValue?: string; onChange?: (value:string)=>void; isDisabled?: boolean; inputRef?:Ref<HTMLInputElement> }
export function ColorPicker({ label,value,defaultValue='#E0574B',onChange,isDisabled,className,inputRef,...props }: ColorPickerProps) {
  const [color,setColor]=useControllableState(value,defaultValue,onChange); const id=useId(); const [draft,setDraft]=useState<string>();
  const valid=draft===undefined||/^#[0-9a-f]{6}$/i.test(draft);
  return <div {...props} className={cx(s.field,className)}><label htmlFor={id} className={s.label}>{label}</label><div className={s.inputRow}>
    <input id={id} type="color" className={s.colorSwatch} value={color} disabled={isDisabled} onChange={e=>{setColor(e.target.value);setDraft(undefined);}}/>
    <Input ref={inputRef} aria-label={`${label} HEX`} value={draft??color} disabled={isDisabled} aria-invalid={!valid} onChange={e=>{setDraft(e.target.value);if(/^#[0-9a-f]{6}$/i.test(e.target.value))setColor(e.target.value);}} onBlur={()=>setDraft(undefined)}/>
  </div>{!valid&&<span role="alert" className={s.error}>HEX: #RRGGBB</span>}</div>;
}
export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>,'onChange'|'type'|'value'|'defaultValue'|'disabled'> { label: string; value?:File[]; defaultValue?:File[]; onChange?: (files:File[])=>void; isDisabled?: boolean; description?: string; ref?:Ref<HTMLInputElement> }
export function FileUpload({ label,accept,multiple,onChange,value,defaultValue=[],isDisabled,description,className,...props }: FileUploadProps) {
  const {t}=useCyberUI(); const [files,setFiles]=useControllableState(value,defaultValue,onChange); const [dragging,setDragging]=useState(false); const [error,setError]=useState(''); const generated=useId(); const id=props.id??generated;
  const receive=(incoming:File[])=>{
    const allowed=(file:File)=>!accept||accept.split(',').some(rule=>{const r=rule.trim().toLowerCase();return r.startsWith('.')?file.name.toLowerCase().endsWith(r):r.endsWith('/*')?file.type.startsWith(r.slice(0,-1)):file.type===r;});
    if(incoming.some(f=>!allowed(f))){setError(t('Unsupported file type. Choose a matching file.','文件类型不支持，请选择符合格式的文件。'));return false;}
    const chosen=multiple?incoming:incoming.slice(0,1); setFiles(chosen);setError('');return true;
  };
  return <div className={cx(s.field,className)}><label className={s.label} htmlFor={id}>{label}</label><div className={s.fileDrop} data-dragging={dragging}
    onDragOver={e=>{if(!isDisabled){e.preventDefault();setDragging(true);}}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);if(!isDisabled)receive(Array.from(e.dataTransfer.files));}}>
    <Icon name="download" size={28}/><span>{t('Drop files here or choose a file','拖入文件，或选择文件')}</span>
    <input {...props} type="file" id={id} accept={accept} multiple={multiple} disabled={isDisabled} aria-invalid={!!error} aria-describedby={[description?`${id}-help`:null,error?`${id}-error`:null,props['aria-describedby']].filter(Boolean).join(' ')||undefined} onChange={(e:ChangeEvent<HTMLInputElement>)=>{if(!receive(Array.from(e.target.files??[])))e.target.value='';}}/>
    {files.map(f=><span key={f.name} className={s.helper}>{f.name} · {Math.ceil(f.size/1024)} KB</span>)}
  </div>{description&&<span className={s.helper} id={`${id}-help`}>{description}</span>}{error&&<span id={`${id}-error`} className={s.error} role="alert">{error}</span>}</div>;
}
export type NativeDateInputProps = InputHTMLAttributes<HTMLInputElement>;
