/**
 * 自定义扩展方法 —— 表格属性设置
 *
 * 独立文件维护，便于合并上游 canvas-editor 时减少冲突。
 * 使用方式：CommandAdapt 构造函数末尾调用 registerExtend(this)
 */
import { ElementType } from '../../dataset/enum/Element'
import { RowFlex } from '../../dataset/enum/Row'
import { TableBorder } from '../../dataset/enum/table/Table'
import { VerticalAlign } from '../../dataset/enum/VerticalAlign'
import { IPositionContext } from '../../interface/Position'
import type { CommandAdapt } from './CommandAdapt'
import type { IColgroup } from '../../interface/table/Colgroup'
import type { IElement } from '../../interface/Element'
import type { ISetControlValueOption } from '../../interface/Control'
import type { ITd } from '../../interface/table/Td'
import type { ITr } from '../../interface/table/Tr'
import { formatElementContext, formatElementList } from '../../utils/element'

/* ---------- 扩展参数类型 ---------- */

export interface ITableAttrUserActionAuth {
  adjustRowHeight?: boolean
  adjustColWidth?: boolean
  addRow?: boolean
  addCol?: boolean
  removeRow?: boolean
  removeCol?: boolean
  removeTable?: boolean
}

export interface ITableAttrOption {
  code?: string
  useActionAuth?: ITableAttrUserActionAuth
  visibleExpression?: string
  printVisibleExpression?: string
}

export interface ITableColAttrOption {
  horizontalAlign?: 'left' | 'center' | 'right'
  /** VerticalAlign 枚举值为 top/middle/bottom */
  verticalAlign?: 'top' | 'middle' | 'bottom'
  backgroundColor?: string
  disabled?: boolean
  /** 数据源：字段名 */
  field?: string
  /** 数据源：数据值路径（表达式） */
  valuePath?: string
}

/* ---------- 动态表格类型 ---------- */

export interface IDynamicTableColumn {
  title: string
  field: string
  width: number
  align: 'left' | 'center' | 'right'
  color: string
  backgroundColor: string
}

export interface IDynamicTableConfig {
  field?: string
  showHeader?: boolean
  dataSourcePath?: string
  columns?: IDynamicTableColumn[]
  borderColor?: string
  borderType?: string
  visibleExpression?: string
  printVisibleExpression?: string
}

/* ---------- 动态表格扩展方法 ---------- */

/**
 * 在光标位置插入一个动态表格。
 * 根据配置构建表头行（若 showHeader），不添加占位数据行。
 * 配置存储在 element.extension 中，tableToolDisabled 设为 true。
 */
export function insertDynamicTableAtCursor(
  adapt: CommandAdapt,
  config: IDynamicTableConfig
): void {
  const draw = (adapt as any).draw
  if (draw.isReadonly()) return

  const columns = config.columns ?? []
  const colCount = columns.length || 1
  const innerWidth = draw.getContextInnerWidth()
  const { defaultTrMinHeight } = draw.getOptions().table

  // 构建 colgroup
  const colgroup: IColgroup[] = []
  if (columns.length) {
    for (const col of columns) {
      colgroup.push({ width: col.width || innerWidth / colCount })
    }
  } else {
    const colWidth = innerWidth / colCount
    for (let c = 0; c < colCount; c++) {
      colgroup.push({ width: colWidth })
    }
  }

  // 构建 trList
  const trList: ITr[] = []
  if (config.showHeader && columns.length) {
    const headerTdList: ITd[] = []
    for (const col of columns) {
      headerTdList.push({
        colspan: 1,
        rowspan: 1,
        value: [{
          value: col.title || '',
          rowFlex: col.align as RowFlex
        }],
        backgroundColor: col.backgroundColor || undefined,
        disabled: true
      })
    }
    trList.push({
      height: defaultTrMinHeight,
      tdList: headerTdList
    })
  }

  // 构建表格元素
  const element: IElement = {
    type: ElementType.TABLE,
    value: '',
    colgroup,
    trList,
    borderType: (config.borderType as TableBorder) ?? TableBorder.ALL,
    borderColor: config.borderColor ?? '#000000',
    tableToolDisabled: true,
    extension: JSON.parse(JSON.stringify(config)) as any
  }

  // 格式化并插入
  const range = (adapt as any).range
  const { startIndex, endIndex } = range.getRange()
  const elementList = draw.getOriginalElementList()

  formatElementList([element], { editorOptions: draw.getOptions() })
  formatElementContext(elementList, [element], startIndex, {
    editorOptions: draw.getOptions()
  })

  const curIndex = startIndex + 1
  draw.spliceElementList(
    elementList,
    curIndex,
    startIndex === endIndex ? 0 : endIndex - startIndex,
    [element]
  )
  range.setRange(curIndex, curIndex)
  draw.render({ curIndex, isSetCursor: false })
}

