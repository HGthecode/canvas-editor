import { ZERO } from '../../../dataset/constant/Common'
import { VIRTUAL_ELEMENT_TYPE } from '../../../dataset/constant/Element'
import { ElementType } from '../../../dataset/enum/Element'
import { IElement } from '../../../interface/Element'
import { IPasteOption } from '../../../interface/Event'
import { ITd } from '../../../interface/table/Td'
import { ITr } from '../../../interface/table/Tr'
import {
  getClipboardData,
  getIsClipboardContainFile,
  removeClipboardData
} from '../../../utils/clipboard'
import {
  formatElementContext,
  formatElementList,
  getElementListByHTML
} from '../../../utils/element'
import { CanvasEvent } from '../CanvasEvent'
import { IOverrideResult } from '../../override/Override'
import { deepClone, normalizeLineBreak } from '../../../utils'

/**
 * 按网格位置（rowIndex, colIndex）在目标表格中查找对应的 td
 * 考虑 colspan/rowspan 区间覆盖
 */
function findTdByGridPosition(
  trList: ITr[],
  targetRowIndex: number,
  targetColIndex: number
): { td: ITd; tr: ITr } | null {
  for (const tr of trList) {
    for (const td of tr.tdList) {
      const rowStart = td.rowIndex ?? -1
      const rowEnd = rowStart + (td.rowspan || 1) - 1
      const colStart = td.colIndex ?? -1
      const colEnd = colStart + (td.colspan || 1) - 1
      if (
        targetRowIndex >= rowStart && targetRowIndex <= rowEnd &&
        targetColIndex >= colStart && targetColIndex <= colEnd
      ) {
        return { td, tr }
      }
    }
  }
  return null
}

interface SourceCellInfo {
  td: ITd
  sourceRow: number
  sourceCol: number
}

/**
 * 遍历源 TABLE 的 trList/tdList，按视觉顺序返回单元格列表
 * 处理 colspan/rowspan 占位（压缩后 colIndex/rowIndex 丢失，需要重建）
 */
function getSourceCellsInVisualOrder(
  sourceTrList: ITr[]
): SourceCellInfo[] {
  const cells: SourceCellInfo[] = []
  if (!sourceTrList?.length) return cells
  // 记录被上方 rowspan 占用的列
  const occupiedCols: Map<number, Set<number>> = new Map()
  for (let r = 0; r < sourceTrList.length; r++) {
    const tr = sourceTrList[r]
    let colOffset = 0
    for (const td of tr.tdList) {
      // 跳过被上方 rowspan 占用的列
      const occupied = occupiedCols.get(r)
      if (occupied) {
        while (occupied.has(colOffset)) colOffset++
      }
      cells.push({ td, sourceRow: r, sourceCol: colOffset })
      // 标记后续行中这些列被占用
      if (td.rowspan > 1) {
        for (let sr = r + 1; sr < r + td.rowspan; sr++) {
          if (!occupiedCols.has(sr)) occupiedCols.set(sr, new Set())
          for (let sc = 0; sc < (td.colspan || 1); sc++) {
            occupiedCols.get(sr)!.add(colOffset + sc)
          }
        }
      }
      colOffset += td.colspan || 1
    }
  }
  return cells
}

/**
 * 多单元格粘贴：将源 TABLE 的每个单元格按网格位置映射到目标表格
 * 类似 Excel 的单元格填充行为
 */
