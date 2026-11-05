import { useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as C from '@cyberui/react';
import { PageTitle } from '../Pages';
import { products, type Product, type ProductId } from '../products';
import { readerScenes } from '../replica/scenes';
import { ReaderProduct, ResetReader } from '../replica/ReaderProduct';
import { useDemo } from '../demo/store';
import { useWebDemo } from './store';
import { type WebSceneId } from './model';
import { Dashboard } from './Dashboard';
import { ProductHome } from './ProductHome';
import { AgentChat } from './AgentChat';
import { MusicApp } from './MusicApp';
import { Blog } from './Blog';
import s from './web.module.css';

const renderers: Record<ProductId, ComponentType> = { reader: ReaderProduct, dashboard: Dashboard, 'product-home': ProductHome, 'agent-chat': AgentChat, 'mobile-app': MusicApp, blog: Blog };
export function ResetWebScene({ id }: { id: WebSceneId }) {
  const { t } = C.useCyberUI(); const { dispatch } = useWebDemo();
  return <C.AlertDialog title={t('Reset this scene?', '重置当前场景？')} trigger={<C.Button size="sm" variant="ghost" icon="restore">{t('Reset scene', '重置场景')}</C.Button>} confirmLabel={t('Reset scene data', '重置场景数据')} onConfirm={() => dispatch({ type: 'reset-scene', scene: id })}>{t('Restore this product to its initial local demo state. Other products, theme and language are kept.', '将当前产品恢复为初始本地演示状态，保留其他产品的数据、主题与语言设置。')}</C.AlertDialog>;
}
function MiniPreview({ id }: { id: ProductId }) {
  const artwork: Record<ProductId, ReactNode> = {
    reader: <><strong>READ.<br/>DECRYPT.</strong><div className={s.miniBook}>N<span>42%</span></div><span/><span/></>,
    dashboard: <><span/><span/><span/><div/><div/><div/><div/></>,
    'product-home': <><strong>LESS NOISE.<br/>MORE <em>FLOW.</em></strong><div/><span/></>,
    'agent-chat': <><div/><span/><div/><span/><div/></>,
    'mobile-app': <><div className={s.miniPhone}><b>FREQ.</b><i/><small>NIGHT DRIVE</small><span>◀ ▌▌ ▶</span></div><strong>FIND YOUR<br/><em>FREQUENCY.</em></strong></>,
    blog: <><strong>GOOD WORK.<br/>SHARED.</strong><div/><span/><div/><span/></>,
  };
  return artwork[id];
}
export function ProductCards() {
  const { t } = C.useCyberUI();
  return <section className={s.gallery} aria-label={t('Product scenes', '产品场景')}>
    {products.map((product, index) => <Link to={'/replica/' + product.id} key={product.id} className={s.sceneCard} data-product-card={product.id}>
      <div className={s.miniPreview} data-preview={product.id} aria-hidden="true"><span className={s.miniRail}/><span className={s.miniTop}>{product.brand} <i>●</i></span><div className={s.miniBody}><MiniPreview id={product.id}/></div><span className={s.miniCode}>0{index + 1} / PRODUCT SCENE</span></div>
      <div className={s.sceneCardCopy}><span className={s.kicker}>{product.brand} / {t('INTERACTIVE DEMO', '交互演示')}</span><h2>{t(product.en, product.zh)}<C.Icon name="forward" size={18}/></h2><p>{t(product.description.en, product.description.zh)}</p><div className={s.cardTags}>{product.tags.map(tag => <span key={tag.en}>{t(tag.en, tag.zh)}</span>)}</div></div>
    </Link>)}
  </section>;
}
function PreviewToolbar({ product, standalone = false }: { product: Product; standalone?: boolean }) {
  const { t, locale, mode } = C.useCyberUI(); const { dispatch } = useDemo(); const navigate = useNavigate(); const location = useLocation();
  const switchProduct = (id: string) => navigate(`${standalone ? '/preview' : '/replica'}/${id}`);
  return <div className={s.previewToolbar} data-preview-toolbar><C.Select label={t('Product', '产品')} value={product.id} options={products.map(p => ({ id: p.id, label: t(p.en, p.zh) }))} onChange={switchProduct}/><div className={s.actions}>
    {product.id === 'reader' ? <ResetReader/> : <ResetWebScene id={product.id}/>}
    {standalone ? <><C.Button size="sm" variant="ghost" aria-label={t('Switch to Chinese', 'Switch to English')} onPress={() => dispatch({ type: 'settings', settings: { locale: locale === 'en' ? 'zh-CN' : 'en' } })}>{locale === 'en' ? '中文' : 'EN'}</C.Button><C.IconButton variant="ghost" icon={mode === 'dark' ? 'light' : 'moon'} aria-label={t('Toggle light or dark mode', '切换明暗模式')} onPress={() => dispatch({ type: 'settings', settings: { mode: mode === 'dark' ? 'light' : 'dark' } })}/></> : <Link className="link-button" to={location.pathname.replace(/^\/replica/, '/preview') + location.search} target="_blank" rel="noreferrer">{t('Open standalone', '独立打开')}<C.Icon name="external" size={16}/><span className={s.srOnly}>{t('(new tab)', '（新标签页）')}</span></Link>}
  </div></div>;
}
export function WebCanvas({ id }: { id: ProductId }) {
  const { state } = useWebDemo(); const { t } = C.useCyberUI(); const location = useLocation(); const Renderer = renderers[id];
  const invalid = ['dashboard', 'product-home', 'agent-chat'].includes(id) && location.pathname.split('/').filter(Boolean).length > 2;
  return <section className={s.canvas} data-web-scene={id} data-product-scene={id} aria-label={t('Interactive Web application', '可交互 Web 应用')}><div key={id + (id === 'reader' ? '' : state.resets[id])}>{invalid ? <C.EmptyState title="404 // PAGE NOT FOUND"/> : <Renderer/>}</div></section>;
}
export function ProductPage({ product }: { product: Product }) {
  const { t } = C.useCyberUI(); const location = useLocation(); const readerPage = product.id === 'reader' ? readerScenes.find(s => s.id === location.pathname.split('/')[3]) : undefined;
  const crumbs = [{ label: t('Application scenes', '场景演示'), href: '#/replica' }, { label: t(product.en, product.zh), href: '#/replica/' + product.id }, ...(readerPage ? [{ label: t(readerPage.en, readerPage.zh), href: '#' + location.pathname + location.search }] : [])];
  return <><C.Breadcrumb items={crumbs}/><PageTitle code={`PRODUCT / 0${products.indexOf(product) + 1} OF 0${products.length}`} title={t(product.en, product.zh)} description={t(product.description.en, product.description.zh)}/><PreviewToolbar product={product}/><WebCanvas id={product.id}/><div className={s.previewFoot}><Link to="/replica">← {t('All application scenes', '全部应用场景')}</Link><span>{t('LOCAL DEMO', '本地演示')} / 2026.10.30</span></div></>;
}
export function StandaloneScene() {
  const { sceneId } = useParams(); const product = products.find(p => p.id === sceneId);
  const { t, locale } = C.useCyberUI(); const location = useLocation(); const main = useRef<HTMLElement>(null);
  useEffect(() => { document.documentElement.lang = locale; document.title = `${product?.brand ?? 'CyberUI'} — ${product ? t(product.en, product.zh) : '404'}`; }, [locale, product, t]);
  useEffect(() => { main.current?.focus(); window.scrollTo(0, 0); }, [location.pathname]);
  if (!product) return <main className={s.standalone}><h1>404</h1><Link to="/replica">{t('All application scenes', '全部应用场景')}</Link></main>;
  return <div className={s.standalone}><a className={s.skip} href="#preview-main" onClick={e => { e.preventDefault(); main.current?.focus(); }}>{t('Skip to content', '跳至内容')}</a><header className={s.standaloneToolbar}><Link to={location.pathname.replace(/^\/preview/, '/replica') + location.search} className={s.back}><C.Icon name="back" size={16}/><span>CYBERUI <span className={s.hideSmall}>/ {t('Scenes', '场景演示')}</span></span></Link><h1>{t(product.en, product.zh)}</h1></header><div className={s.standaloneControls}><PreviewToolbar product={product} standalone/></div><main id="preview-main" tabIndex={-1} ref={main}><WebCanvas id={product.id}/></main></div>;
}
