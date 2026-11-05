import { cloneElement, forwardRef, isValidElement, useId, useState, type InputHTMLAttributes, type ReactElement, type ReactNode, type TextareaHTMLAttributes, type Ref } from 'react';
import * as A from 'react-aria-components';
import { Button, Icon, IconButton, Tag } from './foundation';
import { useCyberUI } from './provider';
import { cx, useControllableState, type DOMProps } from './shared';
import s from './ui.module.css';

export interface FieldProps extends DOMProps { label: string; description?: string; error?: string; isRequired?: boolean; children: ReactNode; htmlFor?: string }
export function Field({ label,description,error,isRequired,children,htmlFor,className,...props }: FieldProps) {
  const generated = useId(); const child=isValidElement(children)?children as ReactElement<InputHTMLAttributes<HTMLInputElement>>:null; const id=htmlFor??child?.props.id??generated;
  const described = [child?.props['aria-describedby'],description?`${id}-help`:null,error?`${id}-error`:null].filter(Boolean).join(' ')||undefined;
  return <div {...props} className={cx(s.field,className)}>
    <label className={s.label} htmlFor={id}>{label}{isRequired&&<span aria-hidden> *</span>}</label>
    {child?cloneElement(child, { id,'aria-describedby':described,'aria-invalid':error?true:child.props['aria-invalid'] }):children}
    {description&&<span className={s.helper} id={`${id}-help`}>{description}</span>}
    {error&&<span className={s.error} id={`${id}-error`} role="alert">{error}</span>}
  </div>;
}
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; description?: string; error?: string; wrapperClassName?: string }
export const Input = forwardRef<HTMLInputElement,InputProps>(function Input({ label,description,error,wrapperClassName,className,id,...props },ref) {
  const generated=useId(); const fieldId=id??generated;
  const input=<input {...props} id={fieldId} ref={ref} className={cx(s.input,className)} aria-invalid={error?true:props['aria-invalid']}/>;
  return label?<Field label={label} htmlFor={fieldId} description={description} error={error} isRequired={props.required} className={wrapperClassName}>{input}</Field>:input;
});
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label: string; description?: string; error?: string }
export const Textarea = forwardRef<HTMLTextAreaElement,TextareaProps>(function Textarea({ label,description,error,className,id,...props },ref) {
  const generated=useId(); const fieldId=id??generated;
  return <Field label={label} htmlFor={fieldId} description={description} error={error} isRequired={props.required}>
    <textarea rows={4} {...props} ref={ref} id={fieldId} className={cx(s.input,className)}/>
  </Field>;
});
export interface NumberInputProps extends Omit<A.NumberFieldProps,'children'|'className'> { label: string; description?: string; className?: string; ref?:Ref<HTMLDivElement>; inputRef?:Ref<HTMLInputElement> }
export function NumberInput({ label,description,className,inputRef,...props }: NumberInputProps) {
  const {t}=useCyberUI();
  return <A.NumberField {...props} className={cx(s.field,className)}>
    <A.Label className={s.label}>{label}</A.Label>
    <A.Group className={s.inputRow}>
      <Button slot="decrement" aria-label={t('Decrease','减少')} corners="none">−</Button>
      <A.Input ref={inputRef} className={s.input}/>
      <Button slot="increment" aria-label={t('Increase','增加')} corners="none">+</Button>
    </A.Group>
    {description&&<A.Text slot="description" className={s.helper}>{description}</A.Text>}
    <A.FieldError className={s.error}/>
  </A.NumberField>;
}
export const PasswordInput = forwardRef<HTMLInputElement,InputProps>(function PasswordInput({ label='Password',description,error,id,className,...props },ref) {
  const [visible,setVisible]=useState(false); const generated=useId(); const fieldId=id??generated; const {t}=useCyberUI();
  return <div className={s.field}><label className={s.label} htmlFor={fieldId}>{label}</label>
    <div className={s.inputRow}><input {...props} ref={ref} id={fieldId} className={cx(s.input,className)} type={visible?'text':'password'} aria-invalid={error?true:props['aria-invalid']} aria-describedby={[props['aria-describedby'],description?`${fieldId}-help`:null,error?`${fieldId}-error`:null].filter(Boolean).join(' ')||undefined}/>
      <IconButton icon="eye" isDisabled={props.disabled} aria-label={visible?t('Hide password','隐藏密码'):t('Show password','显示密码')} aria-pressed={visible} onPress={()=>setVisible(!visible)}/>
    </div>{description&&<span id={`${fieldId}-help`} className={s.helper}>{description}</span>}{error&&<span role="alert" id={`${fieldId}-error`} className={s.error}>{error}</span>}
  </div>;
});
export interface CheckboxProps extends Omit<A.CheckboxProps,'children'|'className'> { label: string; className?: string }
export const Checkbox = forwardRef<HTMLLabelElement,CheckboxProps>(function Checkbox({ label,className,...props },ref) {
  return <A.Checkbox {...props} ref={ref} className={cx(s.choice,className)}><span aria-hidden className={s.checkBox}><Icon name="check" size={14}/></span><span>{label}</span></A.Checkbox>;
});
export interface Option { id: string; label: string; description?: string; disabled?: boolean }
export interface RadioGroupProps extends Omit<A.RadioGroupProps,'children'|'className'> { label: string; options: Option[]; className?: string; ref?:Ref<HTMLDivElement> }
export function RadioGroup({ label,options,className,...props }: RadioGroupProps) {
  return <A.RadioGroup {...props} className={cx(s.field,className)}><A.Label className={s.label}>{label}</A.Label>
    {options.map(o=><A.Radio key={o.id} value={o.id} isDisabled={o.disabled} className={cx(s.choice,s.radio)}><span aria-hidden className={s.checkBox}/>{o.label}</A.Radio>)}<A.FieldError className={s.error}/>
  </A.RadioGroup>;
}
export interface SwitchProps extends Omit<A.SwitchProps,'children'|'className'> { label: string; className?: string }
export const Switch = forwardRef<HTMLLabelElement,SwitchProps>(function Switch({ label,className,...props },ref) {
  return <A.Switch {...props} ref={ref} className={cx(s.choice,className)}><span aria-hidden className={s.switchTrack}><span className={s.switchKnob}/></span><span>{label}</span></A.Switch>;
});
export interface SelectProps extends DOMProps { label: string; options: Option[]; value?: string; defaultValue?: string; onChange?: (value:string)=>void; placeholder?: string; isDisabled?: boolean; name?: string; description?: string; buttonRef?:Ref<HTMLButtonElement> }
export function Select({ label,options,value,defaultValue,onChange,placeholder,isDisabled,name,description,className,buttonRef,...props }: SelectProps) {
  return <A.Select {...props} selectedKey={value} defaultSelectedKey={defaultValue} onSelectionChange={key=>onChange?.(String(key))} isDisabled={isDisabled} name={name} placeholder={placeholder} className={cx(s.field,className)}>
    <A.Label className={s.label}>{label}</A.Label><A.Button ref={buttonRef} className={s.selectButton}><A.SelectValue/><Icon name="down" size={16}/></A.Button>
    <A.Popover className={s.popover}><A.ListBox items={options} disabledKeys={options.filter(o=>o.disabled).map(o=>o.id)} className={s.listBox}>{o=><A.ListBoxItem id={o.id} textValue={o.label} className={s.listItem}>{o.label}</A.ListBoxItem>}</A.ListBox></A.Popover>
    {description&&<A.Text slot="description" className={s.helper}>{description}</A.Text>}
  </A.Select>;
}
export interface ComboboxProps extends SelectProps {inputRef?:Ref<HTMLInputElement>}
export function Combobox({ label,options,value,defaultValue,onChange,placeholder,isDisabled,name,description,className,buttonRef,inputRef,...props }: ComboboxProps) {
  const {t}=useCyberUI();
  return <A.ComboBox {...props} defaultItems={options} disabledKeys={options.filter(o=>o.disabled).map(o=>o.id)} selectedKey={value} defaultSelectedKey={defaultValue} onSelectionChange={key=>onChange?.(key===null?'':String(key))} isDisabled={isDisabled} name={name} className={cx(s.field,className)}>
    <A.Label className={s.label}>{label}</A.Label><div className={s.inputRow}><A.Input ref={inputRef} className={s.input} placeholder={placeholder}/><A.Button ref={buttonRef} className={s.selectButton} style={{width:44}} aria-label={t('Show suggestions','显示选项')}><Icon name="down" size={16}/></A.Button></div>
    <A.Popover className={s.popover}><A.ListBox className={s.listBox} renderEmptyState={()=>t('No matches','没有匹配项')}>{(o:Option)=><A.ListBoxItem id={o.id} textValue={o.label} className={s.listItem}>{o.label}</A.ListBoxItem>}</A.ListBox></A.Popover>
    {description&&<A.Text slot="description" className={s.helper}>{description}</A.Text>}
  </A.ComboBox>;
}
export interface MultiSelectProps extends Omit<SelectProps,'value'|'defaultValue'|'onChange'> { value?: string[]; defaultValue?: string[]; onChange?: (value:string[])=>void }
export function MultiSelect({ label,options,value,defaultValue=[],onChange,isDisabled,description,className,name,buttonRef,placeholder,...props }: MultiSelectProps) {
  const [selected,setSelected]=useControllableState(value,defaultValue,onChange); const id=useId(); const {t}=useCyberUI();
  return <div {...props} className={cx(s.field,className)}><span id={id} className={s.label}>{label}</span>
    <A.DialogTrigger><A.Button ref={buttonRef} className={s.selectButton} aria-labelledby={id} isDisabled={isDisabled}><span>{selected.length?t(`${selected.length} selected`,`${selected.length} 项已选`):placeholder??t('Choose options','选择选项')}</span><Icon name="down" size={16}/></A.Button>
      <A.Popover className={s.popover}><A.ListBox aria-label={label} selectionMode="multiple" escapeKeyBehavior="none" disabledKeys={options.filter(o=>o.disabled).map(o=>o.id)} selectedKeys={new Set(selected)} onSelectionChange={keys=>setSelected(keys==='all'?options.map(o=>o.id):Array.from(keys,String))} items={options} className={s.listBox}>
        {o=><A.ListBoxItem id={o.id} textValue={o.label} className={s.listItem}>{({isSelected})=><><span aria-hidden>{isSelected?'■':'□'}</span>{o.label}</>}</A.ListBoxItem>}
      </A.ListBox></A.Popover>
    </A.DialogTrigger>
    <div className={s.buttonGroup}>{selected.map(id=><Tag key={id} onRemove={isDisabled?undefined:()=>setSelected(selected.filter(v=>v!==id))}>{options.find(o=>o.id===id)?.label??id}</Tag>)}</div>
    {name&&selected.map(id=><input key={id} type="hidden" name={name} value={id}/>)}{description&&<span className={s.helper}>{description}</span>}
  </div>;
}
export interface SliderProps extends Omit<A.SliderProps<number>,'children'|'className'> { label: string; className?: string; ref?:Ref<HTMLDivElement> }
export function Slider({ label,className,...props }: SliderProps) {
  return <A.Slider {...props} className={cx(s.field,className)}><div className={s.sliderHead}><A.Label className={s.label}>{label}</A.Label><A.SliderOutput/></div><A.SliderTrack className={s.sliderTrack}><A.SliderThumb className={s.sliderThumb}/></A.SliderTrack></A.Slider>;
}
