'use client';
import { type SelectProps } from './select';
import { type Ref } from 'react';
import { useCyberUI } from './provider';
import * as A from 'react-aria-components';
import { cx } from './shared';
import s from './combobox.module.css';
import { Icon } from './icon';
import { type Option } from './option';
export interface ComboboxProps extends SelectProps {
    inputRef?: Ref<HTMLInputElement>;
}
export function Combobox({ label, options, value, defaultValue, onChange, placeholder, isDisabled, name, description, className, buttonRef, inputRef, ...props }: ComboboxProps) {
    const { t } = useCyberUI();
    return <A.ComboBox {...props} defaultItems={options} disabledKeys={options.filter(o => o.disabled).map(o => o.id)} selectedKey={value} defaultSelectedKey={defaultValue} onSelectionChange={key => onChange?.(key === null ? '' : String(key))} isDisabled={isDisabled} name={name} className={cx(s.field, className)}>
    <A.Label className={s.label}>{label}</A.Label><div className={s.inputRow}><A.Input ref={inputRef} className={s.input} placeholder={placeholder}/><A.Button ref={buttonRef} className={s.selectButton} style={{ width: 44 }} aria-label={t('Show suggestions', '显示选项')}><Icon name="down" size={16}/></A.Button></div>
    <A.Popover className={s.popover}><A.ListBox className={s.listBox} renderEmptyState={() => t('No matches', '没有匹配项')}>{(o: Option) => <A.ListBoxItem id={o.id} textValue={o.label} className={s.listItem}>{o.label}</A.ListBoxItem>}</A.ListBox></A.Popover>
    {description && <A.Text slot="description" className={s.helper}>{description}</A.Text>}
  </A.ComboBox>;
}
