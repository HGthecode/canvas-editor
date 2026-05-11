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
  padding?: number[]
  horizontalAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'center' | 'bottom'
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
  curTd.attr = payload

  const { endIndex } = range.getRange()
  if (payload.horizontalAlign) {
    if (curTd.value && curTd.value.length) {
      for (let i = 0; i < curTd.value.length; i++) {
        curTd.value[i].rowFlex = payload.horizontalAlign as RowFlex
      }
    } else {
      curTd.value.push({ value: '', rowFlex: payload.horizontalAlign as RowFlex })
    }
  }
  if (payload.verticalAlign) {
    curTd.verticalAlign = payload.verticalAlign as VerticalAlign
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

export function getTableColAttr(adapt: CommandAdapt): any {
  const draw = (adapt as any).draw
  const position = (adapt as any).position
  const positionContext: IPositionContext = position.getPositionContext()
  if (!positionContext.isTable) return null
  const { index, trIndex, tdIndex } = positionContext
  const element = draw.getOriginalElementList()[index!]
  return element.trList![trIndex!].tdList[tdIndex!].attr ?? null
}

/* ---------- 注册入口 ---------- */

export interface CommandAdaptExtend {
  setTableAttr: (payload: ITableAttrOption) => void
  setTableRowAttr: (payload: ITableAttrOption) => void
  setTableColAttr: (payload: ITableColAttrOption) => void
  getTableAttr: () => ITableAttrOption | null
  getTableRowAttr: () => any
  getTableColAttr: () => any
}

export function registerExtend(adapt: CommandAdapt): CommandAdaptExtend {
  return {
    setTableAttr: setTableAttr.bind(null, adapt),
    setTableRowAttr: setTableRowAttr.bind(null, adapt),
    setTableColAttr: setTableColAttr.bind(null, adapt),
    getTableAttr: getTableAttr.bind(null, adapt),
    getTableRowAttr: getTableRowAttr.bind(null, adapt),
    getTableColAttr: getTableColAttr.bind(null, adapt),
  }
}
