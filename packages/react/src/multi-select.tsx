'use client';
import { type SelectProps } from './select';
import { useControllableState, cx } from './shared';
import { useId } from 'react';
import { useCyberUI } from './provider';
import s from './multi-select.module.css';
import * as A from 'react-aria-components';
import { Icon } from './icon';
import { Tag } from './tag';
export interface MultiSelectProps extends Omit<SelectProps, 'value' | 'defaultValue' | 'onChange'> {
    value?: string[];
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
}
export function MultiSelect({ label, options, value, defaultValue = [], onChange, isDisabled, description, className, name, buttonRef, placeholder, ...props }: MultiSelectProps) {
    const [selected, setSelected] = useControllableState(value, defaultValue, onChange);
    const id = useId();
    const { t } = useCyberUI();
    return <div {...props} className={cx(s.field, className)}><span id={id} className={s.label}>{label}</span>
    <A.DialogTrigger><A.Button ref={buttonRef} className={s.selectButton} aria-labelledby={id} isDisabled={isDisabled}><span>{selected.length ? t(`${selected.length} selected`, `${selected.length} 项已选`) : placeholder ?? t('Choose options', '选择选项')}</span><Icon name="down" size={16}/></A.Button>
      <A.Popover className={s.popover}><A.ListBox aria-label={label} selectionMode="multiple" escapeKeyBehavior="none" disabledKeys={options.filter(o => o.disabled).map(o => o.id)} selectedKeys={new Set(selected)} onSelectionChange={keys => setSelected(keys === 'all' ? options.map(o => o.id) : Array.from(keys, String))} items={options} className={s.listBox}>
        {o => <A.ListBoxItem id={o.id} textValue={o.label} className={s.listItem}>{({ isSelected }) => <><span aria-hidden>{isSelected ? '■' : '□'}</span>{o.label}</>}</A.ListBoxItem>}
      </A.ListBox></A.Popover>
    </A.DialogTrigger>
    <div className={s.buttonGroup}>{selected.map(id => <Tag key={id} onRemove={isDisabled ? undefined : () => setSelected(selected.filter(v => v !== id))}>{options.find(o => o.id === id)?.label ?? id}</Tag>)}</div>
    {name && selected.map(id => <input key={id} type="hidden" name={name} value={id}/>)}{description && <span className={s.helper}>{description}</span>}
  </div>;
}
