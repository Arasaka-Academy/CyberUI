import type { Locale } from '@cyberui/tokens';

export type Text = string | { en: string; zh: string };
export const text = (value: Text, locale: Locale) => typeof value === 'string' ? value : locale === 'en' ? value.en : value.zh;
export const sampleDate = '2026-10-30';
export const statuses = ['todo', 'progress', 'review', 'done'] as const;
export type TaskStatus = typeof statuses[number];
export type WebSceneId = 'dashboard' | 'product-home' | 'agent-chat';
export const statusLabels: Record<TaskStatus, Text> = {
  todo: { en: 'To do', zh: '待办' }, progress: { en: 'In progress', zh: '进行中' },
  review: { en: 'In review', zh: '待审核' }, done: { en: 'Done', zh: '已完成' },
};
export const members = [{ id: 'aya', name: 'Aya Chen', initials: 'AC' }, { id: 'leo', name: 'Leo Park', initials: 'LP' }, { id: 'mina', name: 'Mina Shah', initials: 'MS' }, { id: 'noah', name: 'Noah Kim', initials: 'NK' }];
export const projects = [
  { id: 'launch', name: { en: 'Orbital launch', zh: '轨道发布计划' }, code: 'ORB', description: { en: 'A new home for the next release.', zh: '为下一次发布建立新起点。' }, due: '2026-11-06' },
  { id: 'system', name: { en: 'Interface system', zh: '界面设计系统' }, code: 'SYS', description: { en: 'One language. Every interaction.', zh: '用统一语言连接每次交互。' }, due: '2026-11-12' },
  { id: 'research', name: { en: 'Field research', zh: '用户实地研究' }, code: 'RES', description: { en: 'Listen closely. Build with purpose.', zh: '认真倾听，让构建有据可循。' }, due: '2026-11-18' },
] as const;
export interface Task { id: string; title: Text; project: string; assignee: string; status: TaskStatus; priority: 'high' | 'medium' | 'low'; due: string }
export interface Activity { id: string; title: Text; detail: Text }
const taskNames: [string, string][] = [
  ['Map the onboarding journey', '梳理新用户引导流程'], ['Build the launch experience', '构建产品发布页面'],
  ['Review interaction states', '审核交互状态'], ['Ship the first prototype', '交付首个原型'],
  ['Define the spacing scale', '定义间距规范'], ['Create the token library', '建立设计变量库'],
  ['Audit keyboard navigation', '检查键盘导航'], ['Document core components', '编写核心组件文档'],
  ['Prepare interview guide', '准备访谈提纲'], ['Synthesize field notes', '整理实地研究笔记'],
  ['Share usability findings', '分享可用性研究发现'], ['Schedule research sessions', '安排用户研究访谈'],
];
export function initialDashboard() {
  return {
    tasks: taskNames.map(([en, zh], i): Task => ({ id: `ORB-${101 + i}`, title: { en, zh }, project: projects[Math.floor(i / 4)].id, assignee: members[i % 4].id, status: statuses[i % 4], priority: (['high', 'medium', 'low'] as const)[i % 3], due: `2026-${i % 4 === 0 ? '10-29' : i % 4 === 1 ? '10-30' : '11-0' + (i % 4 + 1)}` })),
    activities: [
      { id: 'a1', title: { en: 'Noah completed a milestone', zh: 'Noah 完成了一个里程碑' }, detail: { en: 'First prototype · 16:40', zh: '首个原型 · 16:40' } },
      { id: 'a2', title: { en: 'Mina requested a review', zh: 'Mina 发起了一次审核' }, detail: { en: 'Interaction states · 15:20', zh: '交互状态 · 15:20' } },
      { id: 'a3', title: { en: 'Aya opened a new cycle', zh: 'Aya 开启了新的工作周期' }, detail: { en: 'Orbital launch · 09:30', zh: '轨道发布计划 · 09:30' } },
    ] as Activity[],
  };
}
export type Scenario = 'plan' | 'research' | 'code';
export const prompts: Record<Scenario, Text> = {
  plan: { en: 'Plan a focused product launch for next week.', zh: '帮我规划下周的产品发布工作。' },
  research: { en: 'Analyze the research notes and summarize the key insights.', zh: '分析研究资料，提炼关键发现和行动建议。' },
  code: { en: 'Explain a cancellable async task with a TypeScript example.', zh: '用 TypeScript 示例解释如何取消异步任务。' },
};
export interface ToolCall { id: string; name: Text; input: Text; output: Text }
export interface Artifact { name: string; language: 'markdown' | 'typescript'; content: Text }
export interface ChatMessage { id: string; role: 'user' | 'assistant'; content: Text; status: 'running' | 'completed' | 'stopped' | 'error'; visible: number; step: number; tools: ToolCall[]; artifact?: Artifact; fail?: boolean }
export interface Conversation { id: string; title: Text; draft: string; messages: ChatMessage[] }
export function responseFor(prompt: string, scenario: Scenario, locale: Locale): { content: string; tools: ToolCall[]; artifact: Artifact } {
  const en = locale === 'en';
  const content = scenario === 'code' ? (en ? '## Make cancellation explicit\nAn AbortController gives each operation its own cancellation signal. Check it before applying a result, and clean up timers when the view closes.\n\n```typescript\nconst controller = new AbortController();\nconst response = await fetch("/api/tasks", {\n  signal: controller.signal,\n});\n// Cancel when the view closes:\ncontroller.abort();\n```\n\n- Keep one controller per operation.\n- Preserve partial work when an operation stops.\n- Ignore stale results after a new operation starts.\n\nThe example is displayed as text; this demo does not execute it.' : '## 让取消成为明确的操作\nAbortController 为每个异步操作提供独立的取消信号。在应用结果前检查信号，并在视图关闭时清理计时器。\n\n```typescript\nconst controller = new AbortController();\nconst response = await fetch("/api/tasks", {\n  signal: controller.signal,\n});\n// 视图关闭时取消：\ncontroller.abort();\n```\n\n- 每次操作使用独立的控制器。\n- 停止操作时保留已有成果。\n- 新操作开始后忽略旧操作的结果。\n\n示例仅以文本展示，本演示不会执行代码。')
    : scenario === 'research' ? (en ? '## From observations to decisions\nI organized the sample research notes into three signals and a short action plan.\n\n- **Clarity:** people want to understand the next action at a glance.\n- **Continuity:** drafts and progress should survive navigation.\n- **Control:** long operations need a visible stop and retry path.\n\n## Recommended next steps\n1. Make the primary action explicit.\n2. Test the complete flow with keyboard and touch.\n3. Measure completion time before the next release.\n\nThe attached brief contains the sample findings and acceptance checklist.' : '## 从观察走向决策\n我将示例研究笔记整理成三个信号，并生成了一份行动摘要。\n\n- **清晰：** 用户希望一眼看懂下一步操作。\n- **连续：** 页面切换后应保留草稿和进度。\n- **可控：** 长时间操作需要明确的停止和重试入口。\n\n## 建议的下一步\n1. 明确每个页面的主要操作。\n2. 使用键盘与触控验证完整流程。\n3. 在下次发布前衡量任务完成时间。\n\n右侧简报包含示例发现和验收清单。')
    : (en ? `## A launch plan with room to focus\nYour request: ${prompt.slice(0, 180)}\n\nI split the work into three checkpoints, with a clear outcome for each one.\n\n1. **Monday — align:** confirm the audience, scope, and release checklist.\n2. **Wednesday — validate:** review the prototype, resolve blockers, and test the core flow.\n3. **Friday — deliver:** publish the release notes and review the results with the team.\n\n## Keep the team moving\n- Assign one owner to every milestone.\n- Keep work in progress small.\n- Reserve a final review before release.\n\nYour launch brief is ready in the results panel.` : `## 留出专注空间的发布计划\n你的需求：${prompt.slice(0, 180)}\n\n我将工作划分为三个检查点，每一步都有明确的交付结果。\n\n1. **周一 · 对齐：** 确定受众、范围和发布清单。\n2. **周三 · 验证：** 审查原型、排除阻碍并测试核心流程。\n3. **周五 · 交付：** 发布更新说明，与团队复盘结果。\n\n## 让团队持续前进\n- 为每个里程碑指定一位负责人。\n- 控制同时进行的工作数量。\n- 在发布前保留最终审核时间。\n\n发布简报已生成，可在成果面板查看。`);
  const tools: ToolCall[] = [
    { id: 'context', name: en ? 'Read workspace context' : '读取工作区上下文', input: en ? `Local sample · ${scenario}` : `本地样本 · ${scenario === 'plan' ? '任务规划' : scenario === 'research' ? '资料分析' : '代码解释'}`, output: en ? '3 sample documents indexed. No external requests.' : '已整理 3 份示例资料，未发送外部请求。' },
    { id: 'compose', name: en ? 'Compose deliverable' : '整理交付成果', input: en ? 'Combine findings into a reusable brief.' : '将发现整理为可复用的简报。', output: en ? '1 artifact generated and ready to inspect.' : '已生成 1 份成果，可展开查看。' },
  ];
  return { content, tools, artifact: { name: scenario === 'code' ? 'cancellation.ts' : scenario === 'research' ? 'research-brief.md' : 'launch-plan.md', language: scenario === 'code' ? 'typescript' : 'markdown', content: scenario === 'code' ? 'const controller = new AbortController();\n\nasync function loadTasks() {\n  const response = await fetch("/api/tasks", { signal: controller.signal });\n  return response.json();\n}\n\n// Call when leaving the view.\ncontroller.abort();\n' : content } };
}
function seedConversation(id: string, scenario: Scenario, title: Text): Conversation {
  const en = responseFor(text(prompts[scenario], 'en'), scenario, 'en');
  const zh = responseFor(text(prompts[scenario], 'zh-CN'), scenario, 'zh-CN');
  return { id, title, draft: '', messages: [
    { id: id + '-u', role: 'user', content: prompts[scenario], status: 'completed', visible: 0, step: 99, tools: [] },
    { id: id + '-a', role: 'assistant', content: { en: en.content, zh: zh.content }, status: 'completed', visible: 0, step: 99, tools: en.tools.map((tool, i) => ({ ...tool, name: { en: String(tool.name), zh: String(zh.tools[i].name) }, input: { en: String(tool.input), zh: String(zh.tools[i].input) }, output: { en: String(tool.output), zh: String(zh.tools[i].output) } })), artifact: { ...en.artifact, content: { en: String(en.artifact.content), zh: String(zh.artifact.content) } } },
  ] };
}
export function initialChats() {
  return { activeId: 'welcome', conversations: [
    { id: 'welcome', title: { en: 'A fresh perspective', zh: '从一个新想法开始' }, draft: '', messages: [] },
    seedConversation('research-sample', 'research', { en: 'Research signals', zh: '研究资料分析' }),
    seedConversation('code-sample', 'code', { en: 'Understand cancellation', zh: '理解异步取消' }),
  ] };
}
export interface WebState { version: 1; dashboard: ReturnType<typeof initialDashboard>; chats: ReturnType<typeof initialChats>; resets: Record<WebSceneId, number> }
export function initialWebState(): WebState { return { version: 1, dashboard: initialDashboard(), chats: initialChats(), resets: { dashboard: 0, 'product-home': 0, 'agent-chat': 0 } }; }
export type WebAction =
  | { type: 'save-task'; task: Task } | { type: 'delete-task'; id: string } | { type: 'task-status'; id: string; status: TaskStatus }
  | { type: 'new-chat'; id: string } | { type: 'select-chat'; id: string } | { type: 'delete-chat'; id: string } | { type: 'rename-chat'; id: string; title: string }
  | { type: 'draft'; id: string; value: string } | { type: 'send'; id: string; messageId: string; prompt: string; scenario: Scenario; locale: Locale; fail: boolean }
  | { type: 'tick' | 'stop' | 'retry'; id: string; messageId: string } | { type: 'reset-scene'; scene: WebSceneId };
