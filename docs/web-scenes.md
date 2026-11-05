# 六类产品场景

总览固定展示六个平级入口。产品注册表位于 `apps/docs/src/products.ts`，阅读器子页面单独维护于 `replica/scenes.ts`。应用场景使用公共 CyberUI 组件、字体和主题，不增加组件库导出，也不作为整页应用加入 GitHub Registry。

| 产品 | 内嵌预览 | 独立页面 | 主要交互 |
| --- | --- | --- | --- |
| CYBERDECK 阅读器 | `/#/replica/reader` | `/#/preview/reader` | 27 个页面、19 张参考图、31 个对照分区、书库和阅读数据 |
| ORBIT Dashboard | `/#/replica/dashboard` | `/#/preview/dashboard` | 项目、看板／列表、任务增删改、状态、筛选、排序分页、联动指标 |
| PULSE AI 产品官网 | `/#/replica/product-home` | `/#/preview/product-home` | 产品预览、月付／年付、套餐选择、试用校验与反馈、FAQ |
| NOVA Agent 聊天 | `/#/replica/agent-chat` | `/#/preview/agent-chat` | 会话、草稿、流式回复、工具记录、停止／重试、成果复制下载 |
| FREQ 移动音乐 App | `/#/replica/mobile-app` | `/#/preview/mobile-app` | 发现、搜索、音乐库、歌单、播放器、队列、收藏、模拟进度和音量 |
| RELAY 产品团队博客 | `/#/replica/blog` | `/#/preview/blog` | 六篇中英文文章、分类、搜索、收藏、目录、分享和本地订阅反馈 |

内嵌页面保留文档导航；独立页面提供返回、产品切换、语言、明暗模式和当前产品重置。两种呈现方式使用同一份业务状态，内部跳转保持当前呈现模式。

## 阅读器路由

产品入口默认跳转至 `reader/home`。其他页面使用 `reader/<page>`；视觉参考入口为 `reader/references`，提供全部 27 个页面链接及 19 张参考图。参考图、组合分区和响应式／3:4／对照／原图视图继续使用查询参数。

例如 `/#/replica/shop?ref=14&part=1&view=compare&category=backdrops` 会通过替换历史记录跳转为 `/#/replica/reader/shop?ref=14&part=1&view=compare&category=backdrops`，完整保留查询参数。独立阅读器的书库、菜单、日志与系统设置均保持在 `/#/preview/reader/...`。

## FREQ：无声音乐交互

桌面使用居中的 430px 手机画布，窄容器下占满可用宽度。内容在手机内部滚动，底栏保留在画布底部。所有封面由本地 SVG 和 CSS 生成，曲目与音乐人均为虚构。

| 视图 | 产品内部路径 |
| --- | --- |
| 发现 | `mobile-app` |
| 搜索 | `mobile-app/search` |
| 音乐库 | `mobile-app/library` |
| 歌单详情 | `mobile-app/playlists/night-shift`、`deep-focus`、`in-transit` |
| 播放器 | `mobile-app/player` |

播放采用每秒推进的模拟时钟。开始／暂停、上下曲、进度、音量、队列调整和收藏均更新本地状态；歌单播放采用该歌单的队列。自然播放到队列最后一首结束时停止；手动下一曲可以循环回到队首。

切换音乐内部页面继续模拟，离开音乐产品或重置后停止计时。刷新恢复曲目、队列、进度、收藏及音量，但保持暂停。播放器支持 Escape 返回之前的音乐页面；队列抽屉约束焦点并在关闭时恢复焦点。

本演示不创建 Audio 或 AudioContext，不请求音频文件、音乐账户或流媒体服务。

## RELAY：产品团队博客

六篇完整示例文章分属产品更新、工程实践、团队故事，各有中英文正文、作者、摘要、目录及相关文章。文章详情使用 `blog/posts/:slug`，例如 `/#/preview/blog/posts/relay-2-4`。

分类、搜索和收藏视图使用查询参数 `category`、`q`、`saved`，可刷新恢复。文章目录和回到顶部使用 DOM 滚动，保留 HashRouter 路由。分享复制当前呈现模式下的完整文章链接；剪贴板不可用时显示可手动复制的地址。收藏持久化。

订阅表单校验邮箱并提供本地成功反馈。邮箱只在当前视图的内存中保留，刷新或重置后清除，不发送邮件，也不写入账户或后台。

## 状态兼容与边界

项目、聊天、音乐和博客共用 `cyberui-web-scenes-v1`，保留版本 1。加载旧记录时为音乐与博客补初值；损坏的新产品字段分别恢复，不影响有效的项目、聊天或另一新产品。阅读数据与全局设置继续使用原有的 `cyberui-web-demo-v1`。

重置一个新产品只清除该产品数据；ORBIT、NOVA 等产品及主题、语言保持原样。阅读器沿用原来的完整阅读演示重置语义，确认提示说明会重置阅读数据和设置。存储不可用时所有产品仍可在内存中使用。

Dashboard 初始化三个项目、十二项任务和四位成员，演示日期为 `2026-10-30`。Agent 提供任务规划、资料分析、代码解释三种本地模板；停止保留内容，重试不重复用户消息，切换或离开后不串流。回复语言以发送时为准；示例代码、工具及成果仅作文本展示。PULSE 不创建账户、扣费或发送邮件。

## 验证入口

- `products-model.test.ts`：模拟时钟、结束边界、异常输入、状态迁移和各产品独立重置。
- `products.spec.ts`：六类层级、旧路由、阅读器独立导航、音乐时钟／队列、博客目录／分享／订阅及刷新。
- `web-scenes.spec.ts`：既有产品交互回归、六类产品的四种宽度、两种语言、内嵌／独立、横屏与缩放，以及截图。
- `products-accessibility.spec.ts`：每个产品独立用例，覆盖十四种配色、两种语言和两种呈现；逐次刷新并断言实际生效的主题，结果存入 `artifacts/<product>-accessibility.json`。
- `site.spec.ts` 与 `accessibility.spec.ts`：全部组件页、27 个阅读页面、19 张参考图及既有全站回归。

CI 上限为 25 分钟。工程和生产预览证据见 [验收记录](validation.md)，截图保存在 `artifacts/screenshots`。

For English readers: all six products support the language switch, fourteen palette variants, and embedded or standalone previews. FREQ simulates playback without audio. RELAY is a local product team journal with six complete bilingual articles. No live accounts, music service or blog backend are required.
