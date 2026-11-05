// Generated from packages/react/src/operator-card.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type NativeProps, cx } from "./shared";
import { type ReactNode } from 'react';
import { useCyberUI } from "./provider";
import { Panel } from "./panel";
import s from "./operator-card.module.css";
import { OperatorMark } from "./operator-mark";
import { Badge } from "./badge";
import { Barcode } from "./barcode";
import { Skyline } from "./skyline";
import { Icon } from "./icon";
import { Progress } from "./progress";
export interface OperatorCardProps extends NativeProps<HTMLElement> {
    handle?: string;
    rank?: string;
    level?: number;
    hours?: number;
    pages?: number;
    books?: number;
    streak?: number;
    balance?: number;
    frame?: string;
    backdrop?: string;
    flair?: string;
    compact?: boolean;
    preview?: boolean;
    portrait?: string;
    actions?: ReactNode;
}
export function OperatorCard({ handle = 'NOVA_7', rank = 'SCRIPT KID', level = 1, hours = 6.7, pages = 200, books = 0, streak = 8, balance = 300, frame = 'hazard', backdrop = 'skyline', flair = 'bolt', compact = false, preview = false, portrait, actions, className, ...props }: OperatorCardProps) {
    const { t } = useCyberUI();
    if (compact)
        return <Panel {...props} shape="chamfer" className={cx(s.operatorCompact, className)}><OperatorMark src={portrait} alt={handle}/><div><span className={s.micro}>CYBERDECK // OPERATOR ACCESS</span><h2>{t('READER // ONLINE', '读者 // 已连接')}</h2><span>{handle} <Badge tone="accent">{rank}</Badge></span></div><Barcode /></Panel>;
    const stats = [[t('Hours', '小时'), hours], [t('Pages', '页数'), pages], [t('Books', '书籍'), books], [t('Best run', '最长连续'), `${streak}D`], [t('Days read', '阅读天数'), streak], [t('Since', '注册时间'), '2026-10']];
    return <article {...props} className={cx(s.operator, className)} data-frame={frame.split('-').pop()} data-backdrop={backdrop.split('-').pop()} data-preview={preview}>
    <header><span>OPERATOR // {t('ID-CARD', '身份卡')}</span><span>AUTH OK</span></header><div className={s.hazard}><div className={s.operatorBody}>
      {backdrop !== 'none' && <Skyline />}<div className={s.operatorIdentity}><OperatorMark src={portrait} alt={handle}/><div><span className={s.micro}>{t('Handle', '代号')}</span><h2>{handle} <span className={s.flair} aria-hidden>{flair.includes('eye') ? <Icon name="eye"/> : flair.includes('bolt') ? 'ϟ' : flair.includes('crosshair') ? '⊕' : flair.includes('chevrons') ? '»' : '▪'}</span></h2><span className={s.micro}>{t('Rank', '等级')}</span><div><Badge tone="accent">{rank}</Badge> <span className={s.micro}>LVL {level} / 5</span></div></div></div>
      {!preview && <><div className={s.rankProgress}><span>{t('NEXT: RUNNER', '下一阶：疾行者')}</span><span>{hours.toFixed(1)} / 25 H</span></div><Progress label={t('Next rank', '升级进度')} value={hours / 25 * 100}/>
      <div className={s.statGrid}>{stats.map(([label, value]) => <Panel key={label} shape="chamfer"><span className={s.micro}>{label}</span><strong>{value}</strong></Panel>)}</div>
      <div className={s.statGridTwo}><Panel shape="chamfer"><span className={s.micro}>EDDIES</span><strong>€${balance}</strong></Panel><Panel shape="chamfer"><span className={s.micro}>{t('Gigs done', '完成任务')}</span><strong>{books + 1}</strong></Panel></div>
      <div className={s.operatorFoot}><Barcode /><span>ID 36A8-383A-39CC</span></div>{actions && <div className={s.actions}>{actions}</div>}</>}
    </div></div>
  </article>;
}
