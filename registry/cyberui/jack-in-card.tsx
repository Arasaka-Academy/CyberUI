// Generated from packages/react/src/jack-in-card.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { type DOMProps, cx } from "./shared";
import { useCyberUI } from "./provider";
import { Panel } from "./panel";
import s from "./jack-in-card.module.css";
import { AsciiCover } from "./ascii-cover";
import { Barcode } from "./barcode";
import { Button } from "./button";
export interface JackInCardProps extends DOMProps<HTMLElement> {
    handle?: string;
    title?: string;
    author?: string;
    progress?: number;
    variant?: 'standard' | 'terminal' | 'poster' | 'ticket' | 'scanner';
    onConnect?: () => void;
    connected?: boolean;
    className?: string;
}
export function JackInCard({ handle = 'NOVA_7', title = 'NEUROMANCER', author = 'William Gibson', progress = 42, variant = 'standard', onConnect, connected, className, ...props }: JackInCardProps) {
    const { t } = useCyberUI();
    const resume = t(`RESUMING AT ${progress}%`, `从 ${progress}% 继续阅读`);
    return <Panel {...props} shape={variant === 'poster' || variant === 'scanner' ? 'brackets' : variant === 'standard' ? 'header' : variant === 'ticket' ? 'chamfer' : 'frame'} title={variant === 'standard' ? 'JACK-IN' : undefined} titleRight={connected ? t('READY', '就绪') : t('DECRYPTING…', '解密中…')} className={cx(s.jackin, className)} data-variant={variant}>
    {variant === 'terminal' ? <div className={s.terminalLines}><span>JACK-IN // {handle}</span><hr /><span>$ mount {title}</span><span>&gt; {resume}</span><span>[OK] {t('MOUNT FILE // READ INDEX', '挂载文件 // 读取索引')}</span><span>[..] {connected ? t('PAGE READY', '页面就绪') : t('RENDERING PAGE', '渲染页面')}</span><span>&gt; _</span><hr /></div> : <div className={s.jackBook}>{variant !== 'ticket' && <div className={s.jackCover}><AsciiCover title={title} seed={7}/>{variant === 'scanner' && <span className={s.scanBeam} aria-hidden/>}</div>}<div className={s.jackFacts}><span className={s.micro}>{variant === 'ticket' ? 'ADMIT ONE' : variant === 'scanner' ? 'TARGET_LOCKED' : 'FILE // 0X9E20'}</span><h3>{title}</h3><p>{author}</p><span>{resume}</span>{variant === 'standard' && <><span className={s.micro}>[OK] MOUNT FILE // [OK] READ INDEX</span><span className={s.micro}>[..] {connected ? t('PAGE READY', '页面就绪') : t('RENDERING PAGE', '渲染页面')}</span></>}<span className={s.workStripes} aria-hidden/></div>{variant === 'ticket' && <Barcode />}</div>}
    {onConnect && <Button size="sm" variant="primary" onPress={onConnect} isDisabled={connected} icon="forward">{connected ? t('Page ready', '页面就绪') : t('Open demo book', '打开演示书籍')}</Button>}
  </Panel>;
}
