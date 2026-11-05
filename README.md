# CyberUI Web

CyberUI 是一套 React 组件库与中英双语展示站，采用硬边、切角、开放角框、条码和七套明暗配色，提供完整的 Web 表单、键盘、焦点和响应式交互。

设计与交互规范使用 `ui-ux-pro-max` 辅助制定。

## 本地启动

使用 Node.js 22.13+ 和 pnpm 11；本次验证使用 Node.js 22.22。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

默认地址为 `http://127.0.0.1:5173`。端口被占用时，Vite 会显示实际地址；也可指定端口：

```sh
pnpm dev --port 5174
```

站点默认显示简体中文与 Neon 深色主题。右上角可切换英文、明暗模式；`⌘/Ctrl K` 打开全站搜索。主要入口为 `/#/components`、`/#/foundations`、`/#/themes` 和 `/#/replica`。

## 交付内容

| 目录 | 内容 |
| --- | --- |
| `packages/tokens` | `@cyberui/tokens`：七套主题配色、明暗模式、几何、间距、字体配置及可读性派生色 |
| `packages/react` | `@cyberui/react`：65 类组件，ESM、TypeScript 声明、独立 CSS 与可选字体样式 |
| `apps/docs` | React + Vite 展示站、组件参数预览、代码复制、属性和键盘文档 |
| `apps/docs/src/replica` | 30 个场景的注册与总览、27 个阅读场景、19 张参考图和 31 个分区映射 |
| `apps/docs/src/web-scenes` | ORBIT 项目管理、PULSE AI 产品官网、NOVA Agent 聊天；独立画布与本地演示状态 |
| `registry.json`、`registry/cyberui` | GitHub Registry 清单与自动生成的可复制组件源码 |
| `public` | 本地字体、SVG 图标、品牌素材和视觉参考图 |
| `design-system/cyberui` | 设计规范与 token 约定 |
| `artifacts` | 浏览器截图、逐图对照、打包接入结果和无障碍扫描记录 |

组件按基础与容器 10、表单 16、导航 9、反馈与浮层 11、数据展示 6、特色组件 13 分类。外观变体单独展示，不计入 65 类的数量。

演示区包含首页、书库、详情、搜索、收藏、历史、回收站，阅读日志、统计、连续阅读、日历、目标、诊断，系统、配色、字体、封面、休眠，身份卡、顶部菜单身份／控制页，任务、收益、碎片、四类共 20 种商店外观，以及五种 Jack-in 卡片。

新增的三个 Web 演示支持内嵌预览与独立打开：

| 场景 | 内嵌预览 | 独立页面 |
| --- | --- | --- |
| ORBIT 项目管理 Dashboard | `/#/replica/dashboard` | `/#/preview/dashboard` |
| PULSE AI 产品官网 | `/#/replica/product-home` | `/#/preview/product-home` |
| NOVA Agent 聊天工作台 | `/#/replica/agent-chat` | `/#/preview/agent-chat` |

任务管理、试用表单、聊天流式回复、工具记录和成果下载均可实际操作。项目与会话单独保存、独立重置，支持中英文及七套明暗主题。详细交互和本地模型边界见 [Web 场景说明](docs/web-scenes.md)。

## 从 GitHub 按需加入源码

全部 65 类组件支持 shadcn GitHub Registry，无需发布或安装 CyberUI npm 包。组件、CSS Modules 和必要公共源码进入你的项目，之后可以直接修改。已通过真实 GitHub 安装验收的稳定版本：

```sh
pnpm dlx shadcn@4.23.0 add Arasaka-Academy/CyberUI/button#84742e5a210c991e5f82ad5bf9c842f096daabd9
```

合并到默认分支后，可使用跟随默认分支的尝鲜命令：

```sh
pnpm dlx shadcn@4.23.0 add Arasaka-Academy/CyberUI/button
```

不带 ref 的命令读取默认分支，需该分支已包含 registry；也可在组件地址后追加 `#` 与包含 registry 的完整提交 SHA。已验证的固定版本命令见展示站组件页。React 19 的 Vite 与 Next.js 接入、手动复制、可选字体和更新方式见 [源码接入指南](docs/source-installation.md) 或展示站 `/#/installation`。

维护原始组件后运行 `pnpm registry:build`，再运行 `pnpm registry:check` 检查生成源码；`pnpm test:registry` 验证独立项目安装。

## 本地组件包接入

先构建本地包：

```sh
pnpm build
pnpm --filter @cyberui/tokens pack --pack-destination ../../artifacts/packages
pnpm --filter @cyberui/react pack --pack-destination ../../artifacts/packages
```

组件包使用 React 19。尚未向公共注册表发布；在另一个 pnpm 项目中安装两个 `.tgz`。本地接入时，在该项目的 `pnpm-workspace.yaml` 中将 tokens 的间接依赖也指向同一个包：

