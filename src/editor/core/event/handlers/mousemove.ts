import { ImageDisplay } from '../../../dataset/enum/Common'
import { ElementType } from '../../../dataset/enum/Element'
import { CanvasEvent } from '../CanvasEvent'

let currentHighlightControlId = ''
export function mousemove(evt: MouseEvent, host: CanvasEvent) {
  const draw = host.getDraw()
  
  // 是否是拖拽文字
  if (host.isAllowDrag) {
    // 是否允许拖拽到选区
    const x = evt.offsetX
    const y = evt.offsetY
    const { startIndex, endIndex } = host.cacheRange!
    const positionList = host.cachePositionList!
    for (let p = startIndex + 1; p <= endIndex; p++) {
      const {
        coordinate: { leftTop, rightBottom },
      } = positionList[p]
      if (x >= leftTop[0] && x <= rightBottom[0] && y >= leftTop[1] && y <= rightBottom[1]) {
        return
      }
    }
    const cacheStartIndex = host.cacheRange?.startIndex
    if (cacheStartIndex) {
      // 浮动元素拖拽调整位置
      const dragElement = host.cacheElementList![cacheStartIndex]
      if (
        dragElement?.type === ElementType.IMAGE &&
        (dragElement.imgDisplay === ImageDisplay.FLOAT_TOP ||
          dragElement.imgDisplay === ImageDisplay.FLOAT_BOTTOM)
      ) {
        draw.getPreviewer().clearResizer()
        draw.getImageParticle().dragFloatImage(evt.movementX, evt.movementY)
      }
    }
    host.dragover(evt)
    host.isAllowDrop = true
    return
  }
  
  const position = draw.getPosition()
  const positionResult = position.getPositionByXY({
    x: evt.offsetX,
    y: evt.offsetY,
  })
  // if (positionResult.isControl) {
  //   const control = draw.getControl()
  //   control.setControlRange()
  // }
  let isRender = false
  const control = draw.getControl()
  if (positionResult.isControl && positionResult.hitControl) {
    if (positionResult.hitControl.controlId && positionResult.hitControl.controlId !== currentHighlightControlId) {
      isRender=true
      control.drawHoverPopup(positionResult.hitControl)
      currentHighlightControlId = positionResult.hitControl.controlId
      control.setHighlightControl(positionResult)
    }
  }else if(currentHighlightControlId){
    currentHighlightControlId = ''
    control.clearHighlightControl()
    control.clearHoverPopup()
    isRender=true
  }
  //高亮表单控件
  // const elementList = draw.getOriginalElementList()
  // let isRender = false
  // const options = draw.getOptions()
  // const backgroundColor =
  //   options.control && options.control.backgroundColor ? options.control.backgroundColor : undefined
  // const hoverHighlightColor =
  //   options.control && options.control.hoverHighlightColor
  //     ? options.control.hoverHighlightColor
  //     : undefined
  // const control = draw.getControl()

  // if (positionResult.isControl) {
  //   const { index } = positionResult
  //   if (positionResult.isTable && elementList[index]) {
  //     const elementItem = elementList[index]
  //     const trIndex = positionResult.trIndex as number
  //     const tdIndex = positionResult.tdIndex as number

  //     // 表格处理
  //     const tr = elementItem.trList ? elementItem.trList[trIndex] : null
  //     const td = tr?.tdList[tdIndex]
  //     if (td?.value.length) {
  //       const tdValueIndex = positionResult.tdValueIndex as number
  //       const curElement = td?.value[tdValueIndex]
  //       // console.log(curElement, td?.value)

  //       for (let i = 0; i < td?.value.length; i++) {
  //         const item = td?.value[i]
  //         if (item.controlId === curElement.controlId) {
  //           item.backgroundColor = hoverHighlightColor
  //         } else if (item.controlId) {
  //           item.backgroundColor = backgroundColor
  //         }
  //       }
  //       currentHighlightControlId = curElement.controlId as string
  //       isRender = true
  //       // 显示提示文本
  //       control.drawHoverPopup(curElement)
  //     }
  //   } else {
  //     const curElement = elementList[index]
  //     if (curElement && curElement.controlId && curElement.controlId != currentHighlightControlId) {
  //       for (let i = 0; i < elementList.length; i++) {
  //         const item = elementList[i]
  //         if (item.controlId === curElement.controlId) {
  //           item.backgroundColor = hoverHighlightColor
  //         } else if (item.controlId) {
  //           if (
  //             item.control?.extension?.verifyRule?.require &&
  //             options.control.requireBackgroundColor
  //           ) {
  //             // 必填
  //             item.backgroundColor = options.control.requireBackgroundColor
  //           } else {
  //             item.backgroundColor = backgroundColor
  //           }
  //         }
  //       }
  //       currentHighlightControlId = curElement.controlId as string
  //       isRender = true
  //       // 显示提示文本
  //       control.drawHoverPopup(curElement)
  //     }
  //   }
  // } else if (currentHighlightControlId) {
  //   currentHighlightControlId = ''

  //   for (let i = 0; i < elementList.length; i++) {
  //     const item = elementList[i]
  //     if (item.controlId) {
  //       item.backgroundColor = backgroundColor
  //       if (
  //         item.control?.extension?.verifyRule?.require &&
  //         options.control.requireBackgroundColor
  //       ) {
  //         // 必填
  //         item.backgroundColor = options.control.requireBackgroundColor
  //       }
  //     } else if (item.type === ElementType.TABLE) {
  //       // 表格
  //       if (item.trList) {
  //         for (let i = 0; i < item.trList.length; i++) {
  //           const tr = item.trList[i]
  //           for (let j = 0; j < tr.tdList.length; j++) {
  //             const td = tr.tdList[j]
  //             if (td.value) {
  //               for (let v = 0; v < td.value.length; v++) {
  //                 const value = td.value[v]
  //                 if (value.controlId) {
  //                   if (
  //                     value.control?.extension?.verifyRule?.require &&
  //                     options.control.requireBackgroundColor
  //                   ) {
  //                     // 必填
  //                     value.backgroundColor = options.control.requireBackgroundColor
  //                   }
  //                   value.backgroundColor = backgroundColor
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  //   // }
  //   isRender = true
  //   control.clearHoverPopup()
  // }
  if (
    (!host.isAllowSelection || !host.mouseDownStartPosition || !~positionResult.index) &&
    isRender
  ) {
    draw.render({
      isSubmitHistory: false,
      isSetCursor: false,
      isCompute: false,
    })
  }
  //高亮表单控件 end

  if (!host.isAllowSelection || !host.mouseDownStartPosition) return
  const target = evt.target as HTMLDivElement
  const pageIndex = target.dataset.index
  // console.log(host.isAllowSelection, host.mouseDownStartPosition)
  // 设置pageNo
  if (pageIndex) {
    draw.setPageNo(Number(pageIndex))
  }
  // 结束位置
  // const position = draw.getPosition()
  // const positionResult = position.getPositionByXY({
  //   x: evt.offsetX,
  //   y: evt.offsetY,
  // })

  if (!~positionResult.index) return
  const { index, isTable, tdValueIndex, tdIndex, trIndex, tableId } = positionResult
  const {
    index: startIndex,
    isTable: startIsTable,
    tdIndex: startTdIndex,
    trIndex: startTrIndex,
    tableId: startTableId,
  } = host.mouseDownStartPosition
  const endIndex = isTable ? tdValueIndex! : index
  // 判断是否是表格跨行/列
  const rangeManager = draw.getRange()
  if (isTable && startIsTable && (tdIndex !== startTdIndex || trIndex !== startTrIndex)) {
    rangeManager.setRange(endIndex, endIndex, tableId, startTdIndex, tdIndex, startTrIndex, trIndex)
  } else {
    let end = ~endIndex ? endIndex : 0
    // 开始或结束位置存在表格，但是非相同表格则忽略选区设置
    if ((startIsTable || isTable) && startTableId !== tableId) return
    // 开始位置
    let start = startIndex
    if (start > end) {
      // prettier-ignore
      [start, end] = [end, start]
    }
    if (start === end) return
    rangeManager.setRange(start, end)
  }
  // 绘制
  draw.render({
    isSubmitHistory: false,
    isSetCursor: false,
    isCompute: false,
  })
}
