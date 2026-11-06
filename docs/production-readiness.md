# 生产可用性评估

审查日期：2026-11-06。目标版本：v0.2.2。范围为组件包、主题变量、Registry、展示站、六类演示产品及构建／发布流程。审查在主线程顺序完成；本记录不声称独立第三方审计。

本轮修复后，本地发布门槛全部通过，在上述现代 Web 使用范围内具备发布条件。本次检查范围内没有仍阻断发布的已知代码问题；最终发布还需核实远端 CI、Release 与 Pages 的实际结果。

## 发布标准

本项目将生产可用范围限定为 React 19 的现代 Web 项目、文档声明的浏览器能力、简体中文／英文与现有七套明暗主题。合格门槛包括：

1. 公共控件的受控／非受控状态、禁用行为、表单提交与 reset 一致，输入 ref 与错误描述可用。
2. 弹层能够逃离宿主裁切，保留嵌套焦点、Escape、语言与主题；异步结果不会修改已失效的弹窗状态。
3. 包含成品 CSS 的组件包可在无 Tailwind 的独立 Vite、Next.js 项目中编译和运行；Registry 源码可独立安装和编译。
4. 生产展示站的主题、语言、响应式和键盘回归通过；关键组件交互覆盖 Chromium、Firefox、WebKit。
5. 类型、Lint、单元测试、Registry 一致性与生产构建通过；版本、标签和 main 提交满足发布约束。

这些是本项目本次可重复检查的发布条件，不表示所有业务、辅助技术或浏览器版本都已逐一验收。

## 本轮缺陷与修复

| 范围 | 发现的行为 | 修复及回归 |
| --- | --- | --- |
| Select | 禁用项未进入所属 Select 选择状态，列表与状态可能不一致 | 在 Select 层传 disabledKeys，检查列表语义、指针、键盘和原生 FormData |
| MultiSelect / FileUpload | 原生 reset 未同步组件状态；微任务恢复可能先于可信原生事件默认行为 | 统一 reset hook，等待下一个任务，保留受控值、尊重 preventDefault；真实浏览器检查提交文件与默认多选，单测覆盖关联表单变化 |
| CommandPalette | 外部关闭后保留旧查询 | 响应外部关闭，重新打开时恢复完整命令列表 |
| AlertDialog | 旧异步确认可能关闭重新打开的弹窗 | 关闭／卸载使操作版本失效；回归旧操作完成与当前失败后的重试 |
| Toast | 焦点与悬停互相覆盖；更新回调重置计时 | 分开跟踪暂停来源，通过 ref 调用最新回调，使用假时钟检查生命周期 |
| Tabs / SegmentedControl | 首项禁用时默认落在禁用项 | 默认使用首个启用项 |
| 输入描述 | Input 无可见 label 时描述丢失，MultiSelect 描述未关联到按钮；密码 wrapperClassName 泄漏到 input | 保留并关联描述，将 wrapper 类应用于外层 |
| FileUpload | 消费者提供的 aria-invalid 丢失 | 保留外部状态，内部校验错误优先 |
| VirtualKeyboard | 退格破坏组合 emoji、旗帜和重音字符 | 使用字素边界，单测与打包浏览器检查完整字符删除 |
| Calendar / TimePicker | 无初始值仍使用写死的演示日期／时间 | Calendar 展示当前月份且不选中演示日期，TimePicker 保持空值 |
| 发布检查 | E2E 默认测试开发服务器，关键消费仅使用 Chromium | 增加生产预览启动器；CI 三引擎运行真实打包关键交互，Next.js 复用扩充后的交互契约 |

新增的 23 项组件回归与既有测试共同维护公共行为。原生 reset 的可信事件顺序还通过实际 Chromium 发现并修正，说明 DOM 模拟测试不能替代真实消费者。

## 可重复验证

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install --with-deps chromium firefox webkit
pnpm test:e2e:production
CYBERUI_TEST_BROWSERS=chromium,firefox,webkit CYBERUI_CONSUMER_OFFLINE=0 pnpm test:consumer
CYBERUI_GITHUB_REF=<本次已推送提交的完整 SHA> pnpm test:registry
pnpm audit --prod
```

本地测试可设置 `CYBERUI_ARTIFACTS_DIR` 将证据写入独立目录，避免覆盖历史档案。Registry 本地 fixture 验证与发布后真实 GitHub 提交的消费验证分别记录；真实远端检查由 CI 执行。CI、Release、Pages 的成功状态应分别核实。

最终本地结果见 [v0.2.2 验收档案](../artifacts/releases/v0.2.2/validation.json) 与 [验收记录](validation.md)。历史 Tailwind 的体积、视觉对照和构建耗时保留在原档案，不用来代替本次行为验证，也不据此宣称构建加速。

## 生产使用边界

- 声明的现代浏览器下限来自当前 CSS 与 Tailwind 能力要求，自动化实际运行版本单独写入档案；不表示下限的每个具体版本都经过实测。
- Playwright WebKit 不等于完整 Safari 应用或真实 iPhone。VoiceOver、真实触摸设备及业务场景的人工可访问性验收仍需在采用项目中完成。axe 零违规不等于完整 WCAG 认证。
- 对话框关闭只使陈旧的 UI 更新失效。取消网络、取消业务操作或补偿副作用由 onConfirm 的调用方负责。
- Toast 在悬停或焦点结束后重新获得完整显示时长；本次修复没有引入精确的剩余时长 API。
- Registry 源码依赖 Tailwind 4.3.4 编译；成品组件包不依赖消费者安装 Tailwind。只承诺文档中明确说明的工具类入口和级联层定制方式。
- 库支持现有公开的 React API；0.x 阶段升级前应检查变更记录。GitHub Release 是当前分发渠道，尚未发布到 npm。
- 六类产品是交互演示。真实账户、支付、模型服务、音频播放及阅读硬件连接不属于组件库交付能力。

本次结论以本版本可复核的检查结果为依据。后续修改仍必须通过相同发布门槛，不能把一次审查视作长期免检。
