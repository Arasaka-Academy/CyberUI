# 从 GitHub 加入 CyberUI 源码

CyberUI 不需要发布到 npm。shadcn 4.23.0 直接读取此仓库根部的 registry.json，将选中的组件、CSS Modules、主题 Provider 和工具源码加入你的项目。之后直接编辑本地文件。

要求 Node.js 22.13+、React 19、TypeScript 和 Tailwind 4.3.4；支持 Vite 和 Next.js App Router。源码样式使用 Tailwind `@apply`，需要配置编译插件。打包后的 `@cyberui/react` 已包含成品 CSS，不要求消费者安装 Tailwind。

## 准备项目

已有 shadcn 项目保留现有 components.json。新项目配置 `@/*` 指向 `src/*`，并添加以下 components.json；Vite 还需要在 resolve.alias 中设置 `@` 指向 src。

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks",
    "utils": "@/lib/utils"
  }
}
```

Vite 创建 src/styles.css 并在 main.tsx 导入。Next.js 使用 src/ 时将 `rsc` 设为 true、`tailwind.css` 设为 src/app/globals.css；不使用 src/ 时改为 app/globals.css，并将 `@/*` 指向项目根目录。

Vite 安装编译插件，并加入现有配置的 `plugins`：

```sh
pnpm add -D tailwindcss@4.3.4 @tailwindcss/vite@4.3.4
```

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 保留项目现有的 resolve.alias 等配置。
});
```

Next.js 使用 PostCSS 插件。在已有 postcss.config.mjs 中合并配置，保留其他插件：

```sh
pnpm add -D tailwindcss@4.3.4 @tailwindcss/postcss@4.3.4
```

```js
export default { plugins: { '@tailwindcss/postcss': {} } };
```

已有 Tailwind v4 项目可以复用编译插件。CyberUI 使用 `tw:` 前缀；按下文将工具类放在独立 CSS 编译入口后，宿主原有工具类可以继续使用自己的前缀。

## 加入组件

v0.2.1 使用 Tailwind v4 编译，安装固定发布版本：

```sh
pnpm dlx shadcn@4.23.0 add Arasaka-Academy/CyberUI/button#v0.2.1
```

默认分支包含 registry 后，可执行：

```sh
pnpm dlx shadcn@4.23.0 add Arasaka-Academy/CyberUI/button
```

默认保存到 src/components/cyberui/；修改 aliases.components 即可自定义目录。每个 registry 项完整列出自身所需文件，普通组件不安装 Recharts。示例组合其他组件时，组件页的命令会同时列出它们。

在地址后加 `#v0.2.1` 或 `#` 和完整的 40 位 commit SHA，可从包含 registry 的任意提交安装。源码和公共文件都会从同一提交读取；不依赖默认分支的合并进度。展示站“发布版本”会给出已经通过独立项目验收的完整命令。

## 在项目中使用

```tsx
'use client';
import { CyberUIProvider } from '@/components/cyberui/provider';
import { Button } from '@/components/cyberui/button';

export default function App() {
  return (
    <CyberUIProvider scheme="neon" mode="dark" locale="zh-CN">
      <Button variant="primary">连接终端</Button>
    </CyberUIProvider>
  );
}
```

Provider 自动导入限定在 `[data-cyberui]` 内的基础 CSS。七套明暗主题、system 模式、语言及 customColors 的参数与原有组件包一致。

## 使用页面工具类

安装组件后，新建独立的 `src/cyberui.css`，保留宿主现有的 `src/styles.css` 或 `globals.css`。Tailwind 的前缀作用于整个编译入口，因此必须从 JS/TS 分别导入两个 CSS 文件；不要在已有 Tailwind 样式中通过 CSS `@import` 引入 CyberUI 主题或此文件，否则宿主的无前缀或其他前缀工具类会停止生成。

Vite 的 `src/cyberui.css`：

```css
@layer theme, base, components, utilities;
@import './components/cyberui/tailwind-theme.css';
@import 'tailwindcss/utilities.css' layer(utilities) prefix(tw) source(none);
@source './';
```

从 Vite 的 `src/main.tsx` 直接导入：

```ts
import './styles.css';
import './cyberui.css';
```

Next.js 新建 `src/app/cyberui.css`，将上面的主题路径改为 `../components/cyberui/tailwind-theme.css`，`@source` 改为 `../`。自定义 aliases.components 时同步调整路径。在 `src/app/layout.tsx` 中分别导入：

```ts
import './globals.css';
import './cyberui.css';
```

这个入口省略 Preflight。`@theme inline` 将 `tw:text-cyber-ink`、`tw:gap-cyber-md` 等工具类映射到运行时 `--cyber-*` 变量。组件默认样式位于 `components` 层，普通工具类可以覆盖默认值：

```tsx
<Button size="lg" className="tw:px-[12px] tw:text-cyber-ink">
  自定义按钮
</Button>
```

如果只使用组件而不使用页面工具类，可以省略这个额外入口；仍需要编译插件处理组件内的 `@apply`。多个工具类修改同一属性时遵循 Tailwind 的生成顺序，不以 className 字符串中的先后顺序作为覆盖保证。组件 API 与 CSS 变量仍可用于语义定制。

Next.js 建议在带 `'use client'` 的 providers.tsx 中声明 Provider 包装，再从服务端根 layout.tsx 用它包裹 children。需要事件处理、状态或浏览器 API 的调用方也应声明客户端边界。分发的交互组件已包含客户端声明。

## 手动复制、字体与更新

组件页的“源码文件”列出该组件的所有必要文件和 npm 依赖，按目标文件名保存即可；公共文件只需加入一次，并保留 LICENSE、UPSTREAM-LICENSE 和 UPSTREAM-NOTICE.md。使用示例中的组合组件需要分别加入。

字体可选。从相同提交复制 public/fonts.css 和 public/fonts/ 到宿主 public/，保留字体 OFL 文件，然后在页面 head 加入 `<link rel="stylesheet" href="/fonts.css">`。不加载字体时使用系统回退。

稳定版本的 [字体样式](https://github.com/Arasaka-Academy/CyberUI/blob/v0.2.1/public/fonts.css) 与 [字体资源及许可证](https://github.com/Arasaka-Academy/CyberUI/tree/v0.2.1/public/fonts) 可单独获取，无需加入字体 npm 包。

组件不会自动更新。需要更新时先检查新版本，再执行 add 并逐项审阅覆盖提示。CLI 默认会询问是否覆盖修改过的文件；只有明确希望覆盖时才使用 --overwrite。

## 仓库维护与验证

```sh
pnpm registry:build
pnpm registry:check
pnpm test:registry
```

只修改 packages/react/src 和 packages/tokens/src 内的原始实现；registry/cyberui 是自动生成、纳入 Git 的交付源码，不能单独手改。registry:check 会检查生成结果是否与原始实现一致。

文件使用带明确 target 的 registry:file 类型，CLI 会原样复制，避免将 SVG 路径、空格和文本误当成 Tailwind 类名处理；源码本身已包含相对导入及客户端声明。

共享样式由组件直接导入公共 CSS 模块并组合 className；不用 `composes` 引入包含 `@apply` 的模块，以免绕过编译插件。生成器会自动收集 TypeScript 导入、CSS `@import` 和 `@reference`，改写相对路径，并声明 Tailwind 编译依赖。手动复制时必须保留清单中的全部 CSS 文件。维护约定见[样式规范](styles.md)。

test:registry 在工作区外新建带有宿主 Tailwind 的 Vite、Next.js 项目，通过真实 CLI 安装全部 65 项，逐字节比较源码和许可文件，编译并实际渲染全部使用示例，验证生产构建、浏览器交互、宿主工具类保留、CyberUI 工具类覆盖、公共表单样式、自定义目录和覆盖行为。两份 CSS 从 JS 分别导入。设置 CYBERUI_GITHUB_REF 为具体提交 SHA 后，可验证真实 GitHub 路径；默认使用测试期间的本机 HTTP fixture，不需要部署 registry 服务。依赖默认从官方 npm 下载，可通过 CYBERUI_TEST_REGISTRY 选择镜像。

GitHub Actions 自动将 CYBERUI_GITHUB_REF 设为当前验收提交，持续验证真实 GitHub 安装及固定版本源码一致性。
