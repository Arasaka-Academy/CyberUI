export type Bilingual = { en: string; zh: string };
export const blogCategories = [
  { id: 'updates', en: 'Product updates', zh: '产品更新' },
  { id: 'engineering', en: 'Engineering', zh: '工程实践' },
  { id: 'team', en: 'Team stories', zh: '团队故事' },
] as const;
export interface BlogPost {
  slug: string; category: typeof blogCategories[number]['id']; title: Bilingual; summary: Bilingual;
  date: string; minutes: number; author: string; role: Bilingual; cover: 'release' | 'systems' | 'people';
  intro: Bilingual; sections: { id: string; title: Bilingual; paragraphs: Bilingual[] }[];
}
export const blogPosts: BlogPost[] = [
  {
    slug: 'relay-2-4', category: 'updates', title: { en: 'A little less busy. A lot more useful.', zh: '少一点忙乱，多一点从容。' },
    summary: { en: 'Meet Relay 2.4: a calmer project home, decisions that travel with the work, and a better way to pick up where you left off.', zh: '认识 Relay 2.4：更清晰的项目首页、随工作流转的决策，以及随时接续的工作进度。' },
    date: '2026-10-28', minutes: 5, author: 'Aya Chen', role: { en: 'Product designer', zh: '产品设计师' }, cover: 'release',
    intro: { en: 'A project home should answer a small question: what needs my attention today? Our previous home answered several larger questions first. In Relay 2.4, we started with the small one and rebuilt the page around it.', zh: '项目首页应该先回答一个小问题：今天有什么需要我关注？过去的首页总是先回答几个更大的问题。这一次，我们从这个小问题出发，重新组织了整个页面。' },
    sections: [
      { id: 'attention', title: { en: 'A home built around attention', zh: '围绕注意力组织首页' }, paragraphs: [
        { en: 'The new Today view brings together work you own, decisions waiting for you, and approaching milestones. Each item has a next action and a person responsible. We removed the activity ticker from the top of the page because recency alone was a poor guide to importance.', zh: '新的「今日」视图汇集了你负责的任务、等待你确认的决策和即将到来的里程碑。每一项都有下一步行动和负责人。我们把动态流从页面顶部移走了，因为最近发生的事情，不一定是最重要的事情。' },
        { en: 'You can still open the full project timeline. The difference is that it now sits one deliberate step away. During our pilot, people used that space to prepare for reviews rather than to decide what to do next.', zh: '完整的项目时间线依然存在，只是需要主动打开。在试用阶段，团队更多地用它准备评审，而不再依赖它决定下一步做什么。信息并没有减少，只是获得了更合适的位置。' },
      ] },
      { id: 'decisions', title: { en: 'Decisions stay with the work', zh: '让决策跟着工作走' }, paragraphs: [
        { en: 'A decision now records its question, owner, outcome and a short explanation. Link it to a task and the context follows that task into the next cycle. A new teammate should not need to search a month of chat to understand why a button moved.', zh: '一条决策现在包含问题、负责人、结论和简短解释。将它关联到任务后，背景信息就能跟着任务进入下一个周期。新同事不应该为了理解一个按钮为什么移动，而翻遍一个月的聊天记录。' },
        { en: 'We intentionally kept this lightweight. Two sentences are often enough. The goal is a useful record of a choice, not another document to maintain. Existing comments and project links continue to work.', zh: '我们刻意保持了这项功能的轻量。通常两句话就足够了。它应该是一份有用的选择记录，而不是另一份需要维护的文档。原有评论和项目链接仍然可用。' },
      ] },
      { id: 'rollout', title: { en: 'A steady rollout', zh: '平稳地交付变化' }, paragraphs: [
        { en: 'Relay 2.4 arrives in stages this week. Your saved views, task history and permissions stay in place. Project owners can preview the new home with their team before making it the default.', zh: 'Relay 2.4 将在本周分阶段开放。已保存的视图、任务历史和权限都会保留。项目负责人可以先邀请团队预览，再把新首页设为默认。' },
        { en: 'Our next checkpoint is simple: can someone returning from a week away find their next action without asking for a recap? We will keep observing that moment. Useful software should make returning to work a little easier.', zh: '下一次验证的目标很简单：离开一周后，能否不用追问进展就找到下一步行动？我们会继续观察这个时刻。好用的软件，应该让重新投入工作变得轻松一点。' },
      ] },
    ],
  },
  {
    slug: 'designing-for-the-return', category: 'updates', title: { en: 'Designing for the moment you return', zh: '为再次回来的那一刻设计' },
    summary: { en: 'Drafts, reading position and useful defaults: the small details that make a workspace feel continuous.', zh: '草稿、阅读位置和恰当的默认值：让工作空间保持连续的细节。' },
    date: '2026-10-21', minutes: 4, author: 'Mina Park', role: { en: 'Product manager', zh: '产品经理' }, cover: 'release',
    intro: { en: 'Most product flows are drawn from a clean starting point. Real work rarely starts there. Someone closes a tab, takes a call, and comes back with half a sentence still in mind. We spent this release working on that return.', zh: '大多数产品流程图从空白状态开始，真实工作却很少如此。有人关掉标签页，接起电话，再带着半句话回来。这一轮迭代，我们专门研究了「回来」这件事。' },
    sections: [
      { id: 'drafts', title: { en: 'A draft is already work', zh: '草稿已经是工作成果' }, paragraphs: [
        { en: 'We now save unfinished updates as you type. The draft belongs to its project rather than to a browser session, so switching to another project does not replace it. A quiet Saved label appears after the change is stored.', zh: '现在，未写完的更新会随着输入保存。草稿属于项目，而不是某次浏览器会话，因此切换到其他项目不会把它覆盖。保存完成后，页面会安静地显示「已保存」。' },
        { en: 'We also made discarding a draft explicit. Closing the editor preserves it; choosing Discard removes it. During research, those two intentions repeatedly looked identical to the software, even though they were very different to the person using it.', zh: '我们也明确区分了关闭和放弃。关闭编辑器会保留内容，选择「放弃草稿」才会删除。研究中，软件经常把这两种意图视为同一个动作，但对使用者而言，它们完全不同。' },
      ] },
      { id: 'position', title: { en: 'Keep a place, not a surprise', zh: '保留位置，也保留可预期性' }, paragraphs: [
        { en: 'Returning to a long discussion restores your reading position. New messages collect behind a visible Jump to latest button instead of pulling the page out from under you. Opening a different discussion starts at its own saved place.', zh: '回到长讨论时，页面会恢复上次的阅读位置。新消息通过可见的「回到最新」按钮提示，不再突然把页面拉走。打开另一段讨论，也会回到它各自的位置。' },
        { en: 'Restoration has limits. A completed dialog does not reopen, and a paused operation does not restart itself. We preserve the work while asking for a new intention before a side effect continues.', zh: '恢复也有边界。已经完成的对话框不会重新打开，暂停的操作也不会自行重启。我们保留工作成果，同时要求使用者重新表达意图，再继续可能产生影响的动作。' },
      ] },
      { id: 'next', title: { en: 'Measure the second visit', zh: '衡量第二次使用' }, paragraphs: [
        { en: 'Our acceptance session now includes a deliberate interruption: create something, leave, open another area, then return. We check both the content and the focus position. This caught problems that a polished first-use demo never showed.', zh: '验收流程现在包含一次刻意的中断：创建内容、离开、打开别处、再回来。我们同时检查内容和焦点位置。这发现了很多首次使用演示暴露不出的问题。' },
        { en: 'Continuity is not a single feature we can finish. It is a promise that every new flow has to keep. If a workspace remembers the right small things, people can spend less energy reconstructing their own context.', zh: '连续性不是一个可以一次做完的功能，而是每条新流程都需要遵守的承诺。当工作空间记住了恰当的小事，人们就可以少花一些精力，重新拼凑自己的上下文。' },
      ] },
    ],
  },
  {
    slug: 'local-first-interactions', category: 'engineering', title: { en: 'Fast interfaces start with a clear state model', zh: '流畅的界面，始于清晰的状态模型' },
    summary: { en: 'How we separate persistent work, temporary UI and running operations without making the interface harder to reason about.', zh: '如何区分持久工作、临时界面与运行中的操作，让复杂交互依然可理解。' },
    date: '2026-10-16', minutes: 6, author: 'Noah Reed', role: { en: 'Frontend engineer', zh: '前端工程师' }, cover: 'systems',
    intro: { en: 'A fast response is valuable only if it is also predictable. When we rebuilt our project workspace, the first engineering question was not which cache to use. It was which facts the interface needed to remember, and for how long.', zh: '快速响应只有在行为可预期时才有价值。重构项目工作空间时，我们首先讨论的不是使用哪种缓存，而是界面到底需要记住哪些事实，以及需要记多久。' },
    sections: [
      { id: 'ownership', title: { en: 'Give each fact one owner', zh: '让每条事实只有一个归属' }, paragraphs: [
        { en: 'Task titles and saved filters belong to the persistent model. An open menu and an unfinished search belong to the current view. A request in flight owns a cancellation signal. Putting these in separate places makes navigation behavior much easier to explain.', zh: '任务标题和已保存的筛选属于持久模型。展开的菜单和临时搜索属于当前视图。执行中的请求拥有自己的取消信号。把它们放在不同的位置，导航行为就更容易解释。' },
        { en: 'Our reducers describe intentions such as rename, move and archive. They reject unknown records and leave the original object intact when nothing changes. Components render the result rather than maintaining competing copies of the same task.', zh: 'Reducer 描述重命名、移动和归档这样的意图。遇到未知记录会拒绝操作，没有变化时保留原对象。组件只渲染结果，不再维护同一个任务的多份副本。' },
      ] },
      { id: 'recovery', title: { en: 'Recovery is a normal path', zh: '把恢复当作正常路径' }, paragraphs: [
        { en: 'Stored data is input, not proof. We validate each saved section and supply defaults for fields introduced later. A broken preference should not delete valid project work. Restoring a running operation changes it to paused until the user resumes.', zh: '存储数据是输入，不是正确性的证明。我们逐段校验保存内容，为后来引入的字段补充初值。一项损坏的偏好不应删除有效的项目成果。恢复时，执行中的操作会先变成暂停，等待用户继续。' },
        { en: 'When storage is unavailable, the workspace still works in memory. We do not turn an optional convenience into a requirement for editing a task. The same reducer handles both paths, which keeps the behavior consistent.', zh: '存储不可用时，工作空间仍可在内存中运行。保存偏好是便利能力，不应该成为编辑任务的前提。两条路径使用同一个 Reducer，因此行为保持一致。' },
      ] },
      { id: 'testing', title: { en: 'Test the boundaries', zh: '测试边界，而不是内部步骤' }, paragraphs: [
        { en: 'We test what happens when the last item completes, when an old record loads, and when a result arrives after cancellation. A useful test describes an outcome that would matter to a person, without repeating the implementation line by line.', zh: '我们测试最后一项完成、旧记录加载，以及取消后仍收到结果时会发生什么。有用的测试描述对使用者有意义的结果，而不是逐行重复实现。' },
        { en: 'This structure has made performance work more focused. We can measure slow rendering separately from uncertain state transitions. Clear ownership does not remove every bug, but it gives us a smaller place to look when something goes wrong.', zh: '这种结构也让性能优化更有针对性。我们可以把渲染缓慢和状态切换不确定分开衡量。清晰的归属不能消除所有错误，却能在出问题时缩小排查范围。' },
      ] },
    ],
  },
  {
    slug: 'accessible-by-default', category: 'engineering', title: { en: 'Keyboard paths are product paths', zh: '键盘路径，也是产品路径' },
    summary: { en: 'What we learned by building a complete task flow without reaching for a mouse.', zh: '完整地用键盘走完一次任务流程，我们学到了什么。' },
    date: '2026-10-09', minutes: 5, author: 'Sam Rivera', role: { en: 'Design engineer', zh: '设计工程师' }, cover: 'systems',
    intro: { en: 'We used to check keyboard support at the end of a feature. Now one person uses the keyboard throughout the first prototype review. This changes which problems become visible while they are still cheap to fix.', zh: '过去，我们在功能完成后检查键盘支持。现在，第一次原型评审就有人全程使用键盘。这让问题在修复成本还很低的时候，就变得可见。' },
    sections: [
      { id: 'focus', title: { en: 'Focus tells the story', zh: '焦点讲述操作的故事' }, paragraphs: [
        { en: 'Opening an editor moves focus to its first useful field. A validation error takes focus to the field that needs attention. Closing the editor returns focus to its trigger. These are the same transitions that sighted mouse users infer from movement and layout.', zh: '打开编辑器后，焦点进入第一个有用的字段。校验失败时，焦点移到需要处理的位置。关闭编辑器，焦点回到触发按钮。这些转移对应着鼠标使用者从动画和布局中推断出的关系。' },
        { en: 'We avoid positive tab indices and let document order do most of the work. When a deleted row removes its own trigger, focus moves to the next stable control. There should always be an answer to the question: where am I now?', zh: '我们避免使用正数 tabIndex，尽量让文档顺序承担导航职责。如果删除一行也移除了触发按钮，焦点会进入下一个稳定的控件。界面应该始终能回答：我现在在哪里？' },
      ] },
      { id: 'controls', title: { en: 'Use familiar controls', zh: '使用熟悉的控件规则' }, paragraphs: [
        { en: 'A link opens a destination. A button performs an action. A dialog traps focus until it closes and responds to Escape. Building on these familiar contracts lets us spend design effort on the work rather than on teaching a new interaction language.', zh: '链接打开目的地，按钮执行动作。对话框在关闭前约束焦点，并响应 Escape。遵守这些熟悉的约定，设计精力就可以用在工作本身，而不是教用户学习另一种交互语言。' },
        { en: 'Labels name the action even when the screen shows only an icon. Toggle buttons expose their pressed state. Playback progress does not announce every second; only meaningful changes deserve to interrupt someone listening to the interface.', zh: '即使屏幕上只显示图标，标签也会描述动作。切换按钮暴露按下状态。播放进度不会每秒播报，只有有意义的变化，才值得打断正在聆听界面的人。' },
      ] },
      { id: 'review', title: { en: 'Automation and a real walkthrough', zh: '自动检查与实际走查' }, paragraphs: [
        { en: 'Automated checks find missing names, invalid roles and many contrast failures. We run them across our themes. They do not tell us whether the focus order is understandable or whether a dialog restores focus to a useful place.', zh: '自动检查能发现缺失名称、错误角色和许多对比度问题，我们在所有主题中运行它们。但它们不能告诉我们焦点顺序是否易懂，或关闭对话框后的位置是否有用。' },
        { en: 'Our release review combines those checks with one complete keyboard journey at a narrow width. It is a small habit with a broad effect: the resulting product is usually easier to understand with touch and a mouse as well.', zh: '因此发布评审会把自动检查，与窄屏下的一次完整键盘操作结合。这是一个小习惯，却有广泛影响：最终的产品，通常对触控和鼠标使用者也更加清楚。' },
      ] },
    ],
  },
  {
    slug: 'a-smaller-review', category: 'team', title: { en: 'The best review starts with a smaller question', zh: '好的评审，从一个更小的问题开始' },
    summary: { en: 'Inside our weekly working session, where one unfinished flow gets everyone’s full attention.', zh: '走进每周工作讨论：让一条未完成的流程，获得所有人的完整注意力。' },
    date: '2026-10-02', minutes: 4, author: 'Jules Okafor', role: { en: 'Team lead', zh: '团队负责人' }, cover: 'people',
    intro: { en: 'Our old design review had fourteen people, forty slides and almost no decisions. We replaced it with a thirty-minute working session around one question. The work became less theatrical and much more useful.', zh: '以前的设计评审有十四个人、四十页幻灯片，却很少做出决策。后来，我们改为围绕一个问题，进行三十分钟的工作讨论。少了展示的仪式感，却有了更多实际成果。' },
    sections: [
      { id: 'question', title: { en: 'Bring a question, not a deck', zh: '带来问题，而不是演示文稿' }, paragraphs: [
        { en: 'The person sharing writes one sentence before the meeting: what do I need help deciding? We then use the prototype as a working object. If the question is about returning to an unfinished task, we do not spend the session adjusting the color of the header.', zh: '分享者会在会前写下一句话：我需要大家帮助决定什么？然后大家围绕原型工作。如果问题是如何回到未完成任务，就不会把整场会议花在调整页眉颜色上。' },
        { en: 'This also makes participation fairer. People can read the question in advance, try the flow, and leave a note before speaking. The loudest first impression is no longer the only starting point.', zh: '这也让参与更加公平。每个人都可以提前阅读问题、尝试流程，并在发言前留下观察。声音最大的第一印象，不再是讨论的唯一起点。' },
      ] },
      { id: 'observe', title: { en: 'Describe what happened', zh: '先描述发生了什么' }, paragraphs: [
        { en: 'We ask observers to separate an observation from a suggestion. “I could not find my saved draft” tells us more than “make the button larger.” A useful observation can support several solutions, including one no one has imagined yet.', zh: '我们要求观察者把事实和建议分开。「我找不到保存的草稿」，比「把按钮做大」提供了更多信息。一条有用的观察可以支持多种方案，也包括当下还没人想到的方案。' },
        { en: 'The designer does not have to defend every unfinished detail. They can ask follow-up questions and test a change in the room. When the work is treated as shared material, feedback becomes easier to hear.', zh: '设计师不必为每个未完成的细节辩护，而是可以追问，并在现场尝试调整。当作品被视为共同工作的材料时，反馈也更容易被听见。' },
      ] },
      { id: 'record', title: { en: 'Leave with a small record', zh: '带着一份简短记录离开' }, paragraphs: [
        { en: 'The session ends with the decision, its owner, and the next thing we will test. Unresolved questions stay visible. A short record in the project is more useful than a perfect recap that arrives three days later.', zh: '会议结束时，我们记录决策、负责人和下一项验证。尚未解决的问题也会明确留下。项目里一份简短的即时记录，比三天后才出现的完美纪要更有用。' },
        { en: 'We still hold bigger reviews for larger bets. But for everyday work, a smaller question gives a team enough room to think together. Thirty focused minutes can move a project further than an hour of polished agreement.', zh: '面对更大的方向选择，我们依然举行更全面的评审。但对于日常工作，一个更小的问题，就足以给团队留下共同思考的空间。三十分钟的专注讨论，往往胜过一小时精致的附和。' },
      ] },
    ],
  },
  {
    slug: 'notes-from-a-slow-friday', category: 'team', title: { en: 'Notes from a slow Friday', zh: '一个慢下来的周五' },
    summary: { en: 'Why we left a little space in the week for maintenance, curiosity and the work that never makes the roadmap.', zh: '为何在每周留一点空间，交给维护、好奇心，以及路线图上没有的工作。' },
    date: '2026-09-25', minutes: 4, author: 'Aya Chen', role: { en: 'Product designer', zh: '产品设计师' }, cover: 'people',
    intro: { en: 'Last Friday, no new feature reached review. A broken test became reliable, a confusing label became clear, and a teammate finally understood a part of the system they had been avoiding. It was a productive day.', zh: '上周五，没有新功能进入评审。但一条不稳定的测试变得可靠，一处费解的标签变得清楚，还有一位同事终于理解了之前一直回避的系统模块。这是很有收获的一天。' },
    sections: [
      { id: 'space', title: { en: 'Make room before it disappears', zh: '在空间消失前，先把它留下' }, paragraphs: [
        { en: 'We reserve the last half-day of each cycle for maintenance and exploration. It is not a secret overflow lane for unfinished commitments. If planned work keeps consuming it, we reduce the next cycle rather than pretending the schedule has more hours.', zh: '每个周期的最后半天，我们留给维护和探索。它不是未完成承诺的隐蔽缓冲区。如果计划内工作持续占用它，我们会缩小下一周期的范围，而不是假装日程还能再挤出时间。' },
        { en: 'People choose something small that has been creating friction. The best candidates are often unglamorous: a slow local setup, an outdated example, or an error message that sends everyone to ask the same person.', zh: '每个人选择一件持续制造阻力的小事。最好的候选通常不起眼：缓慢的本地启动、过时的示例，或让所有人都不得不询问同一个人的错误提示。' },
      ] },
      { id: 'pair', title: { en: 'Borrow someone else’s perspective', zh: '借用另一个人的视角' }, paragraphs: [
        { en: 'Two of us pair across disciplines. An engineer watches a designer use the component playground; a designer follows the release checklist. The point is not to turn everyone into a generalist. It is to see where our own work makes someone else stop.', zh: '我们会跨岗位结对。工程师观察设计师使用组件演示，设计师跟着完成发布清单。目的不是让所有人都成为通才，而是看看自己的工作，会让另一个人在哪里停下来。' },
        { en: 'This week, that exercise removed three unnecessary setup steps. No one had requested the change because each step looked individually reasonable. Watching the whole sequence made the accumulated cost obvious.', zh: '本周，这个练习消除了三个多余的准备步骤。之前没人提出修改，因为每一步单独看都似乎合理。只有看完整个过程，累积的成本才变得明显。' },
      ] },
      { id: 'share', title: { en: 'Share a note, keep the habit', zh: '分享一条笔记，保留这个习惯' }, paragraphs: [
        { en: 'At the end of the afternoon, we share a short note: what changed, what we learned, and whether it needs a follow-up. A screenshot or a link is enough. We do not turn maintenance into another presentation to prepare.', zh: '下午结束前，我们分享一条简短笔记：改变了什么、学到了什么、是否需要后续处理。一张截图或一个链接就够，不把维护变成另一场需要准备的展示。' },
        { en: 'A calmer pace does not mean lower ambition. It gives the team a chance to notice the small costs that ambition accumulates. We want to build a product we enjoy working on, not just a roadmap we can finish.', zh: '节奏慢一点，并不意味着降低目标。它让团队有机会注意到，追求目标时积累的小成本。我们希望做出一个自己也愿意长期参与的产品，而不只是完成一张路线图。' },
      ] },
    ],
  },
];