/**
 * 重建动态表格的所有数据行。
 * 保留表头行（若 showHeader 且 trList[0] 存在），
 * 根据 dataArray 逐项构建新数据行，每列取值 item[col.field]。
 * 数据行单元格设为 disabled=true（只读）。不提交历史记录。
 */
export function rebuildDynamicTableDataRows(
  adapt: CommandAdapt,
  elementIndex: number,
  config: IDynamicTableConfig,
  dataArray: any[]
): void {
  const draw = (adapt as any).draw
  const originalElementList = draw.getOriginalElementList() as any[]
  const element = originalElementList[elementIndex]
  if (!element || element.type !== ElementType.TABLE) return

  const columns = config.columns ?? []
  const { defaultTrMinHeight } = draw.getOptions().table

  // 构建新的 trList
  const newTrList: ITr[] = []

  // 保留表头行
  const hasHeader = !!(config.showHeader && element.trList && element.trList.length > 0)
  if (hasHeader) {
    newTrList.push(element.trList[0])
  }

  // 根据数据数组构建数据行
  if (dataArray.length && columns.length) {
    for (const item of dataArray) {
      const tdList: ITd[] = []
      for (const col of columns) {
        const rawValue = item != null ? item[col.field] : undefined
        const textValue = rawValue != null ? String(rawValue) : ''
        const valueElement: IElement = {
          value: textValue,
          rowFlex: col.align as RowFlex
        }
        if (col.color && col.color !== '#000000') {
          valueElement.color = col.color
        }
        tdList.push({
          colspan: 1,
          rowspan: 1,
          value: [valueElement],
          backgroundColor: (col.backgroundColor && col.backgroundColor !== '#ffffff')
            ? col.backgroundColor
            : undefined,
          disabled: true
        })
      }
      newTrList.push({
        height: defaultTrMinHeight,
        tdList
      })
    }
  }

  // 更新 colgroup 以匹配列配置
  if (columns.length) {
    const newColgroup: IColgroup[] = columns.map(col => ({
      width: col.width || 80
    }))
    element.colgroup = newColgroup
  }

  // 格式化每个 td 的 value 元素
  const editorOptions = draw.getOptions()
  for (const tr of newTrList) {
    for (const td of tr.tdList) {
      if (td.value && td.value.length) {
        formatElementList(td.value as IElement[], { editorOptions })
      }
    }
  }

  // 替换 trList
  element.trList = newTrList

  // 重绘，不提交历史
  draw.render({ isSubmitHistory: false, isSetCursor: false })
}

/**
 * 扫描所有区域（正文、页眉、页脚）的元素列表，
 * 收集所有配置了动态表格（extension.columns && extension.dataSourcePath）的 TABLE 元素。
 * 返回元素索引、配置和当前行数。
 */
