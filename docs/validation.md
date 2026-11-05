# 本地验收记录

验收日期：2026-11-05。环境：macOS、Node.js 22.22、pnpm 11.3、React 19、Vite 7.3.7、Playwright Chromium。

本次交付包含 65 类公共组件、27 个应用场景、七套独立明暗主题、中英双语展示站，以及 19 张参考图片的 31 个独立预览分区。组件库输出 ESM、类型声明、独立 CSS 和可选的本地字体样式。

## 工程结果

| 检查 | 结果 | 证据或覆盖范围 |
| --- | --- | --- |
| `pnpm typecheck` | 通过 | 工作区 TypeScript，无编译错误 |
| `pnpm lint` | 通过 | ESLint，无错误 |
| `pnpm test` | 20 / 20 通过 | 4 个测试文件；主题对比度、公共控件合同、焦点和演示事务 |
| `pnpm build` | 通过 | tokens、React 库和静态展示站全部构建成功 |
| 生产预览 Playwright | 22 / 22 通过 | 基址 `http://127.0.0.1:4175`，测试实际 `apps/docs/dist` |
| axe 自动扫描 | 158 / 158 无违规 | WCAG 2 A/AA、2.1 AA、2.2 AA 标签，未关闭规则 |
| 375px 全量布局 | 96 / 96 通过 | 全部 65 个组件页、27 个场景及 4 个主页面，无页面级横向溢出 |
| 独立打包接入 | 通过 | 工作区外的临时 React 项目安装两个真实 `.tgz`，全部 65 份代码示例通过类型检查，并完成生产构建和浏览器交互 |
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

已提供 [GitHub Actions 配置](../.github/workflows/ci.yml)。本次验证在本地完成，远端 CI 尚无运行记录。

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

单元测试另外检查了原生输入 ref、FormData、受控选择器不泄漏内部状态、文件类型拒绝与恢复、颜色草稿恢复、树节点键盘导航和禁用命令。

## 布局与无障碍

中英文在 375、768、1024、1440px 下检查了概览、目录、选择器、身份卡、首页、书库、日历、商店及主题页面，并启用减少动态效果。375px 下另对全部 96 个页面进行了英文全量溢出检查。表格、代码和固定比例参考画布可在自身区域内滚动。

横屏验证使用 812 × 375px。200% 验证使用 `CSS zoom: 2`，检查主题页布局无页面级溢出，以及导航打开、Escape 关闭和焦点恢复；这份证据属于自动缩放仿真。

158 次 axe 扫描由 96 个默认英文页面、七套主题 × 两种模式 × 四个页面，以及六个中文页面组成。所有启用规则的违规数均为零。主题单元测试对 14 套配色的正文、辅助文字和语义色分别在背景及软表面上检查 4.5:1，对填充控件检查可读前景色。原始色板保留，必要时由 `createTheme` 派生可读文字色。

自动扫描和焦点测试不构成完整 WCAG 认证；原生浏览器缩放、VoiceOver 及真实设备触摸没有人工验收记录。

## 视觉证据与差异

逐图检查依据主题背景、浅青／珊瑚红、切角方向、边框形态、开放角框、条码、刻度、字体层级、主要区域和斜纹。已复核 31 对图的总览，并放大检查首页、日历、组件文档和移动首页。数据与参考时间固定为 `2026-10-30 17:46`；动画减少，字体从本地加载。

- [31 组对照档案](../artifacts/reference-comparisons/index.html) 与 [分区清单](../artifacts/reference-comparisons/manifest.json)
- [19 张参考图映射及逐场景差异](reference-map.md)
- [桌面首页](../artifacts/screenshots/overview-zh-desktop.png)、[375px 首页](../artifacts/screenshots/overview-zh-mobile.png)、[阅读终端](../artifacts/screenshots/cyberdeck-home.png)、[日历对照](../artifacts/screenshots/calendar-reference.png)
- [无障碍扫描 JSON](../artifacts/accessibility-audit.json)、[窄屏布局 JSON](../artifacts/mobile-layout-audit.json)、[独立接入结果](../artifacts/consumer-result.json)

书籍封面使用本地原创字符图案；浏览器字形、翻译文本、默认装备、演示数据和部分排列与参考图片有差异。参考画布保留 3:4 比例和内部滚动，Web 点击区域、键盘焦点与文字可读性另作适配。这份记录用于逐项复核，并不声明逐像素一致。

## 运行边界

阅读器硬件、真实阅读引擎、网络诊断与更新服务使用演示模型。头像上传仅用于当前页面的本地预览。完整语言为简体中文和英文；其他语言以四个样本保留。演示记录在本机 localStorage，可重置。

交付为本地工作区、组件打包产物和静态站点构建。npm 发布与公共网站部署另行处理；本次没有执行公开发布。
