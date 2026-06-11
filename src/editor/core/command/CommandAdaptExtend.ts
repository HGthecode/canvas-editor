/**
 * 自定义扩展方法 —— 表格属性设置
 *
 * 独立文件维护，便于合并上游 canvas-editor 时减少冲突。
 * 使用方式：CommandAdapt 构造函数末尾调用 registerExtend(this)
 */
import { RowFlex } from '../../dataset/enum/Row'
import { VerticalAlign } from '../../dataset/enum/VerticalAlign'
import { IPositionContext } from '../../interface/Position'
import type { CommandAdapt } from './CommandAdapt'
import type { ITd } from '../../interface/table/Td'
import type { ITr } from '../../interface/table/Tr'

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
): { elementIndex: number; trIndex: number; tdIndex: number; valuePath: string; field: string; currentText: string }[] {
  const draw = (adapt as any).draw
  const originalElementList = draw.getOriginalElementList() as any[]
  const result: { elementIndex: number; trIndex: number; tdIndex: number; valuePath: string; field: string; currentText: string }[] = []

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
  const draw = (adapt as any).draw
  const range = (adapt as any).range
  const originalElementList = draw.getOriginalElementList() as any[]
  const el = originalElementList[elementIndex]
  const td = el?.trList?.[trIndex]?.tdList?.[tdIndex]
  if (!td) return
  // 保留单元格属性（如 rowFlex），只替换文本内容
  const rowFlex = td.value?.[0]?.rowFlex
  td.value = [{ value: text, rowFlex }]
  const { endIndex } = range.getRange()
  draw.render({ curIndex: endIndex >= 0 ? endIndex : 0 })
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
  getAllTableCellsWithValuePath: () => { elementIndex: number; trIndex: number; tdIndex: number; valuePath: string; field: string; currentText: string }[]
  /** 按三坐标设置指定表格单元格文本内容并重绘 */
  setTableCellTextContent: (elementIndex: number, trIndex: number, tdIndex: number, text: string) => void
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
    getTableCellTextContent: getTableCellTextContent.bind(null, adapt),
    getTableCellField: getTableCellField.bind(null, adapt),
    getTableFieldByIndex: getTableFieldByIndex.bind(null, adapt),
    getAllTablesVisibilityInfo: getAllTablesVisibilityInfo.bind(null, adapt),
    setTableHideList: setTableHideList.bind(null, adapt),
  }
}
