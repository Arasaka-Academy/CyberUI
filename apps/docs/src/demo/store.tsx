import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { schemes, fontSets } from '@cyberui/tokens';
import { demoReducer, initialDemoState, type DemoAction, type DemoState } from './model';
const key='cyberui-web-demo-v1';
function load():DemoState {
  try {
    const saved=JSON.parse(localStorage.getItem(key)??'null') as DemoState|null;
    if(saved?.version===1&&Array.isArray(saved.books)&&saved.books.every(b=>typeof b.id==='string'&&typeof b.title==='string'&&typeof b.progress==='number'&&Array.isArray(b.collections))&&Number.isFinite(saved.balance)&&Array.isArray(saved.owned)&&Array.isArray(saved.activeGigs)&&Array.isArray(saved.payouts)&&Array.isArray(saved.shards)&&saved.equipped&&typeof saved.handle==='string'&&saved.settings&&saved.settings.scheme in schemes&&['dark','light','system'].includes(saved.settings.mode)&&['en','zh-CN'].includes(saved.settings.locale)&&fontSets.some(f=>f.id===saved.settings.font))return {...initialDemoState(),...saved,settings:{...initialDemoState().settings,...saved.settings}};
  }catch{/* A broken or unavailable local store starts a fresh demo. */}
  return initialDemoState();
}
const Context=createContext<{state:DemoState;dispatch:Dispatch<DemoAction>}>({state:initialDemoState(),dispatch:()=>{}});
export function DemoStore({children}:{children:ReactNode}) {
  const [state,dispatch]=useReducer(demoReducer,undefined,load);
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{/* The demo remains usable without persistent storage. */}},[state]);
  return <Context.Provider value={{state,dispatch}}>{children}</Context.Provider>;
}
export const useDemo=()=>useContext(Context);
