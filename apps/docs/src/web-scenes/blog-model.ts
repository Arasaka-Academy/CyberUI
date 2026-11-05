import { blogPosts } from './blog-data';
export interface BlogState { bookmarks: string[] }
export type BlogAction = { type: 'bookmark'; slug: string };
export const initialBlog = (): BlogState => ({ bookmarks: [] });
export function blogReducer(state: BlogState, action: BlogAction): BlogState {
  if (!blogPosts.some(post => post.slug === action.slug)) return state;
  return { bookmarks: state.bookmarks.includes(action.slug) ? state.bookmarks.filter(slug => slug !== action.slug) : [...state.bookmarks, action.slug] };
}
export function hydrateBlog(value: unknown): BlogState {
  if (!value || typeof value !== 'object' || !('bookmarks' in value) || !Array.isArray(value.bookmarks)) return initialBlog();
  return { bookmarks: [...new Set(value.bookmarks.filter((slug): slug is string => typeof slug === 'string' && blogPosts.some(post => post.slug === slug)))] };
}
