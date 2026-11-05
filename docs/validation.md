# 本地验收记录

验收日期：2026-11-05。环境：macOS、Node.js 22.22、pnpm 11.3、React 19、Vite 7.3.7、Playwright Chromium。

本次交付包含 65 类公共组件、30 个应用场景（27 个阅读场景及 3 个独立 Web 产品场景）、七套独立明暗主题、中英双语展示站，以及 19 张参考图片的 31 个独立预览分区。组件库输出 ESM、类型声明、独立 CSS 和可选的本地字体样式。

## 工程结果

| 检查 | 结果 | 证据或覆盖范围 |
| --- | --- | --- |
| `pnpm typecheck` | 通过 | 工作区 TypeScript，无编译错误 |
| `pnpm lint` | 通过 | ESLint，无错误 |
| `pnpm test` | 31 / 31 通过 | 6 个测试文件；Registry 格式及依赖闭包、主题对比度、公共控件合同、焦点、演示事务及 Web 场景状态与取消计时 |
| `pnpm build` | 通过 | tokens、React 库和静态展示站全部构建成功 |
| 生产预览 Playwright | 44 / 44 通过 | 基址 `http://127.0.0.1:4179`，测试实际 `apps/docs/dist`；包含固定版本命令切换、65 页源码查看、剪贴板失败、移动接入指南和 ColorPicker 样式回归 |
| axe 自动扫描 | 329 / 329 无违规 | 通用页面 161 次、Web 场景 168 次；WCAG 2 A/AA、2.1 AA、2.2 AA 标签，未关闭规则 |
| 375px 全量布局 | 99 / 99 通过 | 全部 65 个组件页、30 个场景及 4 个主页面，无页面级横向溢出 |
| 独立打包接入 | 通过 | 工作区外的临时 React 项目安装两个真实 `.tgz`，全部 65 份代码示例通过类型检查，并完成生产构建和浏览器交互 |
| 独立源码接入 | 通过真实 GitHub | 真实 shadcn CLI 在独立 Vite、Next.js 项目中安装全部 65 项，逐字节比较 159 份文件，编译及渲染全部示例，完成生产构建和代表性交互 |
| 视觉对照档案 | 31 对 | 全部 19 张参考图；组合图分区分别生成 600 × 800 的参考图／Web 对照 |

本地生产浏览器检查使用：

```sh
pnpm build
pnpm preview --port 4175 --strictPort
# 另一个终端
CYBERUI_BASE_URL=http://127.0.0.1:4175 pnpm test:e2e
pnpm test:consumer
CYBERUI_BASE_URL=http://127.0.0.1:4175 node scripts/capture-references.mjs
```