const stopMessages = (messages: ChatMessage[]) => messages.map(m => m.status === 'running' ? { ...m, status: 'stopped' as const } : m);
export function webReducer(state: WebState, action: WebAction): WebState {
  if (action.type === 'reset-scene') return { ...state, ...(action.scene === 'dashboard' ? { dashboard: initialDashboard() } : action.scene === 'agent-chat' ? { chats: initialChats() } : {}), resets: { ...state.resets, [action.scene]: state.resets[action.scene] + 1 } };
  if (action.type === 'save-task' || action.type === 'delete-task' || action.type === 'task-status') {
    const current = state.dashboard.tasks.find(t => t.id === (action.type === 'save-task' ? action.task.id : action.id));
    const task = action.type === 'save-task' ? { ...action.task, title: typeof action.task.title === 'string' ? action.task.title.trim().slice(0, 120) : action.task.title } : current;
    if (!task || !text(task.title, 'en').trim() || !projects.some(p => p.id === task.project) || !members.some(m => m.id === task.assignee) || !statuses.includes(task.status)) return state;
    if (action.type === 'task-status' && action.status === task.status) return state;
    const tasks = action.type === 'delete-task' ? state.dashboard.tasks.filter(t => t.id !== task.id) : current ? state.dashboard.tasks.map(t => t.id === task.id ? action.type === 'task-status' ? { ...task, status: action.status } : task : t) : [...state.dashboard.tasks, task];
    const verb = action.type === 'delete-task' ? { en: 'Deleted task', zh: '删除了任务' } : action.type === 'task-status' ? { en: 'Updated task status', zh: '更新了任务状态' } : { en: current ? 'Updated task' : 'Created task', zh: current ? '编辑了任务' : '创建了任务' };
    return { ...state, dashboard: { tasks, activities: [{ id: 'activity-' + (state.dashboard.activities.length + 1) + '-' + task.id, title: verb, detail: task.title }, ...state.dashboard.activities] } };
  }
  const chats = state.chats;
  if (action.type === 'new-chat') return { ...state, chats: { activeId: action.id, conversations: [{ id: action.id, title: { en: 'New conversation', zh: '新对话' }, draft: '', messages: [] }, ...chats.conversations.map(c => ({ ...c, messages: stopMessages(c.messages) }))] } };
  if (action.type === 'select-chat') return chats.activeId === action.id || !chats.conversations.some(c => c.id === action.id) ? state : { ...state, chats: { ...chats, activeId: action.id, conversations: chats.conversations.map(c => ({ ...c, messages: stopMessages(c.messages) })) } };
  if (action.type === 'delete-chat') {
    const remaining = chats.conversations.filter(c => c.id !== action.id);
    return { ...state, chats: remaining.length ? { activeId: chats.activeId === action.id ? remaining[0].id : chats.activeId, conversations: remaining } : initialChats() };
  }
  return { ...state, chats: { ...chats, conversations: chats.conversations.map(c => {
    if (c.id !== action.id) return c;
    if (action.type === 'rename-chat') return { ...c, title: action.title.trim().slice(0, 80) || c.title };
    if (action.type === 'draft') return { ...c, draft: action.value };
    if (action.type === 'send') {
      if (!action.prompt.trim() || c.messages.some(m => m.status === 'running')) return c;
      const prompt = action.prompt.trim(); const response = responseFor(prompt, action.scenario, action.locale);
      return { ...c, title: c.messages.length ? c.title : prompt.slice(0, 40), draft: '', messages: [...c.messages, { id: action.messageId + '-user', role: 'user', content: prompt, status: 'completed', visible: prompt.length, step: 99, tools: [] }, { id: action.messageId, role: 'assistant', ...response, status: 'running', visible: 0, step: 0, fail: action.fail }] };
    }
    return { ...c, messages: c.messages.map(m => {
      if (m.id !== action.messageId) return m;
      if (action.type === 'retry') return m.role === 'assistant' && m.status !== 'running' ? { ...m, status: 'running', step: 0, visible: 0, fail: false } : m;
      if (m.status !== 'running') return m;
      if (action.type === 'stop') return { ...m, status: 'stopped' };
      const step = m.step + 1;
      if (m.fail && step === 4) return { ...m, step, status: 'error' };
      const visible = Math.max(0, step - 5) * 48;
      return { ...m, step, visible, status: visible >= text(m.content, 'en').length ? 'completed' : 'running' };
    }) };
  }) } };
}
export function dashboardMetrics(tasks: Task[]) { return { active: projects.filter(p => tasks.some(t => t.project === p.id && t.status !== 'done')).length, open: tasks.filter(t => t.status !== 'done').length, completed: tasks.filter(t => t.status === 'done').length, due: tasks.filter(t => t.status !== 'done' && t.due && t.due <= sampleDate).length }; }

