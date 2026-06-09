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
  element.attr = payload

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
  // 存储原始属性，供下次打开时回填
  curTd.attr = { ...payload }

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

/* ---------- 读取方法 ---------- */

export function getTableAttr(adapt: CommandAdapt): ITableAttrOption | null {
  const draw = (adapt as any).draw
  const position = (adapt as any).position
  const positionContext: IPositionContext = position.getPositionContext()
  if (!positionContext.isTable) return null
  const { index } = positionContext
  const element = draw.getOriginalElementList()[index!]
  return element.attr ?? null
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
  // 优先读已保存的attr，次选从td实际渲染状态中提取
  const savedAttr = (curTd as any).attr as ITableColAttrOption | undefined
  return {
    horizontalAlign: savedAttr?.horizontalAlign || (curTd.value?.[0] as any)?.rowFlex || 'left',
    verticalAlign: savedAttr?.verticalAlign || curTd.verticalAlign || 'top',
    backgroundColor: savedAttr?.backgroundColor ?? curTd.backgroundColor ?? '',
    disabled: savedAttr?.disabled ?? curTd.disabled ?? false,
  }
}

/* ---------- 注册入口 ---------- */

export interface CommandAdaptExtend {
  setTableAttr: (payload: ITableAttrOption) => void
  setTableRowAttr: (payload: ITableAttrOption) => void
  setTableColAttr: (payload: ITableColAttrOption) => void
  getTableAttr: () => ITableAttrOption | null
  getTableRowAttr: () => any
  getTableColAttr: () => ITableColAttrOption
}

export function registerExtend(adapt: CommandAdapt): CommandAdaptExtend {
  return {
    setTableAttr: setTableAttr.bind(null, adapt),
    setTableRowAttr: setTableRowAttr.bind(null, adapt),
    setTableColAttr: setTableColAttr.bind(null, adapt),
    getTableAttr: getTableAttr.bind(null, adapt),
    getTableRowAttr: getTableRowAttr.bind(null, adapt),
    getTableColAttr: getTableColAttr.bind(null, adapt)
  }
}