export function getAllDynamicTables(
  adapt: CommandAdapt
): { elementIndex: number; config: IDynamicTableConfig; currentRowCount: number }[] {
  const draw = (adapt as any).draw
  const result: { elementIndex: number; config: IDynamicTableConfig; currentRowCount: number }[] = []

  const searchIn = (elementList: any[], offset: number) => {
    for (let i = 0; i < elementList.length; i++) {
      const el = elementList[i]
      if (el.type !== ElementType.TABLE) continue
      const ext = el.extension as any
      if (!ext?.columns || !ext?.dataSourcePath) continue
      result.push({
        elementIndex: offset + i,
        config: ext as IDynamicTableConfig,
        currentRowCount: (el.trList as ITr[])?.length ?? 0
      })
    }
  }

  // 正文区域从索引 0 开始
  searchIn(draw.getOriginalMainElementList() || draw.getOriginalElementList(), 0)

  // 页眉区域
  const headerList = draw.getHeaderElementList()
  if (headerList?.length) {
    const mainLen = (draw.getOriginalMainElementList() || draw.getOriginalElementList()).length
    searchIn(headerList, mainLen)
  }

  // 页脚区域
  const footerList = draw.getFooterElementList()
  if (footerList?.length) {
    const mainLen = (draw.getOriginalMainElementList() || draw.getOriginalElementList()).length
    const headerLen = headerList?.length ?? 0
    searchIn(footerList, mainLen + headerLen)
  }

  return result
}

/* ---------- 扩展方法实现 ---------- */

export function setTableAttr(
  adapt: CommandAdapt,
  payload: ITableAttrOption
): void {
  const draw = (adapt as any).draw
  const position = (adapt as any).position
  const range = (adapt as any).range

  if (draw.isReadonly()) return
  const positionContext: IPositionContext = position.getPositionContext()
  if (!positionContext.isTable) return
  const { index } = positionContext

  const originalElementList = draw.getOriginalElementList()
  const element = originalElementList[index!]
  element.code = payload.code ?? element.code
  element.visibleExpression = payload.visibleExpression ?? element.visibleExpression
  element.printVisibleExpression = payload.printVisibleExpression ?? element.printVisibleExpression

  const { endIndex } = range.getRange()
  draw.render({ curIndex: endIndex })
}

export function setTableRowAttr(
  adapt: CommandAdapt,
  payload: ITableAttrOption
): void {
  const draw = (adapt as any).draw
  const position = (adapt as any).position
  const range = (adapt as any).range

  if (draw.isReadonly()) return
  const positionContext: IPositionContext = position.getPositionContext()
  if (!positionContext.isTable) return
  const { index, trIndex } = positionContext

  const originalElementList = draw.getOriginalElementList()
  const element = originalElementList[index!]
  const curTr = element.trList![trIndex!]
  curTr.attr = payload

  const { endIndex } = range.getRange()
  draw.render({ curIndex: endIndex })
}

export function setTableColAttr(
  adapt: CommandAdapt,
  payload: ITableColAttrOption
): void {
  const draw = (adapt as any).draw
  const position = (adapt as any).position
  const range = (adapt as any).range

  if (draw.isReadonly()) return
  const positionContext: IPositionContext = position.getPositionContext()
  if (!positionContext.isTable) return
  const { index, trIndex, tdIndex } = positionContext

  const originalElementList = draw.getOriginalElementList()
  const element = originalElementList[index!]
  const curTr = element.trList![trIndex!]
  const curTd = curTr.tdList[tdIndex!]
  // 数据源字段、值路径直接写入单元格属性
  curTd.field = payload.field ?? curTd.field
  curTd.valuePath = payload.valuePath ?? curTd.valuePath

  const { endIndex } = range.getRange()
  // 水平对齐：写入每个内容元素的 rowFlex
  if (payload.horizontalAlign) {
    if (curTd.value && curTd.value.length) {
      for (let i = 0; i < curTd.value.length; i++) {
        curTd.value[i].rowFlex = payload.horizontalAlign as RowFlex
      }
    } else {
      curTd.value.push({ value: '', rowFlex: payload.horizontalAlign as RowFlex })
    }
  }
  // 垂直对齐：写入 td.verticalAlign（枚举值 top/middle/bottom）
  if (payload.verticalAlign) {
    curTd.verticalAlign = payload.verticalAlign as VerticalAlign
  }
  // 背景色
  if (payload.backgroundColor !== undefined) {
    curTd.backgroundColor = payload.backgroundColor || undefined
  }
  // 禁止编辑
  if (payload.disabled !== undefined) {
    curTd.disabled = payload.disabled
  }
  draw.render({ curIndex: endIndex })
}

