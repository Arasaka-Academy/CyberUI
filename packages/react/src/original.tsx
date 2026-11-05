import { useId, type CSSProperties, type ButtonHTMLAttributes, type Ref, type ReactNode } from 'react';
import { schemes, type Scheme } from '@cyberui/tokens';
import { Button, Badge, Icon, Panel } from './foundation';
import { Progress } from './feedback';
import { cx, useControllableState, type DOMProps, type NativeProps } from './shared';
import { useCyberUI } from './provider';
import s from './original.module.css';

export function Barcode({label,className}:{label?:string;className?:string}) {
  return <span role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true} data-slot="barcode" className={cx(s.barcode,className)}>{Array.from({length:42},(_,i)=><i key={i} style={{width:[2,1,4,2,3,1,1][i%7],marginRight:[2,3,1,4][i%4]}}/>)}</span>;
}
function OperatorMark({src,alt}:{src?:string;alt?:string}){return <span aria-hidden={src?undefined:true} data-slot="operator-mark" className={s.operatorMark}>{src?<img src={src} alt={alt??""}/>:<svg viewBox="0 0 24 24" fill="currentColor" width="80%" height="80%"><path d="M2 3h20v5h-6v8h6v5H2v-5h6V8H2Z"/></svg>}</span>;}
export interface StatusBarProps extends NativeProps<HTMLDivElement> { time?:string; battery?:number; cpu?:number; memory?:number; label?:string }
export function StatusBar({time='17:46',battery=76,cpu=12,memory=42,label='CYBR//DECK',className,...props}:StatusBarProps) {
  return <div {...props} className={cx(s.status,className)}><span>{label}</span><span aria-hidden className={s.ticks}/><time>{time}</time><span>BAT {battery}%</span><span>CPU {cpu}%</span><span>MEM {memory}%</span></div>;
}
function Skyline({className}:{className?:string}) {
  return <svg viewBox="0 0 600 240" preserveAspectRatio="none" aria-hidden className={cx(s.skyline,className)}>{Array.from({length:23},(_,i)=>{const height=36+(i*47)%165;return <g key={i}><path d={`M${i*27} 240V${240-height}h23v${height}`} fill="currentColor" opacity={i%2?.35:.6}/>{Array.from({length:Math.floor(height/18)},(_,j)=><path key={j} d={`M${i*27+5} ${250-height+j*18}h4v6h-4zm10 0h4v6h-4z`} fill="var(--cyber-muted)" opacity={((i+j)%3+1)/4}/>)}</g>;})}<path d="M390 0 440 240M485 0 450 240" stroke="currentColor" strokeWidth="5" opacity=".5"/><circle cx="442" cy="105" r="28" fill="currentColor" opacity=".6"/></svg>;
}
export interface OperatorCardProps extends NativeProps<HTMLElement> { handle?:string; rank?:string; level?:number; hours?:number; pages?:number; books?:number; streak?:number; balance?:number; frame?:string; backdrop?:string; flair?:string; compact?:boolean; preview?:boolean; portrait?:string; actions?:ReactNode }
export function OperatorCard({handle='NOVA_7',rank='SCRIPT KID',level=1,hours=6.7,pages=200,books=0,streak=8,balance=300,frame='hazard',backdrop='skyline',flair='bolt',compact=false,preview=false,portrait,actions,className,...props}:OperatorCardProps) {
  const {t}=useCyberUI();
  if(compact)return <Panel {...props} shape="chamfer" className={cx(s.operatorCompact,className)}><OperatorMark src={portrait} alt={handle}/><div><span className={s.micro}>CYBERDECK // OPERATOR ACCESS</span><h2>{t('READER // ONLINE','读者 // 已连接')}</h2><span>{handle} <Badge tone="accent">{rank}</Badge></span></div><Barcode/></Panel>;
  const stats=[[t('Hours','小时'),hours],[t('Pages','页数'),pages],[t('Books','书籍'),books],[t('Best run','最长连续'),`${streak}D`],[t('Days read','阅读天数'),streak],[t('Since','注册时间'),'2026-10']];
  return <article {...props} className={cx(s.operator,className)} data-frame={frame.split('-').pop()} data-backdrop={backdrop.split('-').pop()} data-preview={preview}>
    <header><span>OPERATOR // {t('ID-CARD','身份卡')}</span><span>AUTH OK</span></header><div className={s.hazard}><div className={s.operatorBody}>
      {backdrop!=='none'&&<Skyline/>}<div className={s.operatorIdentity}><OperatorMark src={portrait} alt={handle}/><div><span className={s.micro}>{t('Handle','代号')}</span><h2>{handle} <span className={s.flair} aria-hidden>{flair.includes('eye')?<Icon name="eye"/>:flair.includes('bolt')?'ϟ':flair.includes('crosshair')?'⊕':flair.includes('chevrons')?'»':'▪'}</span></h2><span className={s.micro}>{t('Rank','等级')}</span><div><Badge tone="accent">{rank}</Badge> <span className={s.micro}>LVL {level} / 5</span></div></div></div>
      {!preview&&<><div className={s.rankProgress}><span>{t('NEXT: RUNNER','下一阶：疾行者')}</span><span>{hours.toFixed(1)} / 25 H</span></div><Progress label={t('Next rank','升级进度')} value={hours/25*100}/>
      <div className={s.statGrid}>{stats.map(([label,value])=><Panel key={label} shape="chamfer"><span className={s.micro}>{label}</span><strong>{value}</strong></Panel>)}</div>
      <div className={s.statGridTwo}><Panel shape="chamfer"><span className={s.micro}>EDDIES</span><strong>€${balance}</strong></Panel><Panel shape="chamfer"><span className={s.micro}>{t('Gigs done','完成任务')}</span><strong>{books+1}</strong></Panel></div>
      <div className={s.operatorFoot}><Barcode/><span>ID 36A8-383A-39CC</span></div>{actions&&<div className={s.actions}>{actions}</div>}</>}
    </div></div>
  </article>;
}
export type AsciiVariant='ascii'|'braille'|'blocks'|'halftone'|'contour';
export interface AsciiCoverProps extends Omit<NativeProps<HTMLDivElement>,'color'> { title?:string; seed?:number; variant?:AsciiVariant; color?:boolean; artwork?:'city'|'orbit'|'pyramid'|'circuit'; badge?:string }
export function AsciiCover({title='NEUROMANCER',seed=7,variant='braille',color=true,artwork='city',badge,className,...props}:AsciiCoverProps) {
  const alphabets={ascii:' .,:;+xX#@',braille:' ⠁⠃⠉⠋⠓⠛⠟⠿⣿',blocks:' ░░▒▒▓▓███',halftone:' ·∙•●●◉◉██',contour:'  ..─┼┤╬▓█'};
  const rows=Array.from({length:32},(_,y)=>Array.from({length:28},(_,x)=>{
    const n=((x*17+y*31+seed*13)%97)/97;const dx=x-14,dy=y-15;
    const v=artwork==='orbit'?Math.abs(Math.sin(Math.sqrt(dx*dx+dy*dy)/2+seed))*0.8+n*.2:artwork==='pyramid'?(y>Math.abs(dx)*1.45?1-n*.45:n*.3):artwork==='circuit'?((x+seed)%7<2||(y+seed)%8<2?.8:n*.25):(y>32-((x*7+seed*3)%21+5)?(x+y)%3===0?.95:.55:n*.32);
    return alphabets[variant][Math.min(9,Math.floor(v*10))];
  }).join(''));
  return <div {...props} role="img" aria-label={title} className={cx(s.cover,className)} data-color={color} data-art={artwork}>
    <div aria-hidden className={s.coverDecor}><span>{title.slice(0,24)}</span><span>FILE // {String(seed).padStart(4,'0')}</span></div>
    <pre aria-hidden>{rows.map((line,i)=><span key={i} style={color?{color:i<10?'var(--cyber-accent)':i<20?'var(--cyber-muted)':'var(--cyber-ink)'}:undefined}>{line}{'\n'}</span>)}</pre>
    {badge&&<span className={s.coverBadge}>{badge}</span>}
  </div>;
}
export interface BookCardProps extends NativeProps<HTMLElement> { title:string; author?:string; progress?:number; seed?:number; artwork?:AsciiCoverProps['artwork']; coverVariant?:AsciiVariant; coverColor?:boolean; favorite?:boolean; onOpen?:()=>void; onFavorite?:()=>void; compact?:boolean }
export function BookCard({title,author,progress=0,seed,artwork,coverVariant,coverColor,favorite,onOpen,onFavorite,compact,className,...props}:BookCardProps) {
  const {t}=useCyberUI();
  return <article {...props} className={cx(s.book,className)} data-compact={compact}>
    <button className={s.bookOpen} type="button" onClick={onOpen} aria-label={t(`Open ${title}`,`打开 ${title}`)}><AsciiCover title={title} seed={seed} artwork={artwork} variant={coverVariant} color={coverColor} badge={progress?`${progress}%`:t('NEW','新文件')}/><span className={s.bookTitle}>{title}</span>{author&&<span className={s.micro}>{author}</span>}</button>
    <Progress label={`${title} ${t('reading progress','阅读进度')}`} value={progress}/>{onFavorite&&<Button icon="bookmark" size="sm" variant="ghost" aria-pressed={favorite} onPress={onFavorite}>{favorite?t('Saved','已收藏'):t('Save','收藏')}</Button>}
  </article>;
}
export interface CollectionStackProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onClick'> {ref?:Ref<HTMLButtonElement>;title:string;count:number;seed?:number;onOpen?:()=>void;className?:string}
export function CollectionStack({title,count,seed=3,onOpen,className,...props}:CollectionStackProps) {const {t}=useCyberUI();return <button {...props} type="button" className={cx(s.collection,className)} onClick={onOpen}><span className={s.stackArt}><AsciiCover title={title} seed={seed} color={false}/><span className={s.stackLabel}><Icon name="folder"/> {t('CACHE','收藏集')} // {count}</span></span><span>{title}</span></button>;}
export interface DataShardProps extends NativeProps<HTMLElement> {code?:string;quote:string;source?:string;fragment?:string;recovered?:boolean;onRecover?:()=>void}
export function DataShard({code='0X9E20',quote,source,fragment='2/2',recovered=true,onRecover,className,...props}:DataShardProps) {
  const {t}=useCyberUI();return <Panel {...props} shape="chamfer" className={cx(s.shard,className)}><Icon name="shard" size={32}/><div><div className={s.shardHead}><span>DATA SHARD // {code}</span><span>{recovered?t('RECOVERED','已恢复'):t('ENCRYPTED','已加密')}</span></div><blockquote>“{quote}”</blockquote><span className={s.micro}>{t('FRAGMENT','碎片')} {fragment}{source?` // ${source}`:''}</span>{onRecover&&<Button size="sm" onPress={onRecover}>{t('Recover shard','恢复碎片')}</Button>}</div></Panel>;
}
export interface GigCardProps extends DOMProps<HTMLElement> {title:string;author?:string;progress?:number;reward?:number;active?:boolean;completed?:boolean;onAccept?:()=>void;onAdvance?:()=>void;className?:string}
export function GigCard({title,author,progress=0,reward=50,active,completed,onAccept,onAdvance,className,...props}:GigCardProps) {
  const {t}=useCyberUI();return <Panel {...props} shape="chamfer" className={cx(s.gig,className)}><div className={s.shardHead}><Badge tone={completed?'success':'accent'}>{completed?t('COMPLETE','已完成'):active?t('ACTIVE GIG','进行中'):t('OPEN CONTRACT','开放委托')}</Badge><span className={s.micro}>€${reward}</span></div><h3>{title}</h3>{author&&<p>{author}</p>}<Progress value={progress} label={t('Contract progress','委托进度')} variant="segments"/><div className={s.gigFoot}><span className={s.micro}>{progress}% {t('DECRYPTED','已解密')}</span><Button size="sm" variant={active?'secondary':'primary'} isDisabled={completed} onPress={active?onAdvance:onAccept} icon={active?'forward':'plus'}>{completed?t('Paid out','已结算'):active?t('Read +10%','阅读 +10%'):t('Accept gig','接受任务')}</Button></div></Panel>;
}
export interface ThemeSwatchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onSelect'> {ref?:Ref<HTMLButtonElement>;scheme:Scheme;mode?:'dark'|'light';selected?:boolean;onSelect?:()=>void;className?:string}
export function ThemeSwatch({scheme,mode='dark',selected,onSelect,className,...props}:ThemeSwatchProps) {
  const palette=schemes[scheme][mode];return <button {...props} type="button" aria-label={scheme} className={cx(s.themeSwatch,className)} onClick={onSelect} aria-pressed={selected} style={{...props.style,'--swatch-bg':palette.bg,'--swatch-ink':palette.ink,'--swatch-accent':palette.accent} as CSSProperties}><span className={s.swatchColors} aria-hidden><i/><i/><i/></span><span>{scheme}</span><span aria-hidden>{selected?'■':'□'}</span></button>;
}
export interface LauncherTileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onClick'> {ref?:Ref<HTMLButtonElement>;title:string;subtitle?:string;icon?:string;onPress?:()=>void;disabled?:boolean}
export function LauncherTile({title,subtitle,icon='deck',onPress,disabled,className,...props}:LauncherTileProps) {return <button type="button" {...props} disabled={disabled} onClick={onPress} className={cx(s.launcher,className)}><Icon name={icon} size={26}/><span><strong>{title}</strong>{subtitle&&<small>{subtitle}</small>}</span><Icon name="forward" size={16}/></button>;}
export interface TelemetryMetric {label:string;value:string|number;percentage?:number;detail?:string}
export interface TelemetryPanelProps extends NativeProps<HTMLElement> {title?:string;metrics:TelemetryMetric[];className?:string;children?:ReactNode}
export function TelemetryPanel({title='SYSTEM // TELEMETRY',metrics,className,children,...props}:TelemetryPanelProps) {return <Panel {...props} shape="header" title={title} className={cx(s.telemetry,className)}>{metrics.map(m=><div className={s.metric} key={m.label}><div><span>{m.label}</span><strong>{m.value}</strong></div>{m.percentage!==undefined&&<Progress label={m.label} value={m.percentage}/>} {m.detail&&<span className={s.micro}>{m.detail}</span>}</div>)}{children}</Panel>;}
export interface JackInCardProps extends DOMProps<HTMLElement> {handle?:string;title?:string;author?:string;progress?:number;variant?:'standard'|'terminal'|'poster'|'ticket'|'scanner';onConnect?:()=>void;connected?:boolean;className?:string}
export function JackInCard({handle='NOVA_7',title='NEUROMANCER',author='William Gibson',progress=42,variant='standard',onConnect,connected,className,...props}:JackInCardProps) {
  const {t}=useCyberUI();const resume=t(`RESUMING AT ${progress}%`,`从 ${progress}% 继续阅读`);
  return <Panel {...props} shape={variant==='poster'||variant==='scanner'?'brackets':variant==='standard'?'header':variant==='ticket'?'chamfer':'frame'} title={variant==='standard'?'JACK-IN':undefined} titleRight={connected?t('READY','就绪'):t('DECRYPTING…','解密中…')} className={cx(s.jackin,className)} data-variant={variant}>
    {variant==='terminal'?<div className={s.terminalLines}><span>JACK-IN // {handle}</span><hr/><span>$ mount {title}</span><span>&gt; {resume}</span><span>[OK] {t('MOUNT FILE // READ INDEX','挂载文件 // 读取索引')}</span><span>[..] {connected?t('PAGE READY','页面就绪'):t('RENDERING PAGE','渲染页面')}</span><span>&gt; _</span><hr/></div>:<div className={s.jackBook}>{variant!=='ticket'&&<div className={s.jackCover}><AsciiCover title={title} seed={7}/>{variant==='scanner'&&<span className={s.scanBeam} aria-hidden/>}</div>}<div className={s.jackFacts}><span className={s.micro}>{variant==='ticket'?'ADMIT ONE':variant==='scanner'?'TARGET_LOCKED':'FILE // 0X9E20'}</span><h3>{title}</h3><p>{author}</p><span>{resume}</span>{variant==='standard'&&<><span className={s.micro}>[OK] MOUNT FILE // [OK] READ INDEX</span><span className={s.micro}>[..] {connected?t('PAGE READY','页面就绪'):t('RENDERING PAGE','渲染页面')}</span></>}<span className={s.workStripes} aria-hidden/></div>{variant==='ticket'&&<Barcode/>}</div>}
    {onConnect&&<Button size="sm" variant="primary" onPress={onConnect} isDisabled={connected} icon="forward">{connected?t('Page ready','页面就绪'):t('Open demo book','打开演示书籍')}</Button>}
  </Panel>;
}
export interface SkylineDay {day:number;pages:number}
export interface SkylineCalendarProps extends DOMProps<HTMLElement> {label?:string;days:SkylineDay[];value?:number;defaultValue?:number;onChange?:(day:number)=>void;className?:string}
export function SkylineCalendar({label='OCTOBER // 2026',days,value,defaultValue=30,onChange,className,...props}:SkylineCalendarProps) {
  const {t}=useCyberUI();const [selected,setSelected]=useControllableState(value,defaultValue,onChange);const id=useId();const max=Math.max(1,...days.map(d=>d.pages));
  const index=Math.max(0,days.findIndex(d=>d.day===selected));const selectedDay=days[index]?.day??selected;
  return <figure {...props} className={cx(s.skyCalendar,className)} style={{margin:0,...props.style}}><figcaption id={id}>{label}</figcaption><div className={s.buildings}>
    {days.map(d=><span key={d.day} aria-hidden className={s.buildingColumn} data-selected={selectedDay===d.day} style={{'--height':`${Math.max(8,d.pages/max*160)}px`} as CSSProperties}><span className={s.building}/><span>{d.day}</span></span>)}
    {days.length>0&&<input className={s.skyRange} type="range" min={0} max={days.length-1} step={1} value={index} aria-labelledby={id} aria-valuetext={t(`Day ${selectedDay}: ${days[index].pages} pages`,`${selectedDay} 日：${days[index].pages} 页`)} onChange={e=>setSelected(days[Number(e.target.value)].day)}/>}
  </div><p role="status" className={s.micro}>{days.length?t(`DAY ${selectedDay} // ${days[index].pages} PAGES READ`,`日期 ${selectedDay} // ${days[index].pages} 页已读`):t('No reading data','暂无阅读数据')}</p><details><summary>{t('Daily reading data','每日阅读数据')}</summary><dl className={s.dailyData}>{days.map(d=><div key={d.day}><dt>{d.day}</dt><dd>{d.pages} {t('pages','页')}</dd></div>)}</dl></details></figure>;
}
export interface VirtualKeyboardProps extends DOMProps {value?:string;defaultValue?:string;onChange?:(value:string)=>void;onSubmit?:()=>void;layout?:'alpha'|'numeric';isDisabled?:boolean;className?:string}
export function VirtualKeyboard({value,defaultValue='',onChange,onSubmit,layout='alpha',isDisabled,className,...props}:VirtualKeyboardProps) {
  const [text,setText]=useControllableState(value,defaultValue,onChange);const {t}=useCyberUI();const rows=layout==='numeric'?['123','456','789','0']:['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
  return <div {...props} role="group" aria-label={t('Virtual keyboard','虚拟键盘')} aria-disabled={isDisabled||undefined} className={cx(s.keyboard,className)}>{rows.map(row=><div key={row}>{row.split('').map(key=><Button corners="none" key={key} size="sm" isDisabled={isDisabled} onPress={()=>setText(text+key)}>{key}</Button>)}</div>)}<div><Button size="sm" isDisabled={isDisabled} onPress={()=>setText(text+' ')}>{t('Space','空格')}</Button><Button size="sm" isDisabled={isDisabled} icon="backspace" aria-label={t('Backspace','退格')} onPress={()=>setText(text.slice(0,-1))}/>{onSubmit&&<Button size="sm" variant="primary" isDisabled={isDisabled} onPress={onSubmit}>{t('Enter','确认')}</Button>}</div></div>;
}
