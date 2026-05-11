# CLAUDE.md

本文件为 AI 编码助手在操作本仓库时提供指引。

---

## 一、项目基本信息

| 属性 | 内容 |
|------|------|
| 项目名称 | @hufe921/canvas-editor |
| 当前版本 | 0.9.133 |
| 上游仓库 | https://github.com/Hufe921/canvas-editor |
| Fork 仓库 | https://github.com/HGthecode/canvas-editor |
| 技术栈 | TypeScript + HTML5 Canvas/SVG |
| 构建工具 | Vite 8 + pnpm |
| Node 要求 | >= 24.13.1 |

> 本项目是从上游仓库 fork 而来，需要定期合并上游更新。**开发时必须以最小化修改原始文件为首要原则。**

---

## 二、开发命令速查

- `npm run dev` — 启动开发服务器
- `npm run lib` — 构建库（依次执行 lint、类型检查、打包）
- `npm run build` — 构建应用（依次执行 lint、类型检查、打包）
- `npm run lint` — 运行 ESLint
- `npm run type:check` — 仅执行 TypeScript 类型检查（不输出文件）
- `npm run cypress:open` — 打开 Cypress 图形化测试界面
- `npm run cypress:run` — 无界面模式运行 Cypress 测试
- `npm run docs:dev` — 启动 VitePress 文档服务器
- `npm run docs:build` — 构建 VitePress 文档
- `npm run release` — 执行发布脚本

运行单个 Cypress 测试文件：
```bash
npx cypress run --spec cypress/e2e/<测试文件>.cy.ts
```

---

## 三、Git 钩子

Pre-commit 钩子会自动执行 `npm run lint` 和 `npm run type:check`。

提交信息必须遵循 **Conventional Commits** 格式，例如：
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档变更
- `refactor:` 代码重构
- `chore:` 构建/工具链变更

---

## 四、架构概览

本项目是一个基于 Canvas 的富文本编辑器，使用 TypeScript 构建，核心架构采用模块化分层设计。

### 4.1 核心类

**Editor 类**（`src/editor/index.ts`）
- 主入口，协调所有子系统的初始化
- 通过 `command` 属性暴露公开 API（如 `editor.command.executeBold()`）
- 通过 `destroy()` 方法管理生命周期

**Draw 类**（`src/editor/core/draw/Draw.ts`）
- 核心渲染引擎（约 96KB），负责 Canvas 绘制
- 管理页面、行、元素、光标的渲染
- 协调所有粒子类型和帧元素

**命令模式**（`src/editor/core/command/`）
- `Command.ts`：外观层，暴露所有执行方法（如 `executeBold`、`executeUndo`）
- `CommandAdapt.ts`：适配器，将命令桥接到 Draw 上下文
- 所有命令遵循 `execute*` 命名约定
- `CommandAdaptExtend.ts`：**自定义扩展命令文件**（见第六节）

### 4.2 元素系统

编辑器使用定义在 `src/editor/interface/Element.ts` 中的层级元素模型：

**IElement** — 所有内容元素的基础接口，包含：
- 基础属性：`id`、`type`、`value`、`extension`、`externalId`
- 样式：`font`、`size`、`bold`、`color` 等（IElementStyle）
- 规则：`hide`（IElementRule）
- 分组：`groupIds`（IElementGroup）

**元素类型**（ElementType 枚举）：
- 文本粒子：TextParticle、ListParticle、HyperlinkParticle 等
- 块粒子：ImageParticle、TableParticle、LaTexParticle 等
- 控件粒子：CheckboxParticle、RadioParticle 等
- 帧元素：Margin、Background、PageNumber 等

### 4.3 目录结构

```
src/editor/
├── core/
│   ├── draw/            # 渲染引擎
│   │   ├── particle/    # 元素渲染（文字、图片、表格、LaTeX 等）
│   │   ├── control/     # 控件组件渲染
│   │   ├── frame/       # 帧元素（页边距、背景、边框）
│   │   ├── richtext/    # 富文本装饰（下划线、高亮）
│   │   └── interactive/ # 交互功能（搜索、涂鸦）
│   ├── command/         # 命令模式实现
│   │   ├── Command.ts
│   │   ├── CommandAdapt.ts
│   │   └── CommandAdaptExtend.ts  # ✅ 自定义扩展（勿删）
│   ├── event/           # Canvas 及全局事件处理
│   ├── observer/        # 鼠标、选区、图片观察者
│   ├── worker/          # Web Worker 异步操作
│   └── [其他子系统]
├── interface/           # TypeScript 接口定义（42 个文件）
├── dataset/             # 枚举和常量
└── utils/               # 工具函数
```

