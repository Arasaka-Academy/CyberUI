'use client';
import { type SelectProps } from './select';
import { useControllableState, cx } from './shared';
import { useId, useRef, useImperativeHandle } from 'react';
import { useFormReset } from './use-form-reset';
import { useCyberUI } from './provider';
import s from './multi-select.module.css';
import * as A from 'react-aria-components';
import { Icon } from './icon';
import { Tag } from './tag';
import fieldStyles from './field.module.css';
import choiceStyles from './choice.module.css';
import popoverStyles from './popover.module.css';
export interface MultiSelectProps extends Omit<SelectProps, 'value' | 'defaultValue' | 'onChange'> {
    value?: string[];
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
}
export function MultiSelect({ label, options, value, defaultValue = [], onChange, isDisabled, description, className, name, buttonRef, placeholder, ...props }: MultiSelectProps) {
    const [selected, setSelected] = useControllableState(value, defaultValue, onChange);
    const trigger = useRef<HTMLButtonElement>(null);
    useImperativeHandle(buttonRef, () => trigger.current!);
    useFormReset(trigger, () => { if (value === undefined) setSelected(defaultValue); });
    const id = useId();
    const { t } = useCyberUI();
    return <div {...props} className={cx(fieldStyles.field, className)}><span id={id} className={fieldStyles.label}>{label}</span>
    <A.DialogTrigger><A.Button ref={trigger} className={choiceStyles.selectButton} aria-labelledby={id} aria-describedby={[description ? `${id}-help` : null, props['aria-describedby']].filter(Boolean).join(' ') || undefined} isDisabled={isDisabled}><span>{selected.length ? t(`${selected.length} selected`, `${selected.length} 项已选`) : placeholder ?? t('Choose options', '选择选项')}</span><Icon name="down" size={16}/></A.Button>
      <A.Popover className={popoverStyles.popover}><A.ListBox aria-label={label} selectionMode="multiple" escapeKeyBehavior="none" disabledKeys={options.filter(o => o.disabled).map(o => o.id)} selectedKeys={new Set(selected)} onSelectionChange={keys => setSelected(keys === 'all' ? options.map(o => o.id) : Array.from(keys, String))} items={options} className={choiceStyles.listBox}>
        {o => <A.ListBoxItem id={o.id} textValue={o.label} className={choiceStyles.listItem}>{({ isSelected }) => <><span aria-hidden>{isSelected ? '■' : '□'}</span>{o.label}</>}</A.ListBoxItem>}
      </A.ListBox></A.Popover>
    </A.DialogTrigger>
    <div className={s.buttonGroup}>{selected.map(id => <Tag key={id} onRemove={isDisabled ? undefined : () => setSelected(selected.filter(v => v !== id))}>{options.find(o => o.id === id)?.label ?? id}</Tag>)}</div>
    {name && selected.map(id => <input key={id} type="hidden" name={name} value={id} disabled={isDisabled}/>)}{description && <span id={`${id}-help`} className={fieldStyles.helper}>{description}</span>}
  </div>;
}