已提供 [GitHub Actions 配置](../.github/workflows/ci.yml)。工程检查在本地及 [GitHub Actions](https://github.com/Arasaka-Academy/CyberUI/actions/runs/41994368802) 均通过；真实 GitHub 源码安装由该次 Linux CI 完成。

## GitHub 源码分发

65 个 registry 项通过 shadcn 4.23.0 官方格式校验，全部使用明确的文件目标和自身完整依赖闭包。生成一致性检查已加入 `pnpm test`，独立源码接入检查已加入 CI。原始组件为唯一维护来源，生成源码随 registry.json 一并纳入 Git。

独立项目采用 React 19.3.1、Vite 7 和 Next.js 16.4.5 App Router，没有安装 CyberUI npm 包或 Tailwind。两边均通过全部 65 份示例的类型检查、生产构建与实际渲染；浏览器验证输入 ref、弹窗 Escape／焦点恢复、选择器、明暗主题、进度和图表。Vite 将安装目录改为 `src/widgets/cyberui`，验证了重复添加时拒绝覆盖可保留本地修改，以及显式覆盖后恢复上游源码。

159 份源码和许可文件安装后逐字节一致，摘要为 `193915a16b7c7279e3d5c6916f879964e515108f0e336622141ef8ceb062a50c`。采用 `registry:file` 避免 CLI 的 Tailwind 处理改写 SVG、空格及其他文本。

本地 fixture 验收首次下载 Next 和 SWC 大包多次超时，因此从官方 npm 分段下载并验证 SHA512，再通过测试专用的 `CYBERUI_TEST_TARBALLS` 映射复用这两个框架包；组件仍经真实 CLI 安装，其余第三方依赖由包管理器安装。该次结果保留于 [本地 fixture 接入结果](../artifacts/registry-fixture-consumer-result.json)。当前 Mac 的 GitHub CDN 连接存在间歇性超时，临时指定官方节点也未完成全部安装。

推送后，Linux CI 从 `84742e5a210c991e5f82ad5bf9c842f096daabd9` 真实读取全部 GitHub 源码，Vite 和 Next.js 均通过完整验收，第三方依赖直接从 npm 安装，未使用框架 tarball 映射或临时 DNS 设置。[验收工作流](https://github.com/Arasaka-Academy/CyberUI/actions/runs/41994368802) 全部通过；原始 [源码接入结果](../artifacts/registry-consumer-result.json) 随工作流产物保存。组件页及接入指南默认提供这一固定 SHA，并可切换到默认分支命令。

## GitHub Pages

生产构建在本地挂载到 `/CyberUI/` 子目录，验证首页、Button 源码页、参考图对照、接入指南和 NOVA 独立场景五个路由。字体、参考图、favicon、CSS 和动态模块均正常加载；源码复制、中英文切换、Hash 路由刷新及 375px 接入指南布局通过，未出现浏览器运行错误或资源加载错误。

[Pages 工作流](../.github/workflows/pages.yml) 在 `main` 的完整检查成功后检出已通过的提交，构建并上传展示站，再通过 GitHub Pages 的 OIDC 部署。PR 和失败的检查不会触发自动发布，也可以从 `main` 手动重新发布。

## 交互覆盖

组件文档逐页检查了标题、实际预览、代码复制入口和公共属性表；65 份可复制代码另外在已安装的打包产物上编译。Button、IconButton 和 Avatar 展示独立尺寸示例；颜色与外观变体独立展示。

浏览器操作覆盖以下流程：

- 重命名的空值报错与恢复，收藏切换，移至回收站、刷新持久化和恢复，书籍进度保留，搜索筛选。
- 阅读任务推进、一次性里程碑收益、余额扣减、重复购买保护、装备选择、余额不足和一键重置。
- 字体保存、单色封面保存后在书籍页生效、头像本地预览、每日目标保存及正确的未达标状态。
- DataTable 选择、排序、从后续页筛选和分页边界；MultiSelect 选择后 Escape 关闭并保留结果。
- Dialog 的 Tab 焦点约束、Escape 和触发控件焦点恢复，移动 Drawer 的相同行为。
- 系统明暗模式变化、自定义低对比配色调整、恢复 Neon，以及真实剪贴板代码复制。
- 参考图／分区选择同步场景与外观参数，3:4 视图保存在 URL 并在刷新后恢复。
- SkylineCalendar 的方向键、Home、End、指针选择、31 天完整展示和每日精确数据展开；虚拟键盘输入与禁用。
- ORBIT 的任务创建、必填错误恢复、编辑、确认删除、菜单状态推进、指标联动、刷新恢复、筛选空态、清除筛选、列表排序与分页。
- PULSE 的页内滚动且不改变 HashRouter 路由、三种产品预览、月付／年付、套餐选择、姓名及邮箱校验恢复、成功反馈、弹窗焦点约束、Escape 和焦点恢复。
- NOVA 的新建、搜索、切换、重命名和删除会话，草稿持久化、流式回复、工具展开、停止、失败重试、重新生成、刷新恢复、回复语言固定、复制与成果下载。
- 聊天中文组合输入不提交，Shift＋Enter 换行，生成中防止重复发送，切换或离开会话不串流；上翻阅读时不强制滚动，并可返回最新消息。
- Web 场景的独立页面入口、全站搜索、未知路由、独立重置及阅读数据与全局设置保留；存储不可用时继续使用内存状态。

单元测试另外检查了原生输入 ref、FormData、受控选择器不泄漏内部状态、文件类型拒绝与恢复、颜色草稿恢复、树节点键盘导航和禁用命令。Web 状态测试覆盖任务与指标、无截止日期、跨场景重置、点击当前会话不中断、取消后的陈旧更新、重试不重复用户消息、异常存储恢复，并使用可控计时验证生成时钟清理。

## 布局与无障碍

中英文在 375、768、1024、1440px 下检查了概览、目录、选择器、身份卡、首页、书库、日历、商店及主题页面，并启用减少动态效果。三个 Web 场景在上述四种宽度、两种语言、内嵌及独立布局中分别检查，无页面级横向溢出；窄屏验证了产品导航与会话抽屉的打开、Escape 和焦点恢复。375px 下另对全部 99 个页面进行了英文全量溢出检查。表格、代码和固定比例参考画布可在自身区域内滚动，看板在窄容器内纵向排列。

横屏验证使用 812 × 375px。200% 验证使用 `CSS zoom: 2`，检查主题页及三个 Web 场景内嵌／独立布局无页面级溢出，并验证导航或任务弹窗可操作、Escape 关闭和焦点恢复；这份证据属于自动缩放仿真。

161 次通用 axe 扫描由 99 个默认英文页面、七套主题 × 两种模式 × 四个页面，以及六个中文页面组成。另对三个 Web 场景执行七套主题 × 两种模式 × 两种语言 × 两种布局，共 168 次扫描。合计 329 次，所有启用规则的违规数均为零。主题单元测试对 14 套配色的正文、辅助文字和语义色分别在背景及软表面上检查 4.5:1，对填充控件检查可读前景色。原始色板保留，必要时由 `createTheme` 派生可读文字色。

自动扫描和焦点测试不构成完整 WCAG 认证；原生浏览器缩放、VoiceOver 及真实设备触摸没有人工验收记录。

## 视觉证据与差异

逐图检查依据主题背景、浅青／珊瑚红、切角方向、边框形态、开放角框、条码、刻度、字体层级、主要区域和斜纹。已复核 31 对图的总览，并放大检查首页、日历、组件文档和移动首页。数据与参考时间固定为 `2026-10-30 17:46`；动画减少，字体从本地加载。

- [31 组对照档案](../artifacts/reference-comparisons/index.html) 与 [分区清单](../artifacts/reference-comparisons/manifest.json)
- [19 张参考图映射及逐场景差异](reference-map.md)
- [桌面首页](../artifacts/screenshots/overview-zh-desktop.png)、[375px 首页](../artifacts/screenshots/overview-zh-mobile.png)、[阅读终端](../artifacts/screenshots/cyberdeck-home.png)、[日历对照](../artifacts/screenshots/calendar-reference.png)
- [Web 场景总览](../artifacts/screenshots/scene-gallery-zh-desktop.png)
- ORBIT：[桌面](../artifacts/screenshots/dashboard-zh-desktop.png)、[375px](../artifacts/screenshots/dashboard-zh-mobile.png)
- PULSE：[桌面](../artifacts/screenshots/product-home-zh-desktop.png)、[375px](../artifacts/screenshots/product-home-zh-mobile.png)
- NOVA：[桌面](../artifacts/screenshots/agent-chat-zh-desktop.png)、[375px](../artifacts/screenshots/agent-chat-zh-mobile.png)
- [通用无障碍扫描 JSON](../artifacts/accessibility-audit.json)、[Web 场景无障碍扫描 JSON](../artifacts/web-scenes-accessibility.json)、[窄屏布局 JSON](../artifacts/mobile-layout-audit.json)、[独立接入结果](../artifacts/consumer-result.json)

书籍封面使用本地原创字符图案；浏览器字形、翻译文本、默认装备、演示数据和部分排列与参考图片有差异。参考画布保留 3:4 比例和内部滚动，Web 点击区域、键盘焦点与文字可读性另作适配。这份记录用于逐项复核，并不声明逐像素一致。

## 运行边界

阅读器硬件、真实阅读引擎、网络诊断与更新服务使用演示模型。头像上传仅用于当前页面的本地预览。完整语言为简体中文和英文；其他语言以四个样本保留。演示记录在本机 localStorage，可重置。

ORBIT、PULSE、NOVA 使用三个独立产品内容和本地演示模型。PULSE 不创建真实账户、订阅或付款；NOVA 不连接真实模型、网络工具或执行代码，消息内容作为结构化文本安全渲染。项目与聊天使用独立的 `cyberui-web-scenes-v1` 存储，各场景可分别重置；既有阅读数据及全局主题设置保留。详见 [Web 场景说明](web-scenes.md)。

交付包含工作区源码、GitHub Registry、本地组件打包产物和静态站点构建。展示站通过 [GitHub Pages](https://arasaka-academy.github.io/CyberUI/) 发布；Pages 工作流在主分支检查成功后构建并部署同一提交，支持手动重发。CyberUI 未向 npm 发布，也不需要独立 registry 服务。
