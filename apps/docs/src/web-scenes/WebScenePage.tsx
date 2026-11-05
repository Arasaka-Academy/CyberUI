import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as C from '@cyberui/react';
import { PageTitle } from '../Pages';
import { scenes, webScenes } from '../replica/scenes';
import { useDemo } from '../demo/store';
import { useWebDemo } from './store';
import { type WebSceneId } from './model';
import { Dashboard } from './Dashboard';
import { ProductHome } from './ProductHome';
import { AgentChat } from './AgentChat';
import s from './web.module.css';
type WebScene = typeof webScenes[number];

export function ResetWebScene({ id }: { id: WebSceneId }) {
  const { t } = C.useCyberUI(); const { dispatch } = useWebDemo();
  return <C.AlertDialog title={t('Reset this scene?', '重置当前场景？')} trigger={<C.Button size="sm" variant="ghost" icon="restore">{t('Reset scene', '重置场景')}</C.Button>} confirmLabel={t('Reset scene data', '重置场景数据')} onConfirm={() => dispatch({ type: 'reset-scene', scene: id })}>{t('Restore this scene to its initial state. Your reading data, theme and language are kept.', '恢复当前场景的初始状态，保留阅读数据、主题与语言设置。')}</C.AlertDialog>;
}
export function WebSceneCards() {
  const { t } = C.useCyberUI();
  return <section className={s.gallery} aria-label={t('Web application scenes', 'Web 应用场景')}>
    {webScenes.map((scene, index) => <Link to={'/replica/' + scene.id} key={scene.id} className={s.sceneCard}>
      <div className={s.miniPreview} data-preview={scene.id} aria-hidden="true"><span className={s.miniRail}/><span className={s.miniTop}>{scene.brand} <i>●</i></span><div className={s.miniBody}>{scene.id === 'dashboard' ? <><span/><span/><span/><div/><div/><div/><div/></> : scene.id === 'product-home' ? <><strong>LESS NOISE.<br/>MORE <em>FLOW.</em></strong><div/><span/></> : <><div/><span/><div/><span/><div/></>}</div><span className={s.miniCode}>0{index + 1} / WEB APPLICATION</span></div>
      <div className={s.sceneCardCopy}><span className={s.kicker}>{scene.brand} / {t('INTERACTIVE DEMO', '交互演示')}</span><h2>{t(scene.en, scene.zh)}<C.Icon name="forward" size={18}/></h2><p>{t(scene.description.en, scene.description.zh)}</p><div className={s.cardTags}>{(scene.id === 'dashboard' ? [t('Projects', '项目'), t('Kanban', '看板'), t('Tasks', '任务')] : scene.id === 'product-home' ? [t('Product', '产品'), t('Pricing', '套餐'), t('Trial', '试用')] : [t('Chat', '对话'), t('Tools', '工具'), t('Artifacts', '成果')]).map(tag => <span key={tag}>{tag}</span>)}</div></div>
    </Link>)}
  </section>;
}
export function WebCanvas({ id }: { id: WebSceneId }) {
  const { state } = useWebDemo(); const { t } = C.useCyberUI();
  return <section className={s.canvas} data-web-scene={id} aria-label={t('Interactive Web application', '可交互 Web 应用')}><div key={id + state.resets[id]}>{id === 'dashboard' ? <Dashboard/> : id === 'product-home' ? <ProductHome/> : <AgentChat/>}</div></section>;
}
export function WebScenePage({ scene }: { scene: WebScene }) {
  const { t } = C.useCyberUI(); const navigate = useNavigate();
  return <><C.Breadcrumb items={[{ label: t('Application scenes', '场景演示'), href: '#/replica' }, { label: t(scene.en, scene.zh), href: '#/replica/' + scene.id }]}/><PageTitle code={`SCENE / ${scenes.indexOf(scene) + 1} OF ${scenes.length} · WEB`} title={t(scene.en, scene.zh)} description={t(scene.description.en, scene.description.zh)}/><div className={s.previewToolbar}><C.Select label={t('Scene', '场景')} value={scene.id} options={scenes.map(s => ({ id: s.id, label: t(s.en, s.zh) }))} onChange={id => navigate('/replica/' + id)}/><div className={s.actions}><ResetWebScene id={scene.id}/><Link className="link-button" to={'/preview/' + scene.id} target="_blank" rel="noreferrer">{t('Open standalone', '独立打开')}<C.Icon name="external" size={16}/><span className={s.srOnly}>{t('(new tab)', '（新标签页）')}</span></Link></div></div><WebCanvas id={scene.id}/><div className={s.previewFoot}><Link to="/replica">← {t('All application scenes', '全部应用场景')}</Link><span>{t('LOCAL DEMO', '本地演示')} / 2026.10.30</span></div></>;
}
export function StandaloneScene() {
  const { sceneId } = useParams(); const scene = webScenes.find(s => s.id === sceneId);
  const { t, locale, mode } = C.useCyberUI(); const { dispatch } = useDemo(); const location = useLocation(); const main = useRef<HTMLElement>(null);
  useEffect(() => { document.documentElement.lang = locale; document.title = `${scene?.brand ?? 'CyberUI'} — ${scene ? t(scene.en, scene.zh) : '404'}`; }, [locale, scene, t]);
  useEffect(() => { main.current?.focus(); window.scrollTo(0, 0); }, [location.pathname]);
  if (!scene) return <main className={s.standalone}><h1>404</h1><Link to="/replica">{t('All application scenes', '全部应用场景')}</Link></main>;
  return <div className={s.standalone}><a className={s.skip} href="#preview-main" onClick={e => { e.preventDefault(); main.current?.focus(); }}>{t('Skip to content', '跳至内容')}</a><header className={s.standaloneToolbar}><Link to={'/replica/' + scene.id} className={s.back}><C.Icon name="back" size={16}/><span>CYBERUI <span className={s.hideSmall}>/ {t('Scenes', '场景演示')}</span></span></Link><h1>{t(scene.en, scene.zh)}</h1><div className={s.actions}><ResetWebScene id={scene.id}/><C.Button size="sm" variant="ghost" aria-label={t('Switch to Chinese', 'Switch to English')} onPress={() => dispatch({ type: 'settings', settings: { locale: locale === 'en' ? 'zh-CN' : 'en' } })}>{locale === 'en' ? '中文' : 'EN'}</C.Button><C.IconButton variant="ghost" icon={mode === 'dark' ? 'light' : 'moon'} aria-label={t('Toggle light or dark mode', '切换明暗模式')} onPress={() => dispatch({ type: 'settings', settings: { mode: mode === 'dark' ? 'light' : 'dark' } })}/></div></header><main id="preview-main" tabIndex={-1} ref={main}><WebCanvas id={scene.id}/></main></div>;
}
