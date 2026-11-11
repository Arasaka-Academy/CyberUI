export const categories=[
  {id:'foundation',en:'Foundation & layout',zh:'基础与容器',code:'01',icon:'deck'},
  {id:'forms',en:'Forms & input',zh:'表单与输入',code:'02',icon:'controls'},
  {id:'navigation',en:'Navigation',zh:'导航',code:'03',icon:'network'},
  {id:'feedback',en:'Feedback & overlays',zh:'反馈与浮层',code:'04',icon:'warning'},
  {id:'data',en:'Data display',zh:'数据展示',code:'05',icon:'stats'},
  {id:'original',en:'CyberUI signatures',zh:'特色组件',code:'06',icon:'shard'},
] as const;
type Entry=[string,string,string,string,string?];
const entries:Record<string,Entry[]>={
  foundation:[
    ['Button','按钮','Chamfered commands with clear priority.','带切角与清晰优先级的命令按钮。','primary,secondary,accent2,soft,ghost,danger'],
    ['IconButton','图标按钮','A compact command with an accessible name.','具有无障碍名称的紧凑命令。','primary,secondary,accent2,soft,ghost,danger'],
    ['ButtonGroup','按钮组','Related actions in a flexible row.','在弹性行中组织相关操作。'],
    ['Badge','徽标','Compact, semantic status readouts.','紧凑且具备语义的状态标记。','default,accent,success,warning,danger'],
    ['Tag','标签','Removable labels for selected values.','用于已选值、可单独移除的标签。'],
    ['Avatar','头像','An image identity with initials fallback.','支持图像与首字母回退的身份标记。'],
    ['Divider','分割线','A precise one-pixel separator.','精确的一像素内容分隔。'],
    ['Panel','面板','Six distinct border geometries.','六种可组合的边框形态。','frame,chamfer,brackets,header,rail,none'],
    ['Card','卡片','A content surface with optional actions.','包含可选操作的内容容器。'],
    ['Toolbar','工具栏','Grouped commands with arrow-key navigation.','支持方向键导航的命令工具栏。'],
  ],
  forms:[
    ['Field','字段','Visible labels, guidance and inline errors.','统一可见标签、辅助说明与行内错误。'],
    ['Input','输入框','Native text input with full ref support.','保留原生属性与 ref 的文本输入。'],
    ['Textarea','文本域','Multiline input with a resizable writing area.','适合多行内容的文本输入区域。'],
    ['NumberInput','数字输入','Bounded values with accessible steppers.','带边界与无障碍步进操作的数值输入。'],
    ['PasswordInput','密码输入','Reveal a password without losing focus.','在保留输入状态的同时查看密码。'],
    ['Checkbox','复选框','Independent, keyboard-operable selection.','支持键盘的独立勾选项。'],
    ['RadioGroup','单选组','One choice in a clearly labelled group.','在清晰标记的一组中选择单项。'],
    ['Switch','开关','Immediate binary settings with visible state.','状态明确、即时生效的二元设置。'],
    ['Select','选择器','Single selection with typeahead.','支持首字母导航的单项选择。'],
    ['Combobox','组合框','Search and select from suggestions.','输入搜索并从建议项中选择。'],
    ['MultiSelect','多选器','Select multiple entries and remove tags.','选择多个项目，并通过标签移除。'],
    ['Slider','滑块','Adjust a continuous or stepped value.','调整连续值或离散步进值。'],
    ['DatePicker','日期选择','Theme-aware date and time input with a keyboard calendar, month/year navigation and range validation.','主题化日期与时间输入，支持键盘日历、月份年份切换和范围校验。'],
    ['TimePicker','时间选择','Keyboard-editable 24-hour time.','支持键盘编辑的 24 小时时间。'],
    ['ColorPicker','颜色选择','Native color selection and validated HEX.','原生选色与经过校验的 HEX 输入。'],
    ['FileUpload','文件上传','Drop files or use a native file chooser.','拖放文件或使用原生文件选择器。'],
  ],
  navigation:[
    ['Tabs','分页标签','Switch between related content panels.','切换同一上下文中的内容面板。'],
    ['SegmentedControl','分段控制','Mutually exclusive view and mode switches.','用于互斥视图与模式的快速切换。'],
    ['Breadcrumb','面包屑','Trace a readable path through the archive.','标记可返回的层级路径。'],
    ['Pagination','分页器','Bounded navigation through result pages.','具有边界的结果页面导航。'],
    ['Sidebar','侧边导航','Hierarchical navigation with active states.','清晰标记当前页面的侧边导航。'],
    ['BottomNavigation','底部导航','Up to five primary destinations.','最多五个主要目的地的移动导航。'],
    ['NavigationMenu','导航菜单','Linked destinations with native URLs.','保留原生 URL 的目的地链接。'],
    ['DropdownMenu','下拉菜单','Context actions with full keyboard control.','支持完整键盘操作的上下文菜单。'],
    ['CommandPalette','命令面板','Searchable actions in a focused dialog.','在聚焦弹窗中搜索并执行命令。'],
  ],
  feedback:[
    ['Dialog','对话框','A focused modal with Escape and restoration.','管理焦点、Escape 与焦点恢复的模态框。'],
    ['AlertDialog','确认对话框','Explicit confirmation for a consequential action.','为重要操作提供明确确认。'],
    ['Drawer','抽屉','A responsive side surface with focus containment.','约束焦点的响应式侧边面板。'],
    ['Popover','浮出面板','Contextual content anchored to its trigger.','锚定触发控件的上下文内容。'],
    ['Tooltip','提示','Supplementary context on hover and focus.','悬停或聚焦时显示补充信息。'],
    ['Toast','轻提示','Dismissible feedback with pause on focus.','支持聚焦暂停和主动关闭的操作反馈。'],
    ['Alert','警示','Persistent, contextual status messages.','在当前内容区域显示持续的状态说明。','info,success,warning,danger'],
    ['Progress','进度','Five distinctive reading signals.','五种不同风格的进度信号。','segments,ascii,heartbeat,scanline,equalizer'],
    ['Skeleton','骨架屏','Reserve space during data loading.','加载时保留内容空间。'],
    ['Spinner','加载指示','An accessible indeterminate busy state.','具备无障碍名称的未知进度加载状态。'],
    ['EmptyState','空状态','Explain an empty result and the next action.','说明空结果原因并提供下一步操作。'],
  ],
  data:[
    ['Table','表格','Semantic rows and columns with custom cells.','带自定义单元格的语义表格。'],
    ['DataTable','数据表格','Search, sort, select and paginate records.','搜索、排序、选择与分页查看记录。'],
    ['Accordion','折叠面板','Expandable sections with controlled state.','支持受控展开状态的内容分区。'],
    ['TreeView','树形视图','Navigate a nested archive by keyboard.','使用键盘浏览嵌套档案。'],
    ['Calendar','日历','Locale-aware single-date selection.','遵循语言习惯的单日选择。'],
    ['Chart','图表','Lines, bars and sparklines with exact data.','包含精确数据的折线、柱状与趋势图。','line,bar,sparkline'],
  ],
  original:[
    ['StatusBar','状态栏','Fixed-time telemetry from the cyberdeck.','Cyberdeck 固定时间与遥测读数。'],
    ['OperatorCard','操作员卡','An identity card with rank and equipment.','结合等级与装备外观的身份卡。','full,compact'],
    ['AsciiCover','字符封面','Deterministic, locally generated cover art.','本地生成、结果固定的字符封面。','braille,ascii,blocks,halftone,contour'],
    ['BookCard','书籍卡','Cover, reading progress and favorite action.','封面、阅读进度与收藏操作。','grid,compact'],
    ['CollectionStack','收藏集','A layered archive of related books.','以堆叠书封表达相关书籍收藏。'],
    ['DataShard','数据碎片','Recovered quotations from the archive.','从档案中恢复的引文碎片。'],
    ['GigCard','任务卡','A reading contract with progress and payout.','包含进度与收益的阅读委托。'],
    ['ThemeSwatch','主题色板','Preview and select a theme palette.','预览并选择主题配色。'],
    ['LauncherTile','启动器','Direct access to the next destination.','直接前往下一目的地的启动入口。'],
    ['TelemetryPanel','遥测面板','Grouped readings and segmented gauges.','分组展示读数与分段仪表。'],
    ['JackInCard','连接卡','Five entry sequences for the reading deck.','五种进入阅读终端的连接外观。','standard,terminal,poster,ticket,scanner'],
    ['SkylineCalendar','天际线日历','Daily pages form an interactive skyline.','以每日阅读页数构成可交互天际线。'],
    ['VirtualKeyboard','虚拟键盘','A supplemental, fully keyboard-accessible input.','可通过键盘操作的辅助虚拟输入。','alpha,numeric'],
  ],
};
export const components=categories.flatMap(category=>entries[category.id].map(([name,zh,enDescription,zhDescription,variants])=>({name,zh,enDescription,zhDescription,category:category.id,variants:variants?.split(',')??[]})));
export type ComponentName=string;
export const keyboardGuide=(name:string):[string,string]=>{
  if(name==='SkylineCalendar')return ['Tab focuses the skyline as one date slider. Arrow keys, Home and End select a day; click or drag across the skyline. Exact daily values are also available below.','Tab 将天际线聚焦为一个日期滑块；方向键、Home 与 End 选择日期；也可点击或拖动天际线。下方可展开每日精确数据。'];
  if(['Dialog','AlertDialog','Drawer','CommandPalette','Popover'].includes(name))return ['Enter or Space opens. Tab stays within a modal; Escape closes and returns focus to the trigger.','Enter 或空格打开；Tab 在模态框内移动；Escape 关闭并恢复触发控件焦点。'];
  if(['Select','Combobox','MultiSelect','DropdownMenu','TreeView','RadioGroup','Tabs','SegmentedControl','Toolbar'].includes(name))return ['Tab enters the control; arrow keys navigate. Enter or Space selects. Escape closes a popup.','Tab 进入控件，方向键移动；Enter 或空格选择；Escape 关闭浮层。'];
  if(['Input','Textarea','NumberInput','PasswordInput','Slider','DatePicker','TimePicker','ColorPicker','FileUpload','Calendar','VirtualKeyboard'].includes(name))return ['Tab focuses the input. Use native editing keys; arrows adjust numeric and date values. A visible label names every control.','Tab 聚焦输入；使用原生编辑键；方向键调整数字或日期；每个控件都有可见标签。'];
  if(['Divider','Badge','Avatar','StatusBar','AsciiCover','Skeleton','Spinner','Progress','TelemetryPanel','Chart','Alert','Table','Card','Panel','DataShard'].includes(name))return ['Static content stays out of the tab order. Embedded actions and exact-data disclosure controls remain keyboard accessible.','静态内容不进入 Tab 顺序；嵌入的操作与精确数据展开控件支持键盘访问。'];
  return ['Tab moves between actions. Enter activates links; Enter or Space activates buttons. Focus is always visible.','Tab 在操作间移动；Enter 激活链接；Enter 或空格激活按钮；始终保留可见焦点。'];
};
