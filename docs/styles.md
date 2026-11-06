# Tailwind 样式基础

CyberUI 的组件库、文档站与全部六个产品场景统一使用 Tailwind 4.3.4。组件的通用样式通过 `@apply` 编写，页面可直接使用 `tw:` 工具类；CSS Modules 继续负责语义选择器、状态、伪元素和精确几何。全仓库省略 Preflight，沿用限定在 `[data-cyberui]` 内的基础样式。

## 入口与主题

- `packages/tokens/src/tokens.css` 是几何、间距和动效时长的 CSS 默认值来源。
- `packages/react/src/tailwind-theme.css` 是共享的 `@theme inline` 映射；颜色、字体、间距与动画直接引用消费元素上的 `--cyber-*` 变量，支持运行时主题与嵌套主题。
- `packages/react/src/styles.css` 导入主题、基础变量与全局动效。`apps/docs/src/tailwind.css` 扫描全部文档站源码，提供页面工具类；原来的 ORBIT 专用入口已合并到这里。
- 组件与文档站使用 Vite 的 Tailwind 插件。Registry 的 Vite 消费者使用同一插件；Next.js 使用 `@tailwindcss/postcss`。

所有入口先声明 `@layer theme, base, components, utilities`。组件默认样式与现有作用域基础样式放在 `components` 层，保持原有焦点规则的优先级；间距/动效默认变量放在 `base` 层。应用工具类位于 `utilities` 层，可覆盖普通组件默认值。

## 编写组件样式

每个组件样式模块引用共享主题，在 `components` 层内使用工具类：

```css
@layer theme, base, components, utilities;
@reference './tailwind-theme.css';

@layer components {
  .layout {
    @apply tw:flex tw:items-center tw:gap-cyber-md tw:p-cyber-xl;
  }
  .label {
    @apply tw:text-cyber-ink tw:font-cyber-display tw:text-[length:13px];
  }
}
```

间距 `xs/sm/md/lg/xl/2xl/3xl/4xl/5xl` 对应 `4/6/10/14/18/24/32/48/64px`。新布局优先复用该尺度。已有布局不在尺度中的值，如 `8/12/16/20/22px`，保留精确 arbitrary values，避免迁移造成外观变化。字号使用明确的 `length:` 类型，颜色与字体优先使用 `cyber-*` 语义工具类。

原生 CSS 保留切角路径、装饰绘制、精确边框/阴影/渐变、复杂字体简写和状态过渡。动态尺寸、图表坐标、进度与 Provider 主题变量继续使用 CSS 自定义属性或内联 style，不拼接动态 Tailwind 类名。完整动画值保存在 `--cyber-motion-*` 中，避免 CSS Modules 局部化动画名称；`motion.css` 仅定义一次公共关键帧。

## 公共样式复用

`field.module.css` 负责标签、说明、错误与输入行；`input.module.css` 负责输入表面与状态；`choice.module.css` 负责选择器触发器与选项；`popover.module.css` 负责浮层。组件直接导入所需模块，通过现有 `cx` 组合类名：

```tsx
import fieldStyles from './field.module.css';
import inputStyles from './input.module.css';
import local from './example.module.css';
import { cx } from './shared';

<div className={fieldStyles.field}>
  <input className={cx(inputStyles.input, local.variant)} />
</div>
```

不用 CSS Modules `composes` 引入包含 `@apply` 的样式。Vite 的前置 Tailwind 编译不会重新处理这种依赖，会让未展开的指令进入产物。此次将 66 处组合迁入 17 份组件源码，并删除 7 份只负责转接的样式模块，公共样式仍各自维护一份。Stylelint 会拒绝重新引入 `composes`。

## 页面与定制

文档站全部页面均可使用工具类，六个产品场景的公共布局、排版和尺寸也通过 Tailwind 编译，不再限定 ORBIT 试点。既有场景的容器查询保留原有阈值和包含端点的条件；嵌入展示观察命名为 `scene` 的容器。ORBIT 的 `orbit-medium/narrow/compact` 保留 `1150/850/580px`。

```tsx
<div className="tw:grid tw:grid-cols-2 tw:gap-cyber-md">
  <Button size="lg" className="tw:px-[12px] tw:text-cyber-ink">自定义按钮</Button>
</div>
```

`className` 中的普通工具类可以覆盖组件默认样式，包括 size、variant 选择器。相互冲突的工具类仍遵循 Tailwind 生成顺序；类名在字符串中的先后顺序不提供覆盖保证。项目中原有的 `!important`、行内样式与减少动态效果规则继续遵循 CSS 级联，不用全局 important 模式。

## 分发与接入

**组件包**提供编译后的 `@cyberui/react/styles.css`，宿主不需要安装 Tailwind。可选的 `@cyberui/react/tailwind.css` 是原始主题入口；宿主要使用同一套语义工具类时，新建独立的 `src/cyberui.css`，导入该主题，再加入带 `tw` 前缀的 utilities 与自己的源码扫描路径。该主题入口需要编译插件：

```css
@layer theme, base, components, utilities;
@import '@cyberui/react/tailwind.css';
@import 'tailwindcss/utilities.css' layer(utilities) prefix(tw) source(none);
@source './';
```

