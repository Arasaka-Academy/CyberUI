// Generated from packages/react/src/data-shard.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type NativeProps, cx } from "./shared";
import { useCyberUI } from "./provider";
import { Panel } from "./panel";
import s from "./data-shard.module.css";
import { Icon } from "./icon";
import { Button } from "./button";
export interface DataShardProps extends NativeProps<HTMLElement> {
    code?: string;
    quote: string;
    source?: string;
    fragment?: string;
    recovered?: boolean;
    onRecover?: () => void;
}
export function DataShard({ code = '0X9E20', quote, source, fragment = '2/2', recovered = true, onRecover, className, ...props }: DataShardProps) {
    const { t } = useCyberUI();
    return <Panel {...props} shape="chamfer" className={cx(s.shard, className)}><Icon name="shard" size={32}/><div><div className={s.shardHead}><span>DATA SHARD // {code}</span><span>{recovered ? t('RECOVERED', '已恢复') : t('ENCRYPTED', '已加密')}</span></div><blockquote>“{quote}”</blockquote><span className={s.micro}>{t('FRAGMENT', '碎片')} {fragment}{source ? ` // ${source}` : ''}</span>{onRecover && <Button size="sm" onPress={onRecover}>{t('Recover shard', '恢复碎片')}</Button>}</div></Panel>;
}