export function setShowCellNumber(
  adapt: CommandAdapt,
  show: boolean
): void {
  const draw = (adapt as any).draw
  if (draw.isReadonly()) return
  // 直接更新 showCellNumber，保留其他已设置的 table 选项
  draw.options.table.showCellNumber = show
  // 在当前光标位置触发重绘
  const range = (adapt as any).range
  const { endIndex } = range.getRange()
  draw.render({ curIndex: endIndex })
}

/* ---------- 读取方法 ---------- */

export function getTableAttr(adapt: CommandAdapt): ITableAttrOption | null {
  const draw = (adapt as any).draw
  const position = (adapt as any).position
  const positionContext: IPositionContext = position.getPositionContext()
  if (!positionContext.isTable) return null
  const { index } = positionContext
  const element = draw.getOriginalElementList()[index!]
  return {
    code: element.code ?? '',
    visibleExpression: element.visibleExpression ?? '',
    printVisibleExpression: element.printVisibleExpression ?? '',
  }
}

export function getTableRowAttr(adapt: CommandAdapt): any {
  const draw = (adapt as any).draw
  const position = (adapt as any).position
  const positionContext: IPositionContext = position.getPositionContext()
  if (!positionContext.isTable) return null
  const { index, trIndex } = positionContext
  const element = draw.getOriginalElementList()[index!]
  return element.trList![trIndex!].attr ?? null
}

export function getTableColAttr(adapt: CommandAdapt): ITableColAttrOption {
  const draw = (adapt as any).draw
  const position = (adapt as any).position
  const positionContext: IPositionContext = position.getPositionContext()
  const defaultAttr: ITableColAttrOption = { horizontalAlign: 'left', verticalAlign: 'top', backgroundColor: '', disabled: false }
  if (!positionContext.isTable) return defaultAttr
  const { index, trIndex, tdIndex } = positionContext
  const element = draw.getOriginalElementList()[index!]
  const curTd = element.trList![trIndex!].tdList[tdIndex!]
  return {
    horizontalAlign: (curTd.value?.[0] as any)?.rowFlex || 'left',
    verticalAlign: curTd.verticalAlign || 'top',
    backgroundColor: curTd.backgroundColor ?? '',
    disabled: curTd.disabled ?? false,
    field: curTd.field ?? '',
    valuePath: curTd.valuePath ?? '',
  }
}

/* ---------- 表格单元格数据绑定支持 ---------- */

/**
 * 获取单元格文本内容（IElement[] → 字符串拼接）。
 * 去除零宽字符（零宽空格、零宽连字等），避免表达式求值时 Number() 返回 NaN。
 */
function getTdTextContent(td: ITd): string {
  const raw = td.value?.length
    ? td.value.map(el => String(el.value ?? '')).join('')
    : ''
  // 零宽字符在 canvas-editor 中用于光标占位，不属于业务数据
  return raw.replace(new RegExp('[\\u200B-\\u200D\\uFEFF\\u200E\\u200F]', 'g'), '')
}

/**
 * 扫描所有表格，收集所有配置了 valuePath 的单元格位置与当前文本。
 * 用于 emr-editor 层执行 valuePath 表达式绑定（读方向）。
 * 返回 flat 列表，每项携带 elementIndex / trIndex / tdIndex 三坐标。
 */
export function getAllTableCellsWithValuePath(
  adapt: CommandAdapt
): { elementIndex: number; trIndex: number; tdIndex: number; valuePath: string; field: string; tableField: string; currentText: string }[] {
  const draw = (adapt as any).draw
  const originalElementList = draw.getOriginalElementList() as any[]
  const result: { elementIndex: number; trIndex: number; tdIndex: number; valuePath: string; field: string; tableField: string; currentText: string }[] = []

  for (let elIdx = 0; elIdx < originalElementList.length; elIdx++) {
    const el = originalElementList[elIdx]
    const trList = el.trList as ITr[] | undefined
    if (!trList?.length) continue
    for (let trIdx = 0; trIdx < trList.length; trIdx++) {
      const tdList = trList[trIdx].tdList
      if (!tdList?.length) continue
      for (let tdIdx = 0; tdIdx < tdList.length; tdIdx++) {
        const td = tdList[tdIdx]
        if (!td.valuePath) continue
        result.push({
          elementIndex: elIdx,
          trIndex: trIdx,
          tdIndex: tdIdx,
          valuePath: td.valuePath,
          field: td.field ?? '',
          tableField: (el.extension as any)?.field || `_table_${elIdx}`,
          currentText: getTdTextContent(td),
        })
      }
    }
  }
  return result
}

