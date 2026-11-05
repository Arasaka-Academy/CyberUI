'use client';
import './styles.css';
import { createContext, useContext, useRef, useSyncExternalStore, useImperativeHandle, type CSSProperties, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { I18nProvider } from 'react-aria-components';
import { UNSAFE_PortalProvider } from 'react-aria';
import { createTheme, type Locale, type Mode, type Palette, type Scheme, type ThemeMode } from '@cyberui/tokens';

interface ThemeContextValue { locale: Locale; scheme: Scheme; mode: Mode; t: (en: string, zh: string) => string }
const ThemeContext = createContext<ThemeContextValue>({ locale:'en', scheme:'neon', mode:'dark', t: en => en });
const subscribe = (callback: () => void) => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change',callback); return () => media.removeEventListener('change',callback);
};
const snapshot = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
export interface CyberUIProviderProps extends HTMLAttributes<HTMLDivElement> {
  scheme?: Scheme; mode?: ThemeMode; locale?: Locale; customColors?: Partial<Palette>; children: ReactNode; ref?:Ref<HTMLDivElement>;
}
export function CyberUIProvider({ scheme='neon',mode='dark',locale='en',customColors,children,style,ref,...props }: CyberUIProviderProps) {
  const dark = useSyncExternalStore(subscribe,snapshot,() => false);
  const resolved = mode==='system' ? dark?'dark':'light' : mode;
  const theme = createTheme(scheme,resolved,customColors);
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref,()=>root.current!);
  const variables = Object.fromEntries(Object.entries(theme).map(([key,value]) => ['--cyber-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value]));
  return <ThemeContext.Provider value={{ locale,scheme,mode:resolved,t:(en,zh)=>locale==='zh-CN'?zh:en }}>
    <I18nProvider locale={locale}>
      <div {...props} ref={root} data-cyberui="" data-scheme={scheme} data-mode={resolved} lang={locale} style={{ ...variables,...style } as CSSProperties}>
        <UNSAFE_PortalProvider getContainer={() => root.current ?? document.body}>{children}</UNSAFE_PortalProvider>
      </div>
    </I18nProvider>
  </ThemeContext.Provider>;
}
export const useCyberUI = () => useContext(ThemeContext);
