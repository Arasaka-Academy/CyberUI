# Web 应用场景

三个独立产品场景由现有公共 CyberUI 组件组合实现，不增加组件库导出。

| 产品 | 内嵌预览 | 独立页面 | 主要交互 |
| --- | --- | --- | --- |
| ORBIT Projects | `/#/replica/dashboard` | `/#/preview/dashboard` | 项目、看板／列表、任务增删改、状态、筛选、排序分页、联动指标 |
| PULSE AI | `/#/replica/product-home` | `/#/preview/product-home` | 产品预览、月付／年付、套餐选择、试用校验与成功反馈、FAQ |
| NOVA Agent | `/#/replica/agent-chat` | `/#/preview/agent-chat` | 会话与草稿、流式回复、工具记录、停止／重试、成果复制下载 |

内嵌页面保留文档导航，独立页面提供返回、语言、明暗模式和当前场景重置。页面按画布容器宽度调整；移动端通过抽屉打开项目、会话和成果导航。两种呈现方式均使用同一份业务状态。

## 本地状态

项目和聊天使用 `cyberui-web-scenes-v1`。已有阅读数据仍使用 `cyberui-web-demo-v1`。重置当前 Web 场景仅恢复该场景，保留其他场景、阅读数据和主题设置。存储不可用时仍可以在内存中使用；无效记录恢复为初始样本。

Dashboard 初始化三个项目、十二项任务和四位成员。统计以 `2026-10-30` 为演示日期，随任务变化重新计算。没有截止日期的任务不会被计入到期或逾期。

Agent 提供任务规划、资料分析、代码解释三个技能。任意输入生成对应技能的本地模板回复；“模拟工具失败”可验证错误恢复。停止保留当前内容，重新生成复用同一条用户消息。切换会话、离开页面或刷新会停止当前操作，防止旧回复进入其他会话。点击当前会话不会中断生成。

用户输入保持原文，回复语言以发送时设置为准；内置样本随界面语言切换。代码、工具和成果仅作文本展示，不执行原始 HTML、代码或真实工具。试用表单仅在当前页面短暂保留，不创建账户、扣费或发送邮件。

## 键盘与反馈

- 所有任务状态可通过菜单改变，无需拖拽；弹窗提供焦点约束、Escape 和焦点恢复。
- Agent 使用 Enter 发送、Shift＋Enter 换行，并尊重中文输入法的组合输入状态。生成过程中可输入下一份草稿，但不会重复发送。
- 上翻阅读时停止自动跟随，并提供“回到最新消息”；生成状态通过独立状态区域播报，不逐字重复播报整篇回复。
- 图表提供精确数值表，工具调用可展开输入和结果，代码与成果可直接复制或下载。
- 页面支持中英文、七套明暗主题及减少动态效果。

## 验证入口

`tests/e2e/web-scenes.spec.ts` 覆盖操作流程、内嵌／独立、中英文、四种宽度、横屏、200% 缩放和十四套配色。主题扫描写入 `artifacts/web-scenes-accessibility.json`；截图位于 `artifacts/screenshots`。工程结果见 [本地验收记录](validation.md)。

For English readers: use the language switch in either preview. ORBIT is a project management workspace, PULSE is a fictional AI productivity landing page, and NOVA is a local Agent chat simulation. Every scene supports an independent reset and shares the existing CyberUI theme system.
