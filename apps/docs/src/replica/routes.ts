import { useLocation } from 'react-router-dom';
import type { ReaderSceneId } from './scenes';
export const previewPrefix = (pathname: string) => pathname.startsWith('/preview/') ? '/preview' : '/replica';
export function readerPath(pathname: string, page: ReaderSceneId | 'references' = 'home', query = '') {
  return `${previewPrefix(pathname)}/reader/${page}${query ? '?' + query.replace(/^\?/, '') : ''}`;
}
export function useReaderPath() { const { pathname } = useLocation(); return (page: ReaderSceneId | 'references' = 'home', query = '') => readerPath(pathname, page, query); }
