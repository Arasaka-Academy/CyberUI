import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Select, SegmentedControl, Spinner, Tabs, useCyberUI } from '@cyberui/react';
import registry from '../../../registry.json';
import version from './registry-version.json';
import { exampleComponentNames } from './ComponentDemo';
import { CodeBlock } from './CodeBlock';

const files = import.meta.glob<string>('../../../registry/cyberui/*', { query: '?raw', import: 'default' });
const repo = 'Arasaka-Academy/CyberUI';
const slug = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export default function ComponentSource({ name }: { name: string }) {
  const { t } = useCyberUI();
  const item = registry.items.find(item => item.meta.componentName === name)!;
  const [track, setTrack] = useState(version.ref ? 'pinned' : 'latest');
  const [selected, setSelected] = useState(`registry/cyberui/${item.name}.tsx`);
  const [source, setSource] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const address = (component: string) => `${repo}/${slug(component)}${track === 'pinned' && version.ref ? '#' + version.ref : ''}`;
  const command = `pnpm dlx shadcn@4.23.0 add ${exampleComponentNames(name).map(address).join(' ')}`;
  useEffect(() => {
    let active = true;
    setSource(null); setFailed(false);
    const load = files['../../../' + selected];
    if (!load) { setFailed(true); return; }
    load().then(value => { if (active) setSource(value); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [selected, attempt]);

  return <section className="component-source" aria-label={t('Get component source', '获取组件源码')}>
    <div className="section-heading compact"><h2>{t('Make it yours', '加入你的项目')}</h2><Badge>GITHUB / SOURCE</Badge></div>
    <Tabs label={t('Installation method', '安装方式')} items={[
      { id: 'install', label: t('Command', '命令添加'), content: <>
        <p>{t('Add the source to your project. Edit it freely. No CyberUI npm package required.', '将组件源码加入项目，随时修改，无需安装 CyberUI npm 包。')}</p>
        {version.ref && <SegmentedControl label={t('Source version', '源码版本')} value={track} onChange={setTrack} options={[{ id: 'pinned', label: t('Release version', '发布版本') }, { id: 'latest', label: t('Default branch', '默认分支') }]} />}
        <CodeBlock code={command} language="TERMINAL / PNPM" copyLabel={t('Copy install command', '复制安装命令')} />
        <p className="doc-note">{t('Current sources require React 19, Tailwind v4 and components.json. The command includes components used by the example below; files follow your components directory setting.', '当前源码需要 React 19、Tailwind v4 和 components.json。命令包含下方示例所用的组合组件，文件位置遵循你的 components 目录配置。')} <Link to="/installation">{t('Vite & Next.js setup →', 'Vite 与 Next.js 接入指南 →')}</Link></p>
      </> },
      { id: 'source', label: t('Source files', '源码文件'), content: <>
        <p>{t('Copy these current Tailwind v4 sources into the same cyberui directory. Shared files only need to be added once.', '将这些使用 Tailwind v4 的当前源码保存到同一个 cyberui 目录，公共文件只需加入一次。')}</p>
        <Select label={t('Source file', '源码文件')} value={selected} onChange={setSelected} options={item.files.map(file => ({ id: file.path, label: file.path.split('/').pop()! }))} />
        <p className="source-destination"><code>{item.files.find(file => file.path === selected)?.target}</code></p>
        {failed ? <div role="alert"><p>{t('Unable to load this file.', '暂时无法加载此文件。')}</p><Button onPress={() => setAttempt(value => value + 1)}>{t('Retry', '重试')}</Button></div> : source === null ? <Spinner label={t('Loading source', '加载源码')} /> : <CodeBlock code={source} language={selected.split('/').pop()!} copyLabel={t('Copy selected file', '复制当前文件')} />}
        <details className="source-dependencies"><summary>{t('Dependencies and setup', '依赖与初始化')}</summary><p>{t('Install runtime and compiler dependencies, configure the Vite or PostCSS plugin, then wrap your application in CyberUIProvider. Copy the listed license files too.', '安装运行与编译依赖，配置 Vite 或 PostCSS 插件，并在应用外层放置 CyberUIProvider；请同时保留清单中的许可证文件。')}</p><CodeBlock code={`pnpm add ${item.dependencies.join(' ')}`} language="TERMINAL / PNPM" copyLabel={t('Copy dependency command', '复制依赖安装命令')} /><CodeBlock code={`pnpm add -D ${item.devDependencies.join(' ')}`} language="COMPILER / PNPM" copyLabel={t('Copy compiler command', '复制编译依赖命令')} /><Link to="/installation">{t('Complete setup guide →', '查看完整接入指南 →')}</Link></details>
      </> }
    ]} />
  </section>;
}
