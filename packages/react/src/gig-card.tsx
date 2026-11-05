'use client';
import { type DOMProps, cx } from './shared';
import { useCyberUI } from './provider';
import { Panel } from './panel';
import s from './gig-card.module.css';
import { Badge } from './badge';
import { Progress } from './progress';
import { Button } from './button';
export interface GigCardProps extends DOMProps<HTMLElement> {
    title: string;
    author?: string;
    progress?: number;
    reward?: number;
    active?: boolean;
    completed?: boolean;
    onAccept?: () => void;
    onAdvance?: () => void;
    className?: string;
}
export function GigCard({ title, author, progress = 0, reward = 50, active, completed, onAccept, onAdvance, className, ...props }: GigCardProps) {
    const { t } = useCyberUI();
    return <Panel {...props} shape="chamfer" className={cx(s.gig, className)}><div className={s.shardHead}><Badge tone={completed ? 'success' : 'accent'}>{completed ? t('COMPLETE', '已完成') : active ? t('ACTIVE GIG', '进行中') : t('OPEN CONTRACT', '开放委托')}</Badge><span className={s.micro}>€${reward}</span></div><h3>{title}</h3>{author && <p>{author}</p>}<Progress value={progress} label={t('Contract progress', '委托进度')} variant="segments"/><div className={s.gigFoot}><span className={s.micro}>{progress}% {t('DECRYPTED', '已解密')}</span><Button size="sm" variant={active ? 'secondary' : 'primary'} isDisabled={completed} onPress={active ? onAdvance : onAccept} icon={active ? 'forward' : 'plus'}>{completed ? t('Paid out', '已结算') : active ? t('Read +10%', '阅读 +10%') : t('Accept gig', '接受任务')}</Button></div></Panel>;
}