/**
 * 扫描所有表格，收集配置了可见性表达式的表格信息。
 * 用于 emr-editor 层根据数据源计算表格的 hide 状态。
 * 表达式来自表格元素的 extension.visibleExpression / extension.printVisibleExpression。
 */
export function getAllTablesVisibilityInfo(
  adapt: CommandAdapt
): { id: string; visibleExpression: string; printVisibleExpression: string; hide: boolean }[] {
  const draw = (adapt as any).draw
  const originalElementList = draw.getOriginalElementList() as any[]
  const result: { id: string; visibleExpression: string; printVisibleExpression: string; hide: boolean }[] = []

  for (let elIdx = 0; elIdx < originalElementList.length; elIdx++) {
    const el = originalElementList[elIdx]
    const trList = el.trList as ITr[] | undefined
    if (!trList?.length) continue
    const ext = el.extension ?? ({} as any)
    const visibleExpression: string = ext.visibleExpression ?? ''
    const printVisibleExpression: string = ext.printVisibleExpression ?? ''
    if (!visibleExpression && !printVisibleExpression) continue
    result.push({ id: el.id, visibleExpression, printVisibleExpression, hide: !!el.hide })
  }
  return result
}

/**
 * 批量设置表格元素的 hide 属性（不提交历史），然后统一重绘一次。
 * 用于数据源变化时同步更新表格可见性。
 */
export function setTableHideList(
  adapt: CommandAdapt,
  payload: { id: string; hide: boolean }[]
): void {
  if (!payload.length) return
  const draw = (adapt as any).draw
  let isExistUpdate = false

  const searchIn = (elementList: any[]) => {
    for (let i = 0; i < elementList.length; i++) {
      const el = elementList[i]
      const trList = el.trList as ITr[] | undefined
      if (!trList?.length) continue
      const item = payload.find(p => p.id === el.id)
      if (!item) continue
      if (el.hide !== item.hide) {
        el.hide = item.hide
        isExistUpdate = true
      }
    }
  }

  const data = [
    draw.getOriginalMainElementList(),
    draw.getHeaderElementList(),
    draw.getFooterElementList()
  ]
  for (const elementList of data) {
    searchIn(elementList)
  }

  if (isExistUpdate) {
    draw.render({ isSubmitHistory: false, isSetCursor: false })
  }
}

/**
 * 批量设置表格单元格文本（valuePath 公式回写），统一重绘一次。
 */
export interface ITableCellTextUpdate {
  elementIndex: number
  trIndex: number
  tdIndex: number
  text: string
}

function applyTableCellTextUpdates(
  adapt: CommandAdapt,
  updates: ITableCellTextUpdate[]
): void {
  if (!updates.length) return
  const draw = (adapt as any).draw
  const range = (adapt as any).range
  const originalElementList = draw.getOriginalElementList() as any[]
  const extraTableCells: Array<{
    elementIndex: number
    trIndex: number
    tdIndex: number
  }> = []

  for (let i = 0; i < updates.length; i++) {
    const { elementIndex, trIndex, tdIndex, text } = updates[i]
    const td = originalElementList[elementIndex]?.trList?.[trIndex]?.tdList?.[
      tdIndex
    ]
    if (!td) continue
    const rowFlex = td.value?.[0]?.rowFlex
    td.value = [{ value: text, rowFlex }]
    extraTableCells.push({ elementIndex, trIndex, tdIndex })
  }

  if (!extraTableCells.length) return
  const { endIndex } = range.getRange()
  draw.render({
    curIndex: endIndex >= 0 ? endIndex : 0,
    isSubmitHistory: false,
    isSetCursor: false,
    extraTableCells
  })
}