function pasteTableCells(host: CanvasEvent, sourceTableElement: IElement) {
  const draw = host.getDraw()
  if (draw.isReadonly() || draw.isDisabled()) return

  const positionContext = draw.getPosition().getPositionContext()
  const { index, trIndex, tdIndex } = positionContext
  if (index === undefined || trIndex === undefined || tdIndex === undefined) return

  const originalElementList = draw.getOriginalElementList()
  const targetTable = originalElementList[index]
  const targetTrList = targetTable.trList
  if (!targetTrList?.length) return

  // 获取光标所在 td 的网格位置
  const cursorTd = targetTrList[trIndex].tdList[tdIndex]
  if (cursorTd.rowIndex === undefined || cursorTd.colIndex === undefined) return
  const cursorRowIndex = cursorTd.rowIndex
  const cursorColIndex = cursorTd.colIndex

  // 获取源单元格视觉顺序列表
  const sourceTrList = sourceTableElement.trList
  if (!sourceTrList?.length) return
  const sourceCells = getSourceCellsInVisualOrder(sourceTrList)
  if (!sourceCells.length) return

  // 逐单元格映射粘贴
  for (const { td: sourceTd, sourceRow, sourceCol } of sourceCells) {
    const targetRowIndex = cursorRowIndex + sourceRow
    const targetColIndex = cursorColIndex + sourceCol
    const target = findTdByGridPosition(targetTrList, targetRowIndex, targetColIndex)
    if (!target) break // 溢出时截断

    // 克隆源值
    const clonedValue = deepClone(sourceTd.value)
    if (!clonedValue.length) {
      // 空单元格设置一个零宽占位符
      target.td.value = [{ value: ZERO }]
      continue
    }

    // 格式化（处理列表/标题展开、首字符补偿等）
    formatElementList(clonedValue, {
      isHandleFirstElement: true,
      editorOptions: draw.getOptions()
    })

    // 更新表格/行/单元格 ID 以匹配目标
    for (const el of clonedValue) {
      el.tableId = targetTable.id
      el.trId = target.tr.id
      el.tdId = target.td.id
    }

    // 替换目标单元格内容
    target.td.value = clonedValue
  }

  // 渲染并提交历史
  draw.render({
    curIndex: cursorTd.value.length - 1,
    isSubmitHistory: true
  })
}

export function pasteElement(host: CanvasEvent, elementList: IElement[]) {
  const draw = host.getDraw()
  if (
    draw.isReadonly() ||
    draw.isDisabled() ||
    draw.getControl().getIsDisabledPasteControl()
  ) {
    return
  }
  // 检测表格到表格的粘贴：剪贴板为 TABLE 元素且光标在表格内
  if (elementList.length && elementList[0].type === ElementType.TABLE) {
    const positionContext = draw.getPosition().getPositionContext()
    if (positionContext.isTable) {
      const range = draw.getRange().getRange()
      // MVP 仅支持单单元格目标，跨行列选区不回退
      if (!range.isCrossRowCol) {
        pasteTableCells(host, elementList[0])
        return
      }
    }
  }
  const rangeManager = draw.getRange()
  const { startIndex } = rangeManager.getRange()
  const originalElementList = draw.getElementList()
  // 全选粘贴无需格式化上下文
  if (~startIndex && !rangeManager.getIsSelectAll()) {
    // 如果是复制到虚拟元素里，则粘贴列表的虚拟元素需扁平化处理，避免产生新的虚拟元素
    const anchorElement = originalElementList[startIndex]
    if (anchorElement?.titleId || anchorElement?.listId) {
      let start = 0
      while (start < elementList.length) {
        const pasteElement = elementList[start]
        if (anchorElement.titleId && /^\n/.test(pasteElement.value)) {
          break
        }
        if (VIRTUAL_ELEMENT_TYPE.includes(pasteElement.type!)) {
          elementList.splice(start, 1)
          if (pasteElement.valueList) {
            for (let v = 0; v < pasteElement.valueList.length; v++) {
              const element = pasteElement.valueList[v]
              if (element.value === ZERO || element.value === '\n') {
                continue
              }
              elementList.splice(start, 0, element)
              start++
            }
          }
          start--
        }
        start++
      }
    }
    formatElementContext(originalElementList, elementList, startIndex, {
      isBreakWhenWrap: true,
      editorOptions: draw.getOptions()
    })
  }
  draw.insertElementList(elementList)
}

export function pasteHTML(host: CanvasEvent, htmlText: string) {
  const draw = host.getDraw()
  if (draw.isReadonly() || draw.isDisabled()) return
  const elementList = getElementListByHTML(htmlText, {
    innerWidth: draw.getOriginalInnerWidth()
  })
  pasteElement(host, elementList)
}

export function pasteImage(host: CanvasEvent, file: File | Blob) {
  const draw = host.getDraw()
  if (draw.isReadonly() || draw.isDisabled()) return
  // 自定义粘贴图片事件
  const { pasteImage: overridePasteImage } = draw.getOverride()
  if (overridePasteImage) {
    const overrideResult = overridePasteImage(file)
    if ((<IOverrideResult>overrideResult)?.preventDefault !== false) return
  }
  const rangeManager = draw.getRange()
  const { startIndex } = rangeManager.getRange()
  const elementList = draw.getElementList()
  // 创建文件读取器
  const fileReader = new FileReader()
  fileReader.readAsDataURL(file)
  fileReader.onload = () => {
    // 计算宽高
    const image = new Image()
    const value = fileReader.result as string
    image.src = value
    image.onload = () => {
      const imageElement: IElement = {
        value,
        type: ElementType.IMAGE,
        width: image.width,
        height: image.height
      }
      if (~startIndex) {
        formatElementContext(elementList, [imageElement], startIndex, {
          editorOptions: draw.getOptions()
        })
      }
      draw.insertElementList([imageElement])
    }
  }
}

