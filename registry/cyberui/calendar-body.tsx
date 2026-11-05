// Generated from packages/react/src/calendar-body.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { useCyberUI } from "./provider";
import s from "./calendar-body.module.css";
import { Button } from "./button";
import * as A from 'react-aria-components';
export function CalendarBody() {
    const { t } = useCyberUI();
    return <><header className={s.calendarHead}><Button slot="previous" icon="back" size="sm" aria-label={t('Previous month', '上个月')}/><A.Heading /><Button slot="next" icon="forward" size="sm" aria-label={t('Next month', '下个月')}/></header>
    <A.CalendarGrid className={s.calendarGrid}><A.CalendarGridHeader>{day => <A.CalendarHeaderCell>{day}</A.CalendarHeaderCell>}</A.CalendarGridHeader><A.CalendarGridBody>{day => <A.CalendarCell date={day} className={s.calendarCell}/>}</A.CalendarGridBody></A.CalendarGrid>
  </>;
}