/**
 * 按三坐标设置指定表格单元格的文本内容，覆盖原有内容并触发重绘。
 * 用于 emr-editor 层执行 valuePath 表达式绑定后将结果写入单元格。
 */
export function setTableCellTextContent(
  adapt: CommandAdapt,
  elementIndex: number,
  trIndex: number,
  tdIndex: number,
  text: string
): void {
  applyTableCellTextUpdates(adapt, [
    { elementIndex, trIndex, tdIndex, text }
  ])
}

/**
 * 批量设置表格单元格文本，仅重绘一次（性能优化）。
 */
export function setTableCellTextContentBatch(
  adapt: CommandAdapt,
  updates: ITableCellTextUpdate[]
): void {
  applyTableCellTextUpdates(adapt, updates)
}

/**
 * 按三坐标读取指定表格单元格的文本内容。
 */
export function getTableCellTextContent(
  adapt: CommandAdapt,
  elementIndex: number,
  trIndex: number,
  tdIndex: number
): string {
  const draw = (adapt as any).draw
  const originalElementList = draw.getOriginalElementList() as any[]
  const td = originalElementList[elementIndex]?.trList?.[trIndex]?.tdList?.[tdIndex]
  if (!td) return ''
  return getTdTextContent(td)
}

/**
 * 按三坐标读取指定表格单元格的 field（数据源写回路径）。
 * 返回空字符串表示未配置写回。
 */
export function getTableCellField(
  adapt: CommandAdapt,
  elementIndex: number,
  trIndex: number,
  tdIndex: number
): string {
  const draw = (adapt as any).draw
  const originalElementList = draw.getOriginalElementList() as any[]
  const td = originalElementList[elementIndex]?.trList?.[trIndex]?.tdList?.[tdIndex]
  return td?.field ?? ''
}

/**
 * 按 elementIndex 读取表格元素的 extension.field（表级数据源字段名）。
 * 用于 emr-editor 层在 per-cell field 为空时自动推导写回路径。
 * 返回空字符串表示未配置表级字段。
 */
export function getTableFieldByIndex(
  adapt: CommandAdapt,
  elementIndex: number
): string {
  const draw = (adapt as any).draw
  const originalElementList = draw.getOriginalElementList() as any[]
  const el = originalElementList[elementIndex]
  if (!el) return ''
  const ext = el.extension as any
  return ext?.field ?? ''
}

/* ---------- 表单控件按 field 赋值 ---------- */

/** field → 控件值，value 类型与 executeSetControlValue 一致 */
export type ISetControlValueByFieldOption = Record<
  string,
  string | IElement[] | null
>

/**
 * 按 extension.field 批量设置表单控件值。
 * 同一 field 可能对应多个 IElement（控件展开后），取首个 controlId。
 */
export function setControlValueByField(
  adapt: CommandAdapt,
  payload: ISetControlValueByFieldOption,
  options?: { isSubmitHistory?: boolean }
): void {
  const fields = Object.keys(payload)
  if (!fields.length) return

  const controlList = adapt.getControlList()
  const fieldToControlId = new Map<string, string>()
  for (const el of controlList) {
    const field = (el.control?.extension as { field?: string } | undefined)?.field
    if (field && !fieldToControlId.has(field) && el.controlId) {
      fieldToControlId.set(field, el.controlId)
    }
  }

  const { isSubmitHistory = true } = options ?? {}
  const valuePayload: ISetControlValueOption[] = []
  for (const field of fields) {
    const controlId = fieldToControlId.get(field)
    if (!controlId) continue
    valuePayload.push({
      id: controlId,
      value: payload[field],
      isSubmitHistory
    })
  }

  if (!valuePayload.length) return
  adapt.setControlValueList(valuePayload)
}

/* ---------- 注册入口 ---------- */

