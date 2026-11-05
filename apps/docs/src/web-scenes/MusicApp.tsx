import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as C from '@cyberui/react';
import { previewPrefix } from '../replica/routes';
import { useWebDemo } from './store';
import { formatTime, playlists, tracks, type Track, type MusicAction } from './music-model';
import s from './music.module.css';

type GlyphName = 'play' | 'pause' | 'next' | 'previous' | 'heart' | 'queue' | 'discover' | 'search' | 'library' | 'close' | 'volume';
function Glyph({ name, size = 20 }: { name: GlyphName; size?: number }) {
  const paths: Record<GlyphName, string> = {
    play: 'm8 5 11 7-11 7Z', pause: 'M8 5v14M16 5v14', next: 'm5 5 10 7-10 7ZM19 5v14', previous: 'm19 5-10 7 10 7ZM5 5v14',
    heart: 'M12 20 3.8 12A5.2 5.2 0 0 1 12 5.7 5.2 5.2 0 0 1 20.2 12Z', queue: 'M4 6h16M4 12h16M4 18h10',
    discover: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z', search: 'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
    library: 'M4 4v16M10 4v16M15 5l5 14', close: 'm6 6 12 12M6 18 18 6', volume: 'M3 9h4l5-4v14l-5-4H3ZM16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14',
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill={name === 'play' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter"><path d={paths[name]}/></svg>;
}
function Cover({ cover, large = false }: { cover: string; large?: boolean }) {
  return <div className={`${s.cover} ${large ? s.largeCover : ''}`} data-cover={cover} aria-hidden="true"><svg viewBox="0 0 200 200"><path className={s.coverGrid} d="M0 40h200M0 80h200M0 120h200M0 160h200M40 0v200M80 0v200M120 0v200M160 0v200"/><circle cx="100" cy="100" r="64"/><circle cx="100" cy="100" r="43"/><path className={s.coverMark} d="M44 140 100 38l56 102ZM25 116h150M100 22v156"/></svg><span>FREQ / {cover.toUpperCase()}</span></div>;
}
export function MusicApp() {
  const { t } = C.useCyberUI(); const { state, dispatch } = useWebDemo(); const music = state.music; const location = useLocation(); const navigate = useNavigate();
  const root = previewPrefix(location.pathname) + '/mobile-app'; const view = location.pathname.split('/').slice(3).join('/');
  const [query, setQuery] = useState(''); const [queueOpen, setQueueOpen] = useState(false); const previousView = useRef(root);
  const send = (action: MusicAction) => dispatch({ type: 'music', action });
  const track = tracks.find(track => track.id === music.trackId)!; const isPlayer = view === 'player';
  const activeTab = view === 'search' ? 'search' : view === 'library' || view.startsWith('playlists/') ? 'library' : '';
  const playlist = playlists.find(playlist => view === 'playlists/' + playlist.id);
  const filtered = tracks.filter(track => `${track.title} ${track.artist} ${t(track.mood.en, track.mood.zh)}`.toLowerCase().includes(query.trim().toLowerCase()));
  useEffect(() => {
    if (!music.playing) return;
    const timer = window.setInterval(() => dispatch({ type: 'music', action: { type: 'tick' } }), 1000);
    return () => window.clearInterval(timer);
  }, [dispatch, music.playing]);
  useEffect(() => () => dispatch({ type: 'music', action: { type: 'pause' } }), [dispatch]);
  useEffect(() => { if (view !== 'player') previousView.current = location.pathname; }, [view, location.pathname]);
  useEffect(() => {
    if (!isPlayer) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !queueOpen) { event.preventDefault(); navigate(previousView.current); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [isPlayer, navigate, queueOpen]);
  const favorite = (item: Track) => <C.Button size="sm" variant="ghost" className={s.favorite} aria-label={music.favorites.includes(item.id) ? t(`Unsave ${item.title}`, `取消收藏 ${item.title}`) : t(`Save ${item.title}`, `收藏 ${item.title}`)} aria-pressed={music.favorites.includes(item.id)} onPress={() => send({ type: 'favorite', trackId: item.id })}><Glyph name="heart" size={18}/></C.Button>;
  const trackRow = (item: Track, index: number, queue?: readonly string[]) => <div className={s.track} key={item.id} data-track-id={item.id} data-current={item.id === music.trackId}>
    <span className={s.trackNumber} aria-hidden="true">{item.id === music.trackId && music.playing ? '▥' : String(index + 1).padStart(2, '0')}</span><Cover cover={item.cover}/><button className={s.trackName} onClick={() => send({ type: 'select', trackId: item.id, queue })} aria-label={t(`Play ${item.title}`, `播放 ${item.title}`)}><strong>{item.title}</strong><small>{item.artist}</small></button><span className={s.duration}>{formatTime(item.duration)}</span>{favorite(item)}
  </div>;
  const playlistCard = (item: typeof playlists[number]) => <Link to={root + '/playlists/' + item.id} className={s.playlistCard} key={item.id}><Cover cover={item.cover}/><strong>{t(item.title.en, item.title.zh)}</strong><small>{item.tracks.length} {t('tracks', '首曲目')}<span>↗</span></small></Link>;
  const playButton = (large = false) => <C.Button variant="primary" className={large ? s.bigPlay : s.play} aria-label={music.playing ? t('Pause playback', '暂停播放') : t('Start playback', '开始播放')} onPress={() => send({ type: music.playing ? 'pause' : 'play' })}><Glyph name={music.playing ? 'pause' : 'play'} size={large ? 28 : 20}/></C.Button>;
  const openQueue = <C.Button size="sm" variant="ghost" aria-label={t('Open queue', '打开播放队列')} onPress={() => setQueueOpen(true)}><Glyph name="queue"/></C.Button>;
  const validView = !view || view === 'search' || view === 'library' || isPlayer || !!playlist;
  return <div className={s.stage}><article className={s.phone} data-music-playing={music.playing} data-music-track={music.trackId} data-music-position={music.position} aria-label={t('FREQ music player', 'FREQ 音乐播放器')}>
    <div className={s.status} aria-hidden="true"><span>9:41</span><span>▥ ᯤ ▰</span></div>
    <header className={s.header}><Link to={root} className={s.logo} aria-label={t('FREQ discover', 'FREQ 发现')}>FREQ<span>®</span></Link><span className={s.demoTag}>{t('SILENT DEMO', '无声演示')}</span><span className={s.avatar} aria-hidden="true">AK</span></header>
    {isPlayer ? <div className={s.player}>
      <div className={s.playerTop}><C.Button variant="ghost" size="sm" aria-label={t('Close player', '关闭播放器')} onPress={() => navigate(previousView.current)}><Glyph name="close"/></C.Button><span>{t('NOW IN YOUR FREQUENCY', '此刻，你的频率')}</span>{openQueue}</div>
      <Cover cover={track.cover} large/>
      <div className={s.playerTitle}><div><h2>{track.title}</h2><p>{track.artist}</p></div>{favorite(track)}</div>
      <div className={s.seek}><C.Slider label={t('Track progress', '播放进度')} minValue={0} maxValue={track.duration} step={1} value={music.position} onChange={position => send({ type: 'seek', position })}/><div className={s.time}><span>{formatTime(music.position)}</span><span>{formatTime(track.duration)}</span></div></div>
      <div className={s.transport}><C.Button variant="ghost" aria-label={t('Previous track', '上一曲')} onPress={() => send({ type: 'previous' })}><Glyph name="previous" size={26}/></C.Button>{playButton(true)}<C.Button variant="ghost" aria-label={t('Next track', '下一曲')} onPress={() => send({ type: 'next' })}><Glyph name="next" size={26}/></C.Button></div>
      <div className={s.volume}><Glyph name="volume" size={18}/><C.Slider label={t('Volume', '音量')} value={music.volume} onChange={volume => send({ type: 'volume', volume })}/></div><p className={s.silentNote}>{t('Fictional tracks. A little room to explore — no audio.', '虚构曲目，留一点探索的空间。仅演示交互，不播放音频。')}</p>
    </div> : <>
      <div className={s.content}>
        {!validView ? <C.EmptyState title={t('This frequency is quiet', '这里还没有频率')} action={<Link to={root}>{t('Back to discover', '返回发现')}</Link>}/> : !view ? <>
          <span className={s.eyebrow}>{t('GOOD EVENING, AKIRA', '晚上好，AKIRA')}</span><h2 className={s.headline}>{t('Find your', '找到你的')}<br/><em>{t('frequency.', '频率。')}</em></h2>
          <Link to={root + '/playlists/night-shift'} className={s.feature}><Cover cover="drive"/><div><span>{t('THE NIGHT EDIT', '夜间特辑')} / 01</span><h3>{t('For the', '献给')}<br/>{t('night owls.', '夜行的人。')}</h3><small>{t('Night shift · 3 tracks', '夜间频率 · 3 首曲目')} <Glyph name="play" size={16}/></small></div></Link>
          <div className={s.sectionHeading}><h3>{t('Made for your moment', '此刻，为你而选')}</h3><span>01—03</span></div><div className={s.playlists}>{playlists.map(playlistCard)}</div>
          <div className={s.sectionHeading}><h3>{t('Fresh frequencies', '新鲜频率')}</h3><Link to={root + '/search'}>{t('Explore', '探索')} ↗</Link></div><div>{tracks.slice(0, 3).map((item, index) => trackRow(item, index))}</div>
        </> : view === 'search' ? <>
          <span className={s.eyebrow}>FREQ / {t('EXPLORE', '探索')}</span><h2 className={s.pageTitle}>{t('A new discovery.', '发现新的频率。')}</h2><C.Input type="search" label={t('Search tracks & artists', '搜索曲目与音乐人')} value={query} onChange={e => setQuery(e.target.value)} placeholder={t('What is on your mind?', '今天想听什么？')}/><div className={s.sectionHeading}><h3>{query ? t('Search results', '搜索结果') : t('All frequencies', '全部频率')}</h3><span>{String(filtered.length).padStart(2, '0')}</span></div>{filtered.length ? filtered.map((item, index) => trackRow(item, index)) : <C.EmptyState title={t('No matching frequencies', '没有找到相关频率')} description={t('Try another track or artist.', '试试其他曲目或音乐人的名字。')} action={<C.Button variant="ghost" onPress={() => setQuery('')}>{t('Clear search', '清除搜索')}</C.Button>}/>}
        </> : view === 'library' ? <>
          <span className={s.eyebrow}>FREQ / {t('YOURS TO KEEP', '留给自己')}</span><h2 className={s.pageTitle}>{t('Your collection.', '你的音乐库。')}</h2><div className={s.sectionHeading}><h3>{t('Your playlists', '你的歌单')}</h3><span>03</span></div><div className={s.playlists}>{playlists.map(playlistCard)}</div><div className={s.sectionHeading}><h3>{t('Saved tracks', '收藏的曲目')}</h3><span>{String(music.favorites.length).padStart(2, '0')}</span></div>{music.favorites.length ? tracks.filter(item => music.favorites.includes(item.id)).map((item, index) => trackRow(item, index)) : <C.EmptyState title={t('Keep a good frequency', '留住喜欢的频率')} description={t('Save a track with the heart button. It will be waiting here.', '点击曲目旁的爱心，它就会在这里等你。')}/>}
        </> : playlist ? <>
          <C.Button variant="ghost" size="sm" icon="back" onPress={() => navigate(root + '/library')}>{t('Your library', '音乐库')}</C.Button><div className={s.playlistHero}><Cover cover={playlist.cover} large/><span className={s.eyebrow}>{t('CURATED PLAYLIST', '精选歌单')}</span><h2 className={s.pageTitle}>{t(playlist.title.en, playlist.title.zh)}</h2><p>{t(playlist.description.en, playlist.description.zh)}</p><C.Button variant="primary" onPress={() => send({ type: 'select', trackId: playlist.tracks[0], queue: playlist.tracks })}><Glyph name="play" size={16}/>{t('Play playlist', '播放歌单')}</C.Button></div><div className={s.sectionHeading}><h3>{t('On this frequency', '歌单曲目')}</h3><span>{playlist.tracks.length} {t('TRACKS', '首')}</span></div>{playlist.tracks.map((id, index) => trackRow(tracks.find(track => track.id === id)!, index, playlist.tracks))}
        </> : null}
      </div>
      <div className={s.playerDock}><div className={s.miniPlayer}><Cover cover={track.cover}/><button className={s.miniTitle} onClick={() => navigate(root + '/player')} aria-label={t('Open player', '打开播放器')}><strong>{track.title}</strong><small>{track.artist}</small></button>{playButton()}<C.Button size="sm" variant="ghost" aria-label={t('Next track', '下一曲')} onPress={() => send({ type: 'next' })}><Glyph name="next" size={18}/></C.Button></div><div className={s.miniProgress} aria-hidden="true"><span style={{ width: `${music.position / track.duration * 100}%` }}/></div><nav className={s.bottomNav} aria-label={t('Music navigation', '音乐导航')}>{[{ id: '', en: 'Discover', zh: '发现', icon: 'discover' }, { id: 'search', en: 'Search', zh: '搜索', icon: 'search' }, { id: 'library', en: 'Library', zh: '音乐库', icon: 'library' }].map(tab => <Link key={tab.id} to={root + (tab.id ? '/' + tab.id : '')} aria-current={activeTab === tab.id ? 'page' : undefined}><Glyph name={tab.icon as GlyphName}/><span>{t(tab.en, tab.zh)}</span></Link>)}</nav></div>
    </>}
    <C.Drawer title={t('Your queue', '播放队列')} isOpen={queueOpen} onOpenChange={setQueueOpen}><div className={s.queue}><p>{t('Choose a track or change the order.', '选择曲目，或调整播放顺序。')}</p>{music.queue.map((id, index) => { const item = tracks.find(track => track.id === id)!; return <div className={s.queueRow} key={id}><button aria-label={t(`Play ${item.title}`, `播放 ${item.title}`)} onClick={() => send({ type: 'select', trackId: id })} aria-current={id === music.trackId ? 'true' : undefined}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}<small>{item.artist}</small></strong></button><C.Button size="sm" variant="ghost" isDisabled={index === 0} aria-label={t(`Move ${item.title} up`, `上移 ${item.title}`)} onPress={() => send({ type: 'move', trackId: id, direction: -1 })}>↑</C.Button><C.Button size="sm" variant="ghost" isDisabled={index === music.queue.length - 1} aria-label={t(`Move ${item.title} down`, `下移 ${item.title}`)} onPress={() => send({ type: 'move', trackId: id, direction: 1 })}>↓</C.Button></div>; })}</div></C.Drawer>
  </article></div>;
}
