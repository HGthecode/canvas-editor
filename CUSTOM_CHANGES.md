# 自定义改动记录 (CUSTOM CHANGES)

本项目为二次开发（Fork自 `Hufe921/canvas-editor`），为了减少合并上游更新时的冲突，每次进行自定义修改后都**必须**在此文件记录。

## 新增文件（零侵入）
- `src/editor/core/command/CommandAdaptExtend.ts` — 表格属性自定义扩展命令（setTableAttr、setTableRowAttr、setTableColAttr 等）

## 对原始文件的改动记录

### 1. 表格自定义扩展属性
**改动目的**：支持表格单元格及行列的属性读写扩展。
| 文件 | 改动内容 |
|------|---------|
| `src/editor/core/command/CommandAdapt.ts` | 新增 `public extend` 字段；构造函数末尾调用 `registerExtend(this)` |
| `src/editor/core/command/Command.ts` | 新增 `public extend: CommandAdaptExtend` 属性并在构造函数中赋值 |
| `src/editor/index.ts` | 新增导出 `ITableAttrOption`、`ITableColAttrOption`、`ITableAttrUserActionAuth`、`CommandAdaptExtend` |

### 2. 控件样式增强（支持单个控件独立配置颜色和边框）
**改动目的**：允许为每一个表单控件单独指定文本颜色（color）、占位符颜色（placeholderColor）、前后缀颜色（bracketColor）、背景色以及边框样式。
| 文件 | 改动内容 |
|------|---------|
| `src/editor/interface/Control.ts` | `IControlStyle` 添加 `color` 字段；`IControlBasic` 增加所有 `IControlOption` 中的样式配置项。 |
| `src/editor/dataset/constant/Element.ts` | 在 `CONTROL_STYLE_ATTR` 数组中添加 `'color'`，使文本解析时保留颜色属性。 |
| `src/editor/utils/element.ts` | 处理前缀及占位符生成时，优先读取 `el.control?.bracketColor` 和 `el.control?.placeholderColor`。 |
| `src/editor/core/draw/control/interactive/ControlSearch.ts` | 解析禁用高亮或激活高亮等背景色时，优先读取控件自身的定义。 |
| `src/editor/core/draw/control/richtext/Border.ts` | `recordBorderInfo` 方法增加 `element` 参数，从而支持读取独立配置的边框颜色和粗细。 |
| `src/editor/core/draw/control/Control.ts` | `recordBorderInfo` 方法透传 `element` 参数给边框组件。 |
| `src/editor/core/draw/Draw.ts` | 绘制边框时将当前 `element` 传给 `this.control.recordBorderInfo`。 |