export interface CommandAdaptExtend {
  setTableAttr: (payload: ITableAttrOption) => void
  setTableRowAttr: (payload: ITableAttrOption) => void
  setTableColAttr: (payload: ITableColAttrOption) => void
  getTableAttr: () => ITableAttrOption | null
  getTableRowAttr: () => any
  getTableColAttr: () => ITableColAttrOption
  setShowCellNumber: (show: boolean) => void
  /** 扫描所有表格，收集含 valuePath 的单元格位置与当前文本 */
  getAllTableCellsWithValuePath: () => { elementIndex: number; trIndex: number; tdIndex: number; valuePath: string; field: string; tableField: string; currentText: string }[]
  /** 按三坐标设置指定表格单元格文本内容并重绘 */
  setTableCellTextContent: (elementIndex: number, trIndex: number, tdIndex: number, text: string) => void
  /** 批量设置表格单元格文本，统一重绘一次 */
  setTableCellTextContentBatch: (updates: ITableCellTextUpdate[]) => void
  /** 按三坐标读取指定表格单元格文本内容 */
  getTableCellTextContent: (elementIndex: number, trIndex: number, tdIndex: number) => string
  /** 按三坐标读取指定表格单元格 field（写回路径） */
  getTableCellField: (elementIndex: number, trIndex: number, tdIndex: number) => string
  /** 按 elementIndex 读取表格元素的 extension.field（表级数据源字段名） */
  getTableFieldByIndex: (elementIndex: number) => string
  /** 扫描所有表格，收集配置了可见性表达式的表格信息 */
  getAllTablesVisibilityInfo: () => { id: string; visibleExpression: string; printVisibleExpression: string; hide: boolean }[]
  /** 批量设置表格元素的 hide 属性（不提交历史），然后统一重绘一次 */
  setTableHideList: (payload: { id: string; hide: boolean }[]) => void
  /** 在光标位置插入一个动态表格 */
  insertDynamicTableAtCursor: (config: IDynamicTableConfig) => void
  /** 重建动态表格的所有数据行（不提交历史） */
  rebuildDynamicTableDataRows: (elementIndex: number, config: IDynamicTableConfig, dataArray: any[]) => void
  /** 扫描所有区域，收集所有动态表格的信息 */
  getAllDynamicTables: () => { elementIndex: number; config: IDynamicTableConfig; currentRowCount: number }[]
  /** 按 extension.field 批量设置表单控件值 */
  setControlValueByField: (
    payload: ISetControlValueByFieldOption,
    options?: { isSubmitHistory?: boolean }
  ) => void
}

export function registerExtend(adapt: CommandAdapt): CommandAdaptExtend {
  return {
    setTableAttr: setTableAttr.bind(null, adapt),
    setTableRowAttr: setTableRowAttr.bind(null, adapt),
    setTableColAttr: setTableColAttr.bind(null, adapt),
    getTableAttr: getTableAttr.bind(null, adapt),
    getTableRowAttr: getTableRowAttr.bind(null, adapt),
    getTableColAttr: getTableColAttr.bind(null, adapt),
    setShowCellNumber: setShowCellNumber.bind(null, adapt),
    getAllTableCellsWithValuePath: getAllTableCellsWithValuePath.bind(null, adapt),
    setTableCellTextContent: setTableCellTextContent.bind(null, adapt),
    setTableCellTextContentBatch: setTableCellTextContentBatch.bind(null, adapt),
    getTableCellTextContent: getTableCellTextContent.bind(null, adapt),
    getTableCellField: getTableCellField.bind(null, adapt),
    getTableFieldByIndex: getTableFieldByIndex.bind(null, adapt),
    getAllTablesVisibilityInfo: getAllTablesVisibilityInfo.bind(null, adapt),
    setTableHideList: setTableHideList.bind(null, adapt),
    insertDynamicTableAtCursor: insertDynamicTableAtCursor.bind(null, adapt),
    rebuildDynamicTableDataRows: rebuildDynamicTableDataRows.bind(null, adapt),
    getAllDynamicTables: getAllDynamicTables.bind(null, adapt),
    setControlValueByField: setControlValueByField.bind(null, adapt),
  }
}