export function pasteByEvent(host: CanvasEvent, evt: ClipboardEvent) {
  const draw = host.getDraw()
  if (draw.isReadonly() || draw.isDisabled()) return
  const clipboardData = evt.clipboardData
  if (!clipboardData) return
  // 自定义粘贴事件
  const { paste } = draw.getOverride()
  if (paste) {
    const overrideResult = paste(evt)
    // 默认阻止默认事件
    if ((<IOverrideResult>overrideResult)?.preventDefault !== false) return
  }
  // 优先读取编辑器内部粘贴板数据（粘贴板不包含文件时）
  if (!getIsClipboardContainFile(clipboardData)) {
    const clipboardText = clipboardData.getData('text')
    const editorClipboardData = getClipboardData()
    // 不同系统间默认换行符不同 windows:\r\n mac:\n
    if (
      editorClipboardData &&
      normalizeLineBreak(clipboardText) ===
        normalizeLineBreak(editorClipboardData.text)
    ) {
      pasteElement(host, editorClipboardData.elementList)
      return
    }
  }
  removeClipboardData()
  // 从粘贴板提取数据
  let isHTML = false
  for (let i = 0; i < clipboardData.items.length; i++) {
    const item = clipboardData.items[i]
    if (item.type === 'text/html') {
      isHTML = true
      break
    }
  }
  for (let i = 0; i < clipboardData.items.length; i++) {
    const item = clipboardData.items[i]
    if (item.kind === 'string') {
      if (item.type === 'text/plain' && !isHTML) {
        item.getAsString(plainText => {
          host.input(plainText)
        })
        break
      }
      if (item.type === 'text/html' && isHTML) {
        item.getAsString(htmlText => {
          pasteHTML(host, htmlText)
        })
        break
      }
    } else if (item.kind === 'file') {
      if (item.type.includes('image')) {
        const file = item.getAsFile()
        if (file) {
          pasteImage(host, file)
        }
      }
    }
  }
}

export async function pasteByApi(host: CanvasEvent, options?: IPasteOption) {
  const draw = host.getDraw()
  if (draw.isReadonly() || draw.isDisabled()) return
  // 自定义粘贴事件
  const { paste } = draw.getOverride()
  if (paste) {
    const overrideResult = paste()
    // 默认阻止默认事件
    if ((<IOverrideResult>overrideResult)?.preventDefault !== false) return
  }
  // 优先读取编辑器内部粘贴板数据
  const clipboardText = await navigator.clipboard.readText()
  const editorClipboardData = getClipboardData()
  if (
    editorClipboardData &&
    normalizeLineBreak(clipboardText) ===
      normalizeLineBreak(editorClipboardData.text)
  ) {
    pasteElement(host, editorClipboardData.elementList)
    return
  }
  removeClipboardData()
  // 从内存粘贴板获取数据
  if (options?.isPlainText) {
    if (clipboardText) {
      host.input(clipboardText)
    }
  } else {
    const clipboardData = await navigator.clipboard.read()
    let isHTML = false
    for (const item of clipboardData) {
      if (item.types.includes('text/html')) {
        isHTML = true
        break
      }
    }
    for (const item of clipboardData) {
      if (item.types.includes('text/plain') && !isHTML) {
        const textBlob = await item.getType('text/plain')
        const text = await textBlob.text()
        if (text) {
          host.input(text)
        }
      } else if (item.types.includes('text/html') && isHTML) {
        const htmlTextBlob = await item.getType('text/html')
        const htmlText = await htmlTextBlob.text()
        if (htmlText) {
          pasteHTML(host, htmlText)
        }
      } else if (item.types.some(type => type.startsWith('image/'))) {
        const type = item.types.find(type => type.startsWith('image/'))!
        const imageBlob = await item.getType(type)
        pasteImage(host, imageBlob)
      }
    }
  }
}
