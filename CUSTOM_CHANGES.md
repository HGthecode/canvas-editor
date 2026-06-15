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

### 2. 表格单元格编号显示（showCellNumber）
**改动目的**：新增 `showCellNumber` 选项，开启后在每个单元格中央显示行列编号（A1、B1、C2...）。
| 文件 | 改动内容 |
|------|---------|
| `src/editor/interface/table/Table.ts` | `ITableOption` 新增 `showCellNumber`、`cellNumberColor`、`cellNumberFontSize` 字段 |
| `src/editor/dataset/constant/Table.ts` | `defaultTableOption` 添加对应默认值 |
| `src/editor/core/draw/particle/table/TableParticle.ts` | 新增 `_getColLetter()` 和 `_drawCellNumber()` 私有方法，在 `render()` 末尾调用 |
| `src/editor/core/command/CommandAdaptExtend.ts` | 新增 `setShowCellNumber()` 方法及接口/注册绑定，支持动态开关并即时重绘 |

### 4. 表格表级数据源字段读取
**改动目的**：新增 `getTableFieldByIndex` 方法，支持在 per-cell field 为空时自动推导写回路径（`{tableField}.{cellId}`），实现跨单元格计算表达式。
| 文件 | 改动内容 |
|------|---------|
| `src/editor/core/command/CommandAdaptExtend.ts` | 新增 `getTableFieldByIndex()` 函数、接口方法签名及注册绑定 |

### 3. 控件样式增强（支持单个控件独立配置颜色和边框）
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
| `src/editor/core/draw/control/text/TextControl.ts` | 修改 `setValue` 方法，防止输入文本时错误继承 `placeholderColor` 或 `bracketColor`。 |
| `src/editor/core/draw/control/select/SelectControl.ts` | 修改 `setSelect` 方法，防止下拉选择文本时错误继承 `placeholderColor` 或 `bracketColor`。 |
| `src/editor/core/draw/control/number/NumberControl.ts` | 修改 `_setCalculatedValue` 方法，防止通过计算器赋值时错误继承 `placeholderColor` 或 `bracketColor`。 |
| `src/editor/core/draw/control/date/DateControl.ts` | 修改 `setValue` 和 `setSelect` 方法，防止直接输入及通过日期面板赋值时错误继承 `placeholderColor` 或 `bracketColor`。 |

### 5. 动态表格支持
**改动目的**：新增动态表格功能，支持通过配置数据源数组路径和列定义来动态生成表格行，行数由数据源数组长度决定。
| 文件 | 改动内容 |
|------|---------|
| `src/editor/core/command/CommandAdaptExtend.ts` | 新增 `IDynamicTableColumn`、`IDynamicTableConfig` 类型导出；新增 `insertDynamicTableAtCursor()`、`rebuildDynamicTableDataRows()`、`getAllDynamicTables()` 三个扩展命令及接口/注册绑定 |
| `src/editor/index.ts` | 新增导出 `IDynamicTableColumn`、`IDynamicTableConfig` |