从 `main.tsx` 或 Next.js 的 `layout.tsx` 直接导入这个 CSS 文件，与宿主现有的 Tailwind 全局 CSS 分别编译。Tailwind 每个编译入口只有一个前缀；不要通过宿主全局 CSS 的 `@import` 合并上述主题或文件，否则会把宿主工具类也切换到 `tw:`，导致原有布局样式丢失。Next.js 的 `src/app/cyberui.css` 将扫描路径改为 `../`。组件包的成品 CSS 仍照常导入。

**Registry 源码**包含 `@apply`、`@reference` 与共享主题，因此需要 Tailwind v4 编译环境。这是相对于旧版源码接入的要求变更。生成器追踪 TypeScript、CSS import/reference 依赖，声明编译依赖并保留 CSS Modules；Vite/Next.js 完整配置见[源码接入说明](source-installation.md)。安装旧的固定提交时，以该提交自带的文档为准。

Tailwind v4 的浏览器最低要求见[官方兼容性说明](https://tailwindcss.com/docs/compatibility)：Chrome 111、Safari 16.4、Firefox 128。完整迁移后，组件源码与成品 CSS 都按这组浏览器要求维护。

## 检查与验收

`pnpm lint` 同时运行 ESLint 与 Stylelint。Stylelint 检查 CSS 属性、无效颜色、重复声明、空规则及间距/时长变量约定；也检查 `@apply` 中已有尺度的像素值，例如拒绝 `tw:gap-[10px]`，要求使用 `tw:gap-cyber-md`。生成的 Registry 与构建产物不重复 lint。

```sh
pnpm registry:build
pnpm registry:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
pnpm test:consumer
pnpm test:registry
```

新增回归检查工具类对组件 size/variant 的覆盖，以及 Textarea、Select 的公共表单样式；编译测试拒绝成品 CSS 中残留 `@apply` 或 `@reference`。打包消费者仍在无 Tailwind 环境运行。源码消费者在已有宿主 Tailwind 的独立 Vite、Next.js 项目中使用真实 shadcn CLI 安装全部 65 个组件，构建并渲染全部示例，再检查宿主的 `flex/gap-4/p-4/font-semibold`、CyberUI 工具类覆盖和键盘交互。

本次迁移前后的 89 组计算样式记录覆盖 65 个组件及六个产品的嵌入/独立页面；32 张代表性首屏截图涵盖 1440/375px。默认 Neon 深色条件下的约 200 万项属性比较与截图比较均无差异；这不外推为所有主题、交互状态或浏览器均像素相同。七套明暗主题、中英文、焦点、Escape、响应式与减少动态效果由浏览器回归另行验证。

## 测量与证据

此前 ORBIT 试点证据保留在 `artifacts/styles/`。本次完整迁移证据单独保存在 `artifacts/tailwind/`，包括压缩的计算样式记录、截图、规则比较、消费者结果与构建测量。

`node scripts/capture-styles.mjs before|after` 在同一生产预览地址采集记录，地址可用 `CYBERUI_BASE_URL` 指定。`CYBERUI_STYLE_ARTIFACTS=artifacts/tailwind node scripts/measure-styles.mjs after` 连续执行三次完整生产构建并记录 CSS 原始/gzip 大小。迁移前数据来自已完成试点的测量，CSS 字节数也通过本次迁移前的生产构建复核。

Tailwind 的层、属性注册和工具类会增加输出，采用框架并不保证 CSS 更小或构建更快。比较时区分运行时主 CSS、可选原始主题入口、文档站场景与字体样式；只依据实际测量评价成本。

## 本次测量（2026-11-05）

对照是完成 ORBIT 试点后的状态；原始试点数据保留，不覆盖旧记录。当前测量环境为 Node 22.22.0、pnpm 11.3.0。

| 指标 | ORBIT 试点后 | 整体迁移后 |
| --- | ---: | ---: |
| 组件主 CSS | 41,905 B | 49,983 B（增加 19.3%） |
| 组件主 CSS gzip | 8,237 B | 8,544 B（增加 3.7%） |
| 展示站全部 CSS（含字体） | 167,573 B | 182,619 B（增加 9.0%） |
| 展示站全部 CSS gzip | 29,513 B | 30,314 B（增加 2.7%） |
| 可选原始 Tailwind 主题入口 | 无 | 1,878 B / gzip 490 B |
| 完整生产构建三次 | 10.350 / 9.069 / 10.727 s | 9.341 / 8.980 / 8.929 s |

主 CSS 增长来自级联层、Tailwind 属性注册与通用工具类输出。可选原始主题入口单独列出，不计入运行时主 CSS；仅由需要共享工具类主题的宿主导入。构建时间区间重叠，且基线来自上一阶段测量，不认定构建速度提升。源码共迁移 4,227 条通用声明，64 份组件样式模块、5 份文档/场景样式与共享基础样式都使用相同的主题和编译流程。

源规则审计对 1,856 组规则中的 5,083 项原始声明作了比较，展开间距变量并识别编译器生成的两处 color-mix 渐进增强后，没有缺失或数值差异。公共 CSS 的 66 处 composes 元数据改为直接模块引用，不作为样式数值变化统计。这些迁移测量记录对应发布前的本地构建与 Chromium 验证；v0.2.0 的修复与发布范围见[发布说明](releases/v0.2.0.md)，最新工程验收见[验收记录](validation.md)。
