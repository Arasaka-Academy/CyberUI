# 从 GitHub 加入 CyberUI 源码

CyberUI 不需要发布到 npm。shadcn 4.23.0 直接读取此仓库根部的 registry.json，将选中的组件、CSS Modules、主题 Provider 和工具源码加入你的项目。之后直接编辑本地文件。

要求 Node.js 22.13+、React 19、TypeScript；支持 Vite 和 Next.js App Router。第三方依赖仍由包管理器从 npm 安装。

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

Vite 创建 src/styles.css 并在 main.tsx 导入。Next.js 使用 src/ 时将 `rsc` 设为 true、`tailwind.css` 设为 src/app/globals.css；不使用 src/ 时改为 app/globals.css，并将 `@/*` 指向项目根目录。保留已有 CSS。这里的 tailwind 字段是 CLI 配置结构，CyberUI 使用 CSS Modules，无需安装 Tailwind。

## 加入组件

默认分支包含 registry 后，可执行：

```sh
pnpm dlx shadcn@4.23.0 add Arasaka-Academy/CyberUI/button
```

默认保存到 src/components/cyberui/；修改 aliases.components 即可自定义目录。每个 registry 项完整列出自身所需文件，普通组件不安装 Recharts。示例组合其他组件时，组件页的命令会同时列出它们。

在地址后加 `#` 和完整的 40 位 commit SHA，可从包含 registry 的任意提交安装。源码和公共文件都会从同一提交读取；不依赖默认分支的合并进度。展示站“已验证提交”会给出已经通过独立项目验收的完整命令。

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

Next.js 建议在带 `'use client'` 的 providers.tsx 中声明 Provider 包装，再从服务端根 layout.tsx 用它包裹 children。需要事件处理、状态或浏览器 API 的调用方也应声明客户端边界。分发的交互组件已包含客户端声明。

## 手动复制、字体与更新

组件页的“源码文件”列出该组件的所有必要文件和 npm 依赖，按目标文件名保存即可；公共文件只需加入一次，并保留 LICENSE、UPSTREAM-LICENSE 和 UPSTREAM-NOTICE.md。使用示例中的组合组件需要分别加入。

字体可选。从相同提交复制 public/fonts.css 和 public/fonts/ 到宿主 public/，保留字体 OFL 文件，然后在页面 head 加入 `<link rel="stylesheet" href="/fonts.css">`。不加载字体时使用系统回退。

组件不会自动更新。需要更新时先检查新版本，再执行 add 并逐项审阅覆盖提示。CLI 默认会询问是否覆盖修改过的文件；只有明确希望覆盖时才使用 --overwrite。

## 仓库维护与验证

```sh
pnpm registry:build
pnpm registry:check
pnpm test:registry
```

只修改 packages/react/src 和 packages/tokens/src 内的原始实现；registry/cyberui 是自动生成、纳入 Git 的交付源码，不能单独手改。registry:check 会检查生成结果是否与原始实现一致。

文件使用带明确 target 的 registry:file 类型，CLI 会原样复制，避免将 SVG 路径、空格和文本误当成 Tailwind 类名处理；源码本身已包含相对导入及客户端声明。

test:registry 在工作区外新建 Vite、Next.js 项目，通过真实 CLI 安装全部 65 项，逐字节比较全部 159 份源码和许可文件，编译并实际渲染全部使用示例，验证生产构建、浏览器交互、自定义目录和覆盖行为。设置 CYBERUI_GITHUB_REF 为具体提交 SHA 后，可验证真实 GitHub 路径；默认使用测试期间的本机 HTTP fixture，不需要部署 registry 服务。依赖默认从官方 npm 下载，可通过 CYBERUI_TEST_REGISTRY 选择镜像。
