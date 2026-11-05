import type { Locale, Palette, Scheme, ThemeMode } from '@cyberui/tokens';
import type { AsciiVariant } from '@cyberui/react';

export interface Book {id:string;title:string;author:string;pages:number;progress:number;collections:string[];favorite:boolean;trashed:boolean;seed:number;artwork:'city'|'orbit'|'pyramid'|'circuit';lastRead:string}
export type ShopCategory='frames'|'backdrops'|'flairs'|'jackins';
export interface ShopItem {id:string;category:ShopCategory;name:string;zh:string;price:number;style:string}
const styles:Record<ShopCategory,[string,string,number][]>={
  frames:[['standard','标准边框',0],['notch','切角边框',100],['circuit','电路边框',250],['hazard','警戒边框',450],['glitch','故障边框',900]],
  backdrops:[['plain','纯色',0],['grid','网格坐标',100],['scanlines','扫描线',220],['traces','电路轨迹',480],['skyline','夜之城',900]],
  flairs:[['pip','方点',0],['chevrons','箭头',100],['crosshair','准星',200],['bolt','电光',450],['eye','扫描之眼',800]],
  jackins:[['standard','标准连接',0],['terminal','终端连接',150],['poster','海报',300],['ticket','通行票',550],['scanner','扫描器',1000]],
};
export const shopItems:ShopItem[]=Object.entries(styles).flatMap(([category,items])=>items.map(([style,zh,price])=>({id:`${category}-${style}`,category:category as ShopCategory,name:style.toUpperCase(),zh,price,style})));
export interface DemoSettings {locale:Locale;scheme:Scheme;mode:ThemeMode;colors:Partial<Palette>;font:string;cover:AsciiVariant;coverColor:boolean;goal:number;sleep:string;showClock:boolean;notifications:boolean;progress:'segments'|'ascii'|'heartbeat'|'scanline'|'equalizer'}
export interface Payout {id:string;bookId:string;milestone:number;amount:number;date:string}
export interface DemoState {version:1;books:Book[];handle:string;balance:number;owned:string[];equipped:Record<ShopCategory,string>;activeGigs:string[];payouts:Payout[];shards:string[];settings:DemoSettings}
export function initialDemoState():DemoState {
  return {version:1,handle:'NOVA_7',balance:300,
    books:[
      {id:'neuro',title:'Neuromancer',author:'William Gibson',pages:271,progress:42,collections:['classics','favorites'],favorite:true,trashed:false,seed:7,artwork:'city',lastRead:'2026-10-30'},
      {id:'ready',title:'Ready Player One',author:'Ernest Cline',pages:374,progress:0,collections:['favorites'],favorite:true,trashed:false,seed:15,artwork:'pyramid',lastRead:'2026-10-29'},
      {id:'android',title:'Do Androids Dream of Electric Sheep?',author:'Philip K. Dick',pages:210,progress:0,collections:['classics'],favorite:false,trashed:false,seed:22,artwork:'orbit',lastRead:'2026-10-28'},
      {id:'synners',title:'Synners',author:'Pat Cadigan',pages:464,progress:8,collections:['archive'],favorite:false,trashed:false,seed:32,artwork:'circuit',lastRead:'2026-10-27'},
      {id:'carbon',title:'Altered Carbon',author:'Richard K. Morgan',pages:375,progress:0,collections:['archive'],favorite:false,trashed:false,seed:18,artwork:'city',lastRead:'2026-10-26'},
      {id:'snow',title:'Snow Crash',author:'Neal Stephenson',pages:440,progress:100,collections:['classics'],favorite:false,trashed:true,seed:43,artwork:'pyramid',lastRead:'2026-10-25'},
    ],owned:shopItems.filter(i=>i.price===0).map(i=>i.id),equipped:{frames:'frames-standard',backdrops:'backdrops-plain',flairs:'flairs-pip',jackins:'jackins-standard'},activeGigs:['neuro'],payouts:[],shards:['0X9E20'],
    settings:{locale:'zh-CN',scheme:'neon',mode:'dark',colors:{},font:'oxanium',cover:'braille',coverColor:true,goal:30,sleep:'skyline',showClock:true,notifications:true,progress:'heartbeat'},
  };
}
export type DemoAction=
  | {type:'rename';id:string;title:string}|{type:'favorite'|'trash'|'restore'|'take-gig';id:string}
  | {type:'read';id:string;progress:number}|{type:'purchase';id:string}|{type:'recover';id:string}
  | {type:'handle';handle:string}|{type:'settings';settings:Partial<DemoSettings>}|{type:'reset'};
export function demoReducer(state:DemoState,action:DemoAction):DemoState {
  if(action.type==='reset')return initialDemoState();
  if(action.type==='settings')return {...state,settings:{...state.settings,...action.settings}};
  if(action.type==='handle')return {...state,handle:action.handle.trim().slice(0,24)||state.handle};
  if(action.type==='purchase'){
    const item=shopItems.find(i=>i.id===action.id);if(!item)return state;
    if(state.owned.includes(item.id))return {...state,equipped:{...state.equipped,[item.category]:item.id}};
    if(state.balance<item.price)return state;
    return {...state,balance:state.balance-item.price,owned:[...state.owned,item.id],equipped:{...state.equipped,[item.category]:item.id}};
  }
  if(action.type==='recover')return state.shards.includes(action.id)?state:{...state,shards:[...state.shards,action.id]};
  const book=state.books.find(b=>b.id===action.id);if(!book)return state;
  if(action.type==='take-gig')return state.activeGigs.includes(book.id)||book.trashed?state:{...state,activeGigs:[...state.activeGigs,book.id]};
  if(action.type==='read'){
    if(book.trashed||!Number.isFinite(action.progress))return state;
    const progress=Math.max(book.progress,Math.min(100,Math.max(0,action.progress)));
    const earned=state.activeGigs.includes(book.id)?[10,25,50,75,100].filter(m=>m>book.progress&&m<=progress&&!state.payouts.some(p=>p.id===`${book.id}-${m}`)).map(m=>({id:`${book.id}-${m}`,bookId:book.id,milestone:m,amount:m===100?100:50,date:'2026-10-30'})):[];
    return {...state,balance:state.balance+earned.reduce((sum,p)=>sum+p.amount,0),books:state.books.map(b=>b.id===book.id?{...b,progress,lastRead:'2026-10-30'}:b),payouts:[...earned,...state.payouts]};
  }
  return {...state,books:state.books.map(b=>b.id!==action.id?b:action.type==='rename'?{...b,title:action.title.trim().slice(0,120)||b.title}:action.type==='favorite'?{...b,favorite:!b.favorite}:action.type==='trash'?{...b,trashed:true}:{...b,trashed:false})};
}
export const dailyPages=Array.from({length:31},(_,i)=>({day:i+1,pages:i<22?0:[12,18,30,25,40,21,28,26,0][i-22]}));