function isText(value: unknown): value is Text { return typeof value === 'string' || !!value && typeof value === 'object' && 'en' in value && 'zh' in value && typeof value.en === 'string' && typeof value.zh === 'string'; }
export function hydrateWebState(raw: string | null): WebState {
  try {
    const saved = JSON.parse(raw ?? 'null') as WebState | null;
    if (!saved || saved.version !== 1 || !Array.isArray(saved.dashboard?.tasks) || !Array.isArray(saved.dashboard.activities) || !Array.isArray(saved.chats?.conversations) || !saved.chats.conversations.length) return initialWebState();
    if (!saved.dashboard.tasks.every(t => typeof t.id === 'string' && isText(t.title) && statuses.includes(t.status) && projects.some(p => p.id === t.project) && members.some(m => m.id === t.assignee) && ['high', 'medium', 'low'].includes(t.priority) && typeof t.due === 'string') || !saved.dashboard.activities.every(a => typeof a.id === 'string' && isText(a.title) && isText(a.detail))) return initialWebState();
    if (!saved.chats.conversations.every(c => typeof c.id === 'string' && isText(c.title) && typeof c.draft === 'string' && Array.isArray(c.messages) && c.messages.every(m => typeof m.id === 'string' && ['user', 'assistant'].includes(m.role) && isText(m.content) && ['running', 'completed', 'stopped', 'error'].includes(m.status) && Number.isFinite(m.visible) && Number.isFinite(m.step) && Array.isArray(m.tools) && m.tools.every(t => typeof t.id === 'string' && isText(t.name) && isText(t.input) && isText(t.output)) && (!m.artifact || typeof m.artifact.name === 'string' && ['markdown', 'typescript'].includes(m.artifact.language) && isText(m.artifact.content))))) return initialWebState();
    return { version: 1, dashboard: saved.dashboard, chats: { activeId: saved.chats.conversations.some(c => c.id === saved.chats.activeId) ? saved.chats.activeId : saved.chats.conversations[0].id, conversations: saved.chats.conversations.map(c => ({ ...c, messages: stopMessages(c.messages) })) }, resets: initialWebState().resets };
  } catch { return initialWebState(); }
}
