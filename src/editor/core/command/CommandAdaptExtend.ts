/**
 * 自定义扩展方法 —— 表格属性设置 + 数据源绑定
 *
 * 独立文件维护，便于合并上游 canvas-editor 时减少冲突。
 * 使用方式：CommandAdapt 构造函数末尾调用 registerExtend(this)
 */
import { RowFlex } from '../../dataset/enum/Row'
import { VerticalAlign } from '../../dataset/enum/VerticalAlign'
import { ElementType } from '../../dataset/enum/Element'
import { IPositionContext } from '../../interface/Position'
import type { IElement } from '../../interface/Element'
import type {
  IValueSet,
  ISetControlValueOption
} from '../../interface/Control'
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

/* ---------- 数据源绑定 ---------- */

/** 单个控件的数据源绑定结果，由上层（emr-editor）计算后传入 */
export interface IDataSourceBinding {
  /** 对应 control.extension.elementId */
  elementId: string
  /** 要设置的值；SELECT 控件对应 code，其他控件对应文本值 */
  value?: string | null
  /** SELECT/CHECKBOX/RADIO 控件的选项列表 */
  valueSets?: IValueSet[]
}

/**
 * 按 extension.elementId 批量更新控件的 valueSets 和 value，触发重绘。
 * 调用方须先通过路径解析计算好 bindings，此函数只负责找到元素并更新。
 */
export function setControlDataSourceBindings(
  adapt: CommandAdapt,
  bindings: IDataSourceBinding[]
): void {
  if (!bindings.length) return
  const draw = (adapt as any).draw
  const control = draw.getControl()

  // 三个区域的元素列表
  const zones: IElement[][] = [
    draw.getHeaderElementList(),
    draw.getOriginalMainElementList(),
    draw.getFooterElementList()
  ]

  // 构建 elementId → valueSets 映射，用于第二遍更新
  const valueSetsMap = new Map<string, IValueSet[]>()
  for (const b of bindings) {
    if (b.valueSets !== undefined) {
      valueSetsMap.set(b.elementId, b.valueSets)
    }
  }

  // elementId → controlId 映射，供 setValueListById 使用
  const elementIdToControlId = new Map<string, string>()

  /**
   * 第一遍：收集 elementId→controlId，同时直接更新匹配元素的 valueSets。
   * 注意：control 对象在同一 controlId 下的所有元素上各自独立存储，
   * 因此需要第二遍补全相同 controlId 下未被第一遍命中的元素。
   */
  const pass1 = (elementList: IElement[]) => {
    for (const el of elementList) {
      if (el.type === ElementType.TABLE && el.trList) {
        for (const tr of el.trList) {
          for (const td of tr.tdList) {
            pass1(td.value)
          }
        }
      }
      if (!el.control?.extension || !el.controlId) continue
      const ext = el.control.extension as Record<string, unknown>
      const elId = ext.elementId as string | undefined
      if (!elId) continue
      elementIdToControlId.set(elId, el.controlId)
      if (valueSetsMap.has(elId)) {
        el.control = { ...el.control, valueSets: valueSetsMap.get(elId) }
      }
    }
  }

  // controlId → valueSets 映射（用于第二遍补全）
  const controlIdToValueSets = new Map<string, IValueSet[]>()

  for (const zone of zones) {
    pass1(zone)
  }

  // 将收集结果转为 controlId→valueSets
  for (const [elId, vs] of valueSetsMap) {
    const cid = elementIdToControlId.get(elId)
    if (cid) controlIdToValueSets.set(cid, vs)
  }

  /**
   * 第二遍：补全同一 controlId 下其余元素（占位符/值文本元素）的 valueSets，
   * 确保 SelectControl.getText() 等方法访问到的都是最新选项。
   */
  const pass2 = (elementList: IElement[]) => {
    for (const el of elementList) {
      if (el.type === ElementType.TABLE && el.trList) {
        for (const tr of el.trList) {
          for (const td of tr.tdList) {
            pass2(td.value)
          }
        }
      }
      if (!el.controlId || !el.control) continue
      const newVs = controlIdToValueSets.get(el.controlId)
      if (newVs !== undefined && el.control.valueSets !== newVs) {
        el.control = { ...el.control, valueSets: newVs }
      }
    }
  }

  if (controlIdToValueSets.size > 0) {
    for (const zone of zones) {
      pass2(zone)
    }
  }

  // 构建 value 设置 payload（使用已收集的 controlId）
  const valuePayload: ISetControlValueOption[] = []
  for (const b of bindings) {
    if (b.value === undefined) continue
    const cid = elementIdToControlId.get(b.elementId)
    if (!cid) continue
    valuePayload.push({ id: cid, value: b.value, isSubmitHistory: false })
  }

  if (valuePayload.length) {
    // setValueListById 内部会调用 draw.render()
    control.setValueListById(valuePayload)
  } else if (controlIdToValueSets.size > 0) {
    // 仅更新了 valueSets，需手动触发重绘
    draw.render({ isSubmitHistory: false, isSetCursor: false })
  }
}

/* ---------- 注册入口 ---------- */

export interface CommandAdaptExtend {
  setTableAttr: (payload: ITableAttrOption) => void
  setTableRowAttr: (payload: ITableAttrOption) => void
  setTableColAttr: (payload: ITableColAttrOption) => void
  getTableAttr: () => ITableAttrOption | null
  getTableRowAttr: () => any
  getTableColAttr: () => any
  setControlDataSourceBindings: (bindings: IDataSourceBinding[]) => void
}

export function registerExtend(adapt: CommandAdapt): CommandAdaptExtend {
  return {
    setTableAttr: setTableAttr.bind(null, adapt),
    setTableRowAttr: setTableRowAttr.bind(null, adapt),
    setTableColAttr: setTableColAttr.bind(null, adapt),
    getTableAttr: getTableAttr.bind(null, adapt),
    getTableRowAttr: getTableRowAttr.bind(null, adapt),
    getTableColAttr: getTableColAttr.bind(null, adapt),
    setControlDataSourceBindings: setControlDataSourceBindings.bind(null, adapt)
  }
}