```yaml
overrides:
  '@cyberui/tokens': file:/absolute/path/CyberUI/artifacts/packages/cyberui-tokens-0.1.0.tgz
```

```sh
pnpm add react@19 react-dom@19 /absolute/path/CyberUI/artifacts/packages/cyberui-tokens-0.1.0.tgz /absolute/path/CyberUI/artifacts/packages/cyberui-react-0.1.0.tgz
```

```tsx
import { useRef, useState } from 'react';
import { CyberUIProvider, Button, Input, Progress } from '@cyberui/react';
import '@cyberui/react/styles.css';
import '@cyberui/react/fonts.css'; // 可选：本地 Oxanium、Share Tech Mono 及其他字体配置

export default function App() {
  const input = useRef<HTMLInputElement>(null);
  const [handle, setHandle] = useState('NOVA_7');
  return (
    <CyberUIProvider scheme="neon" mode="dark" locale="zh-CN">
      <Input ref={input} name="handle" label="操作员代号"
        value={handle} onChange={event => setHandle(event.target.value)} />
      <Button variant="primary" onPress={() => input.current?.focus()}>
        连接终端
      </Button>
      <Progress value={42} label="已解密" variant="heartbeat" />
    </CyberUIProvider>
  );
}
```

`CyberUIProvider` 接受 `scheme`、`mode: 'dark' | 'light' | 'system'`、`locale: 'en' | 'zh-CN'` 和 `customColors`。自定义颜色采用 `#RRGGBB`。主题编辑器可即时预览并复制配置。

普通输入保留原生事件、属性与输入 ref。复合控件的 `ref` 指向根节点；`NumberInput`、`Combobox`、`ColorPicker` 额外提供 `inputRef`，选择器提供 `buttonRef`。`FileUpload.ref` 指向原生文件输入。模态组件的 ref 指向弹窗内容，静态容器指向其语义宿主。以包内类型声明和组件属性表为准。

状态控件支持受控与非受控模式，例如 `value/defaultValue/onChange`、`isSelected/defaultSelected/onChange` 或分页的 `page/defaultPage/onChange`。复杂交互基于 React Aria Components，图表基于 Recharts；样式使用 CSS Modules 和 `--cyber-*` CSS 变量。

## 演示数据

演示使用 `localStorage` 的 `cyberui-web-demo-v1`，固定参考时间为 `2026-10-30 17:46`。可以搜索与筛选、重命名、收藏、删除并恢复书籍，推进阅读任务、领取一次性里程碑收益、购买并装备外观、恢复碎片、保存设置。演示页面的“重置演示”可恢复初始数据。

头像上传用于当前页面的本地预览。阅读器硬件、真实阅读引擎、网络诊断读数与更新服务使用演示模型。中英文为完整界面语言，德语、俄语、土耳其语和希腊语仅提供样本展示。

## 验证与静态构建

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
pnpm test:consumer
pnpm preview --port 4175
```

`test:consumer` 在系统临时目录创建独立 React 项目，安装真实打包产物，编译全部 65 份文档示例，运行 Vite 构建和浏览器交互测试。它优先使用本机 pnpm 离线缓存；新环境需要先完成一次依赖安装以填充缓存。
也可用 `CYBERUI_CONSUMER_OFFLINE=0 pnpm test:consumer` 允许独立项目在线安装依赖。

静态产物在 `apps/docs/dist`，可部署到任意支持静态文件的服务器。使用相对资源路径和 HashRouter，支持子目录托管，无需服务端路由回退。通过 HTTP 预览，避免直接以 `file://` 打开模块。公共发布另行处理。

可对生产预览执行同一组测试，或重新生成逐图对照：

```sh
CYBERUI_BASE_URL=http://127.0.0.1:4175 pnpm test:e2e
CYBERUI_BASE_URL=http://127.0.0.1:4175 node scripts/capture-references.mjs
```

详细证据见 [验收记录](docs/validation.md)、[场景参考与视觉差异](docs/reference-map.md) 和 [设计规范](design-system/cyberui/MASTER.md)。逐图图片见 [本地对照档案](artifacts/reference-comparisons/index.html)。

## 许可与使用边界

代码采用 [MIT](LICENSE)。第三方素材和字体的许可证、版权声明保存在 [licenses](licenses/upstream-NOTICE.md) 及字体目录中。

书籍封面采用本地原创 ASCII 图案；浏览器字体度量、翻译文本、初始装备和演示数据会造成视觉差异。Web 控件的焦点、点击区域、可读性和滚动也有适配。因此对照档案用于逐项复核，不代表逐像素一致。

For English readers: use **EN** in the live site. All 65 component pages and all 30 scene interfaces are available in English. This repository delivers local packages and a static documentation build; it does not publish to npm or operate reader hardware.
