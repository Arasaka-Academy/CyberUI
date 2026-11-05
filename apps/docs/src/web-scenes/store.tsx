import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { hydrateWebState, initialWebState, webReducer, type WebAction, type WebState } from './model';
export const webStorageKey = 'cyberui-web-scenes-v1';
const Context = createContext<{ state: WebState; dispatch: Dispatch<WebAction> }>({ state: initialWebState(), dispatch: () => {} });
function load() { try { return hydrateWebState(localStorage.getItem(webStorageKey)); } catch { return initialWebState(); } }
export function WebDemoStore({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(webReducer, undefined, load);
  useEffect(() => { try { localStorage.setItem(webStorageKey, JSON.stringify(state)); } catch { /* Memory state remains available when storage is unavailable. */ } }, [state]);
  return <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>;
}
export const useWebDemo = () => useContext(Context);