### 4.4 Web Workers

异步操作通过 `WorkerManager.ts` 管理：
- `WordCountWorker` — 统计元素列表中的字数
- `CatalogWorker` — 生成文档目录/TOC
- `GroupWorker` — 从元素中提取分组 ID
- `ValueWorker` — 异步获取文档内容

### 4.5 事件系统

- **EventBus**（`src/editor/core/event/eventbus/`）— 编辑器事件的发布/订阅系统
- **Listener**（`src/editor/core/listener/`）— 变更通知的回调系统
- **CanvasEvent** 和 **GlobalEvent** — 处理鼠标、键盘、拖拽事件

### 4.6 插件系统

通过 `editor.use(plugin)` 模式扩展功能。参见 `src/editor/core/plugin/Plugin.ts`。

---

## 五、关键设计模式

**Command-Draw 分离**：命令通过 CommandAdapt 访问 Draw 功能，而非直接访问。这样可以避免将内部 Draw 上下文暴露给外部消费者。

**元素格式化**：元素通过 `formatElementList()` 工具函数格式化，该函数会应用默认值并补全缺失属性。

**基于区域的布局**：文档支持页眉/正文/页脚三个区域，通过 Zone 系统管理。

**位置-选区模型**：光标位置和选区通过 Position 和 RangeManager 类追踪。

**历史管理**：撤销/重做功能通过 HistoryManager 实现，维护命令历史栈。

---

## 六、二次开发策略（重要！）

> 本项目需要定期合并上游更新，**原始文件修改越少，合并冲突越少**。

### 6.1 六大扩展点（优先使用，冲突为零）

| 扩展点 | 用法 | 适用场景 |
|--------|------|---------|
| `editor.use(plugin)` | 插件系统 | 功能增强、UI 集成 |
| `editor.register.contextMenu(...)` | 注册右键菜单 | 自定义菜单项 |
| `editor.register.shortcut(...)` | 注册快捷键 | 自定义快捷键 |
| `editor.override.*` | 重写内置行为 | 改变默认交互逻辑 |
| `editor.eventBus.on(...)` | 事件监听 | 响应编辑器状态 |
| `editor.command.extend.*` | 自定义扩展命令 | 已有表格扩展命令 |

### 6.2 四种方案（按冲突风险排序）

**方案一：纯新建文件（推荐，冲突为零）**

适用于：新功能可完全通过现有 API 实现。建议将自定义代码放在：
```
src/custom/
├── plugins/     # 自定义插件（通过 editor.use() 加载）
├── commands/    # 自定义命令扩展文件
├── components/  # 自定义 UI 组件
└── types/       # 自定义类型扩展
```

**方案二：插件/Override/EventBus（冲突为零）**

```typescript
// src/custom/plugins/myFeaturePlugin.ts
export function myFeaturePlugin(editor: Editor) {
  editor.register.contextMenu(...)
  editor.eventBus.on('xxx', handler)
}
editor.use(myFeaturePlugin)
```

**方案三：扩展文件 + 最小钩子（冲突极低）**

将实现逻辑放在**新建的扩展文件**中，在原始文件中只添加 1~3 行钩子代码。
已有案例：`CommandAdaptExtend.ts` 模式。

**方案四：直接修改原始文件（最后手段）**

仅在前三种方案均无法满足需求时使用，且必须在下方"已有自定义改动"中记录。

### 6.3 已有自定义改动记录

所有针对原始代码的自定义修改，已统一记录在根目录下的 **[CUSTOM_CHANGES.md](./CUSTOM_CHANGES.md)** 文件中。
**任何后续对项目的自定义新增与修改，都必须同步更新到该文件中。**

### 6.4 合并上游更新步骤

```bash
# 1. 拉取上游最新代码
git fetch upstream

# 2. 合并到本地分支
git merge upstream/main

# 3. 解决冲突（重点关注已修改过的文件）
#    Command.ts、CommandAdapt.ts、index.ts

# 4. 验证合并结果
npm run type:check
npm run lint

# 5. 提交合并
git commit -m "merge: sync upstream vX.X.X"
```

---

## 七、代码规范

| 规范项 | 要求 |
|--------|------|
| 分号 | **无分号**（`semi: never`） |
| 引号 | **单引号**（`quotes: single`） |
| 缩进 | **2 个空格**，无 Tab |
| 行宽 | **80 字符**（`printWidth: 80`） |
| 尾随逗号 | **无**（`trailingComma: none`） |
| 箭头函数括号 | 单参数时省略括号（`arrowParens: avoid`） |
| 行尾符 | **LF** |
| 注释语言 | **中文** |
| TypeScript | 严格模式，优先显式类型，避免 `any` |
