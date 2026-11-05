'use client';
import { type NativeProps, cx } from './shared';
import { type AsciiCoverProps, type AsciiVariant, AsciiCover } from './ascii-cover';
import { useCyberUI } from './provider';
import s from './book-card.module.css';
import { Progress } from './progress';
import { Button } from './button';
export interface BookCardProps extends NativeProps<HTMLElement> {
    title: string;
    author?: string;
    progress?: number;
    seed?: number;
    artwork?: AsciiCoverProps['artwork'];
    coverVariant?: AsciiVariant;
    coverColor?: boolean;
    favorite?: boolean;
    onOpen?: () => void;
    onFavorite?: () => void;
    compact?: boolean;
}
export function BookCard({ title, author, progress = 0, seed, artwork, coverVariant, coverColor, favorite, onOpen, onFavorite, compact, className, ...props }: BookCardProps) {
    const { t } = useCyberUI();
    return <article {...props} className={cx(s.book, className)} data-compact={compact}>
    <button className={s.bookOpen} type="button" onClick={onOpen} aria-label={t(`Open ${title}`, `打开 ${title}`)}><AsciiCover title={title} seed={seed} artwork={artwork} variant={coverVariant} color={coverColor} badge={progress ? `${progress}%` : t('NEW', '新文件')}/><span className={s.bookTitle}>{title}</span>{author && <span className={s.micro}>{author}</span>}</button>
    <Progress label={`${title} ${t('reading progress', '阅读进度')}`} value={progress}/>{onFavorite && <Button icon="bookmark" size="sm" variant="ghost" aria-pressed={favorite} onPress={onFavorite}>{favorite ? t('Saved', '已收藏') : t('Save', '收藏')}</Button>}
  </article>;
}
