import { ControlComponent, ControlType } from '../../../dataset/enum/Control'
import { EditorZone } from '../../../dataset/enum/Editor'
import { ElementType } from '../../../dataset/enum/Element'
import { DeepRequired } from '../../../interface/Common'
import { EDITOR_PREFIX } from '../../../dataset/constant/Editor'
import {
  IControl,
  IControlContext,
  IControlHighlight,
  IControlInitOption,
  IControlInstance,
  IControlOption,
  IControlRuleOption,
  IGetControlList,
  IGetControlValueOption,
  IGetControlValueResult,
  ISetControlExtensionOption,
  ISetControlValueOption,
  IVerifyControlErrorResult,
  ISetControlValueByControlIdOption,
  VisibleExpressionResultByControlId,
} from '../../../interface/Control'
import { IEditorOption } from '../../../interface/Editor'
import { IElement, IElementPosition } from '../../../interface/Element'
import { EventBusMap } from '../../../interface/EventBus'
import { IRange } from '../../../interface/Range'
import { deepClone, nextTick, splitText } from '../../../utils'
import {
  formatElementContext,
  formatElementList,
  pickElementAttr,
  zipElementList,
} from '../../../utils/element'
import { EventBus } from '../../event/eventbus/EventBus'
import { Listener } from '../../listener/Listener'
import { RangeManager } from '../../range/RangeManager'
import { Draw } from '../Draw'
import { CheckboxControl } from './checkbox/CheckboxControl'
import { RadioControl } from './radio/RadioControl'
import { DateControl } from './date/DateControl'

import { ControlSearch } from './interactive/ControlSearch'
import { SelectControl } from './select/SelectControl'
import { TextControl } from './text/TextControl'
import dayjs from 'dayjs'

interface IMoveCursorResult {
  newIndex: number
  newElement: IElement
}
export class Control {
  private draw: Draw
  private range: RangeManager
  private listener: Listener
  private eventBus: EventBus<EventBusMap>
  private controlSearch: ControlSearch
  private options: DeepRequired<IEditorOption>
  private controlOptions: IControlOption
  private activeControl: IControlInstance | null

  private hoverPopupContainer: HTMLDivElement
  private hoverTextDom: HTMLDivElement
  private visibleExpressionResultByControlId: VisibleExpressionResultByControlId

  constructor(draw: Draw) {
    this.draw = draw
    this.range = draw.getRange()
    this.listener = draw.getListener()
    this.eventBus = draw.getEventBus()
    this.controlSearch = new ControlSearch(this)

    this.options = draw.getOptions()
    this.controlOptions = this.options.control
    this.activeControl = null

    const { hoverPopupContainer, hoverTextDom } = this._createHoverPopupDom()

    this.hoverPopupContainer = hoverPopupContainer
    this.hoverTextDom = hoverTextDom
    this.visibleExpressionResultByControlId = {}
  }

  // 搜索高亮匹配
  public setHighlightList(payload: IControlHighlight[]) {
    this.controlSearch.setHighlightList(payload)
  }

  public computeHighlightList() {
    const highlightList = this.controlSearch.getHighlightList()
    if (highlightList.length) {
      this.controlSearch.computeHighlightList()
    }
  }

  public renderHighlightList(ctx: CanvasRenderingContext2D, pageNo: number) {
    const highlightMatchResult = this.controlSearch.getHighlightMatchResult()
    if (highlightMatchResult.length) {
      this.controlSearch.renderHighlightList(ctx, pageNo)
    }
  }

  public getDraw(): Draw {
    return this.draw
  }

  // 过滤控件辅助元素（前后缀、背景提示）
  public filterAssistElement(elementList: IElement[]): IElement[] {
    const list: IElement[] = []
    for (let i = 0; i < elementList.length; i++) {
      const element = elementList[i]
      if (element.type === ElementType.TABLE) {
        const trList = element.trList!
        for (let r = 0; r < trList.length; r++) {
          const tr = trList[r]
          for (let d = 0; d < tr.tdList.length; d++) {
            const td = tr.tdList[d]
            td.value = this.filterAssistElement(td.value)
          }
        }
      }
      if (!element.controlId || element.control?.minWidth) {
        list.push(element)
      } else if (
        element.controlComponent !== ControlComponent.PREFIX &&
        element.controlComponent !== ControlComponent.POSTFIX &&
        element.controlComponent !== ControlComponent.PLACEHOLDER
      ) {
        element.backgroundColor = undefined
        list.push(element)
      }
    }
    return list
  }

  // 判断选区部分在控件边界外
  public isPartRangeInControlOutside(): boolean {
    const { startIndex, endIndex } = this.getRange()
    if (!~startIndex && !~endIndex) return false
    const elementList = this.getElementList()
    const startElement = elementList[startIndex]
    const endElement = elementList[endIndex]
    if (startElement.controlId && startElement.controlId !== endElement.controlId) {
      return true
    }
    return false
  }

  // 判断选区是否在后缀处
  public isRangInPostfix(): boolean {
    if (!this.activeControl) return false
    const { startIndex, endIndex } = this.getRange()
    if (startIndex !== endIndex) return false
    const elementList = this.getElementList()
    const element = elementList[startIndex]

    return element.controlComponent === ControlComponent.POSTFIX
  }

  // 判断选区是否在控件内
  public isRangeWithinControl(): boolean {
    const { startIndex, endIndex } = this.getRange()
    if (!~startIndex && !~endIndex) return false
    const elementList = this.getElementList()
    const startElement = elementList[startIndex]
    const endElement = elementList[endIndex]
    if (
      startElement &&
      startElement.controlId &&
      startElement.controlId === endElement.controlId &&
      endElement.controlComponent !== ControlComponent.POSTFIX
    ) {
      return true
    }
    return false
  }

  public isDisabledControl(): boolean {
    return !!this.activeControl?.getElement().control?.disabled
  }

  public getContainer(): HTMLDivElement {
    return this.draw.getContainer()
  }

  public getElementList(): IElement[] {
    return this.draw.getElementList()
  }

  public getPosition(): IElementPosition | null {
    const positionList = this.draw.getPosition().getPositionList()
    const { endIndex } = this.range.getRange()
    return positionList[endIndex] || null
  }

  public getPreY(): number {
    const height = this.draw.getHeight()
    const pageGap = this.draw.getPageGap()
    return this.draw.getPageNo() * (height + pageGap)
  }

  public getRange(): IRange {
    return this.range.getRange()
  }

  public shrinkBoundary() {
    this.range.shrinkBoundary()
  }

  public getActiveControl(): IControlInstance | null {
    return this.activeControl
  }

  public initControl() {
    const isReadonly = this.draw.isReadonly()
    if (isReadonly) return
    const elementList = this.getElementList()
    const range = this.getRange()
    const element = elementList[range.startIndex]

    // 判断控件是否已经激活
    if (this.activeControl) {
      // 列举控件唤醒下拉弹窗
      if (this.activeControl instanceof SelectControl) {
        this.activeControl.awake()
      }
      const controlElement = this.activeControl.getElement()
      if (element.controlId === controlElement.controlId) return
    }
    // 销毁旧激活控件
    this.destroyControl()
    // 激活控件
    const control = element.control!

    if (control.type === ControlType.TEXT) {
      this.activeControl = new TextControl(element, this)
    } else if (control.type === ControlType.SELECT) {
      const selectControl = new SelectControl(element, this)
      this.activeControl = selectControl
      selectControl.awake()
    } else if (control.type === ControlType.CHECKBOX) {
      this.activeControl = new CheckboxControl(element, this)
    } else if (control.type === ControlType.RADIO) {
      this.activeControl = new RadioControl(element, this)
    } else if (control.type === ControlType.DATE) {
      this.activeControl = new DateControl(element, this)
    }
    // 激活控件回调
    nextTick(() => {
      const controlChangeListener = this.listener.controlChange
      const isSubscribeControlChange = this.eventBus.isSubscribe('controlChange')
      if (!controlChangeListener && !isSubscribeControlChange) return
      let payload: IControl
      const value = this.activeControl?.getValue()
      if (value && value.length) {
        payload = zipElementList(value)[0].control!
      } else {
        payload = pickElementAttr(deepClone(element)).control!
      }
      if (controlChangeListener) {
        controlChangeListener(payload)
      }
      if (isSubscribeControlChange) {
        this.eventBus.emit('controlChange', payload)
      }
    })
  }

  public destroyControl() {
    if (this.activeControl) {
      if (this.activeControl instanceof SelectControl) {
        this.activeControl.destroy()
      }
      this.activeControl = null
      // 销毁控件回调
      nextTick(() => {
        const controlChangeListener = this.listener.controlChange
        const isSubscribeControlChange = this.eventBus.isSubscribe('controlChange')
        if (!controlChangeListener && !isSubscribeControlChange) return
        if (controlChangeListener) {
          controlChangeListener(null)
        }
        if (isSubscribeControlChange) {
          this.eventBus.emit('controlChange', null)
        }
      })
    }
  }

  public repaintControl(curIndex?: number) {
    if (curIndex === undefined) {
      this.range.clearRange()
      this.draw.render({
        isSetCursor: false,
      })
    } else {
      this.range.setRange(curIndex, curIndex)
      this.draw.render({
        curIndex,
      })
    }
  }

  public moveCursor(position: IControlInitOption): IMoveCursorResult {
    const { index, trIndex, tdIndex, tdValueIndex } = position
    let elementList = this.draw.getOriginalElementList()
    let element: IElement
    const newIndex = position.isTable ? tdValueIndex! : index
    if (position.isTable) {
      elementList = elementList[index!].trList![trIndex!].tdList[tdIndex!].value
      element = elementList[tdValueIndex!]
    } else {
      element = elementList[index]
    }

    if (element.controlComponent === ControlComponent.VALUE) {
      // VALUE-无需移动
      return {
        newIndex,
        newElement: element,
      }
    }
    //  else if (element.controlComponent === ControlComponent.UNIT) {
    //   // UNIT-移动到第一个单位文本前
    //   let startIndex = newIndex - 1
    //   while (startIndex > 0) {
    //     const preElement = elementList[startIndex]
    //     if (
    //       preElement.controlId !== element.controlId ||
    //       (preElement.controlComponent !== ControlComponent.UNIT &&
    //         preElement.controlComponent !== ControlComponent.PLACEHOLDER)
    //     ) {
    //       console.log('yid', startIndex)

    //       return {
    //         newIndex: startIndex,
    //         newElement: elementList[startIndex],
    //       }
    //     }
    //     startIndex--
    //   }
    // }
    else if (element.controlComponent === ControlComponent.POSTFIX) {
      // POSTFIX-移动到最后一个后缀字符后
      let startIndex = newIndex + 1
      while (startIndex < elementList.length) {
        const nextElement = elementList[startIndex]

        if (nextElement.controlId !== element.controlId) {
          return {
            newIndex: startIndex - 1,
            newElement: elementList[startIndex - 1],
          }
        }
        startIndex++
      }
    } else if (element.controlComponent === ControlComponent.PREFIX) {
      // PREFIX-移动到最后一个前缀或标签文本字符后
      let startIndex = newIndex + 1
      while (startIndex < elementList.length) {
        const nextElement = elementList[startIndex]
        if (
          nextElement.controlId !== element.controlId ||
          (nextElement.controlComponent !== ControlComponent.PREFIX &&
            nextElement.controlComponent !== ControlComponent.LABEL)
        ) {
          return {
            newIndex: startIndex - 1,
            newElement: elementList[startIndex - 1],
          }
        }
        startIndex++
      }
    } else if (element.controlComponent === ControlComponent.PLACEHOLDER) {
      // PLACEHOLDER-移动到第一个前缀或标签文本后

      let startIndex = newIndex - 1
      while (startIndex > 0) {
        const preElement = elementList[startIndex]
        if (
          preElement.controlId !== element.controlId ||
          preElement.controlComponent === ControlComponent.PREFIX ||
          preElement.controlComponent === ControlComponent.LABEL
        ) {
          return {
            newIndex: startIndex,
            newElement: elementList[startIndex],
          }
        }
        startIndex--
      }
    } else if (element.controlComponent === ControlComponent.UNIT) {
      // UNIT-移动到PLACEHOLDER或Value后
      let startIndex = newIndex - 1
      while (startIndex > 0) {
        const preElement = elementList[startIndex]
        if (
          preElement.controlId !== element.controlId ||
          preElement.controlComponent === ControlComponent.PLACEHOLDER ||
          preElement.controlComponent === ControlComponent.VALUE
        ) {
          return {
            newIndex: startIndex,
            newElement: elementList[startIndex],
          }
        }
        startIndex--
      }
    }

    return {
      newIndex,
      newElement: element,
    }
  }

  public removeControl(startIndex: number, context: IControlContext = {}): number | null {
    const elementList = context.elementList || this.getElementList()
    const startElement = elementList[startIndex]
    const { deletable = true } = startElement.control!
    if (!deletable) return null
    let leftIndex = -1
    let rightIndex = -1
    // 向左查找
    let preIndex = startIndex
    while (preIndex > 0) {
      const preElement = elementList[preIndex]
      if (preElement.controlId !== startElement.controlId) {
        leftIndex = preIndex
        break
      }
      preIndex--
    }
    // 向右查找
    let nextIndex = startIndex + 1
    while (nextIndex < elementList.length) {
      const nextElement = elementList[nextIndex]
      if (nextElement.controlId !== startElement.controlId) {
        rightIndex = nextIndex - 1
        break
      }
      nextIndex++
    }
    // 控件在最后
    if (nextIndex === elementList.length) {
      rightIndex = nextIndex - 1
    }
    if (!~leftIndex && !~rightIndex) return startIndex
    leftIndex = ~leftIndex ? leftIndex : 0
    // 删除元素
    this.draw.spliceElementList(elementList, leftIndex + 1, rightIndex - leftIndex)
    return leftIndex
  }

  public removePlaceholder(startIndex: number, context: IControlContext = {}) {
    const elementList = context.elementList || this.getElementList()
    const startElement = elementList[startIndex]
    const nextElement = elementList[startIndex + 1]
    if (
      startElement.controlComponent === ControlComponent.PLACEHOLDER ||
      nextElement.controlComponent === ControlComponent.PLACEHOLDER
    ) {
      let index = startIndex
      while (index < elementList.length) {
        const curElement = elementList[index]
        if (curElement.controlId !== startElement.controlId) break
        if (curElement.controlComponent === ControlComponent.PLACEHOLDER) {
          this.draw.spliceElementList(elementList, index, 1)
        } else {
          index++
        }
      }
    }
  }

  public addPlaceholder(startIndex: number, context: IControlContext = {}) {
    const elementList = context.elementList || this.getElementList()
    const startElement = elementList[startIndex]
    const control = startElement.control!
    if (!control.placeholder) return
    const placeholderStrList = splitText(control.placeholder)
    for (let p = 0; p < placeholderStrList.length; p++) {
      const value = placeholderStrList[p]
      const newElement: IElement = {
        value,
        controlId: startElement.controlId,
        type: ElementType.CONTROL,
        control: startElement.control,
        controlComponent: ControlComponent.PLACEHOLDER,
        color: this.controlOptions.placeholderColor,
      }
      formatElementContext(elementList, [newElement], startIndex)
      this.draw.spliceElementList(elementList, startIndex + p + 1, 0, newElement)
    }
  }

  public setValue(data: IElement[]): number {
    if (!this.activeControl) {
      throw new Error('active control is null')
    }
    return this.activeControl.setValue(data)
  }

  public keydown(evt: KeyboardEvent): number | null {
    if (!this.activeControl) {
      throw new Error('active control is null')
    }
    return this.activeControl.keydown(evt)
  }

  public cut(): number {
    if (!this.activeControl) {
      throw new Error('active control is null')
    }
    return this.activeControl.cut()
  }

  public getValueByConceptId(payload: IGetControlValueOption): IGetControlValueResult {
    const { conceptId } = payload
    const result: IGetControlValueResult = []
    const getValue = (elementList: IElement[], zone: EditorZone) => {
      let i = 0
      while (i < elementList.length) {
        const element = elementList[i]
        i++
        // 表格下钻处理
        if (element.type === ElementType.TABLE) {
          const trList = element.trList!
          for (let r = 0; r < trList.length; r++) {
            const tr = trList[r]
            for (let d = 0; d < tr.tdList.length; d++) {
              const td = tr.tdList[d]
              getValue(td.value, zone)
            }
          }
        }
        if (element?.control?.conceptId !== conceptId) continue
        const { type, code, valueSets } = element.control!
        let j = i
        let textControlValue = ''
        while (j < elementList.length) {
          const nextElement = elementList[j]
          if (nextElement.controlId !== element.controlId) break
          if (
            type === ControlType.TEXT &&
            nextElement.controlComponent === ControlComponent.VALUE
          ) {
            textControlValue += nextElement.value
          }
          j++
        }
        if (type === ControlType.TEXT) {
          result.push({
            ...element.control,
            zone,
            value: textControlValue || null,
            innerText: textControlValue || null,
          })
        } else if (
          type === ControlType.SELECT ||
          type === ControlType.CHECKBOX ||
          type === ControlType.RADIO
        ) {
          const innerText = code
            ?.split(',')
            .map((selectCode) => valueSets?.find((valueSet) => valueSet.code === selectCode)?.value)
            .filter(Boolean)
            .join('')
          result.push({
            ...element.control,
            zone,
            value: code || null,
            innerText: innerText || null,
          })
        }
        i = j
      }
    }
    const data = [
      {
        zone: EditorZone.HEADER,
        elementList: this.draw.getHeaderElementList(),
      },
      {
        zone: EditorZone.MAIN,
        elementList: this.draw.getOriginalMainElementList(),
      },
      {
        zone: EditorZone.FOOTER,
        elementList: this.draw.getFooterElementList(),
      },
    ]
    for (const { zone, elementList } of data) {
      getValue(elementList, zone)
    }
    return result
  }

  public setValueByConceptId(payload: ISetControlValueOption) {
    const isReadonly = this.draw.isReadonly()
    if (isReadonly) return
    let isExistSet = false
    const { conceptId, value } = payload
    // 设置值
    const setValue = (elementList: IElement[]) => {
      let i = 0
      while (i < elementList.length) {
        const element = elementList[i]
        i++
        // 表格下钻处理
        if (element.type === ElementType.TABLE) {
          const trList = element.trList!
          for (let r = 0; r < trList.length; r++) {
            const tr = trList[r]
            for (let d = 0; d < tr.tdList.length; d++) {
              const td = tr.tdList[d]
              setValue(td.value)
            }
          }
        }
        if (element?.control?.conceptId !== conceptId) continue
        isExistSet = true
        const { type } = element.control!
        // 当前控件结束索引
        let currentEndIndex = i
        while (currentEndIndex < elementList.length) {
          const nextElement = elementList[currentEndIndex]
          if (nextElement.controlId !== element.controlId) break
          currentEndIndex++
        }
        // 模拟光标选区上下文
        const fakeRange = {
          startIndex: i - 1,
          endIndex: currentEndIndex - 2,
        }
        const controlContext: IControlContext = {
          range: fakeRange,
          elementList,
        }
        const controlRule: IControlRuleOption = {
          isIgnoreDisabledRule: true,
        }
        if (type === ControlType.TEXT) {
          const formatValue = [{ value }]
          formatElementList(formatValue, {
            isHandleFirstElement: false,
            editorOptions: this.options,
            dataSource: this.draw.getDataSource(),
          })
          const text = new TextControl(element, this)
          if (value) {
            text.setValue(formatValue, controlContext, controlRule)
          } else {
            text.clearValue(controlContext, controlRule)
          }
        } else if (type === ControlType.SELECT) {
          const select = new SelectControl(element, this)
          if (value) {
            select.setSelect(value, controlContext, controlRule)
          } else {
            select.clearSelect(controlContext, controlRule)
          }
        } else if (type === ControlType.CHECKBOX) {
          const checkbox = new CheckboxControl(element, this)
          const checkboxElementList = elementList.slice(
            fakeRange.startIndex + 1,
            fakeRange.endIndex + 1,
          )
          const codes = value?.split(',') || []
          for (const checkElement of checkboxElementList) {
            if (checkElement.controlComponent === ControlComponent.CHECKBOX) {
              const checkboxItem = checkElement.checkbox!
              checkboxItem.value = codes.includes(checkboxItem.code!)
            }
          }
          checkbox.setSelect(codes, controlContext, controlRule)
        } else if (type === ControlType.RADIO) {
          const radio = new RadioControl(element, this)
          // const radioElementList = elementList.slice(
          //   fakeRange.startIndex + 1,
          //   fakeRange.endIndex + 1,
          // )
          // const codes = value?.split(',') || []
          // for (const radioElement of radioElementList) {
          //   if (radioElement.controlComponent === ControlComponent.RADIO) {
          //     const radioItem = radioElement.radio!
          //     radioItem.value = codes.includes(radioItem.code!)
          //   }
          // }
          radio.setSelect(controlContext)
        }
        // 修改后控件结束索引
        let newEndIndex = i
        while (newEndIndex < elementList.length) {
          const nextElement = elementList[newEndIndex]
          if (nextElement.controlId !== element.controlId) break
          newEndIndex++
        }
        i = newEndIndex
      }
    }
    // 页眉、内容区、页脚同时处理
    const data = [
      this.draw.getHeaderElementList(),
      this.draw.getOriginalMainElementList(),
      this.draw.getFooterElementList(),
    ]
    for (const elementList of data) {
      setValue(elementList)
    }
    if (isExistSet) {
      this.draw.render({
        isSetCursor: false,
      })
    }
  }

  public setValueByControlId(payload: ISetControlValueByControlIdOption) {
    const isReadonly = this.draw.isReadonly()
    if (isReadonly) return
    // let isExistSet = false
    const { controlId, value } = payload
    // 设置值
    const setValue = (elementList: IElement[]) => {
      let i = 0
      while (i < elementList.length) {
        const element = elementList[i]
        i++
        // 表格下钻处理
        if (element.type === ElementType.TABLE) {
          const trList = element.trList!
          for (let r = 0; r < trList.length; r++) {
            const tr = trList[r]
            for (let d = 0; d < tr.tdList.length; d++) {
              const td = tr.tdList[d]
              setValue(td.value)
            }
          }
        }
        if (element?.controlId !== controlId) continue
        // isExistSet = true
        const { type } = element.control!
        // 当前控件结束索引
        let currentEndIndex = i
        while (currentEndIndex < elementList.length) {
          const nextElement = elementList[currentEndIndex]
          if (nextElement.controlId !== element.controlId) break
          currentEndIndex++
        }
        // 模拟光标选区上下文
        const fakeRange = {
          startIndex: i - 1,
          endIndex: currentEndIndex - 2,
        }
        const controlContext: IControlContext = {
          range: fakeRange,
          elementList,
        }
        const controlRule: IControlRuleOption = {
          isIgnoreDisabledRule: true,
        }
        if (type === ControlType.TEXT) {
          const formatValue = [{ value }]
          formatElementList(formatValue, {
            isHandleFirstElement: false,
            editorOptions: this.options,
            dataSource: this.draw.getDataSource(),
          })
          const text = new TextControl(element, this)
          if (value) {
            text.setValue(formatValue, controlContext, controlRule)
          } else {
            text.clearValue(controlContext, controlRule)
          }
        } else if (type === ControlType.SELECT) {
          const select = new SelectControl(element, this)
          if (value) {
            select.setSelect(value, controlContext, controlRule)
          } else {
            select.clearSelect(controlContext, controlRule)
          }
        } else if (type === ControlType.CHECKBOX) {
          const checkbox = new CheckboxControl(element, this)
          const checkboxElementList = elementList.slice(
            fakeRange.startIndex + 1,
            fakeRange.endIndex + 1,
          )
          const codes = value?.split(',') || []
          for (const checkElement of checkboxElementList) {
            if (checkElement.controlComponent === ControlComponent.CHECKBOX) {
              const checkboxItem = checkElement.checkbox!
              checkboxItem.value = codes.includes(checkboxItem.code!)
            }
          }
          checkbox.setSelect(codes, controlContext, controlRule)
        } else if (type === ControlType.RADIO) {
          const radio = new RadioControl(element, this)
          radio.setSelect(controlContext)
        }
        // 修改后控件结束索引
        let newEndIndex = i
        while (newEndIndex < elementList.length) {
          const nextElement = elementList[newEndIndex]
          if (nextElement.controlId !== element.controlId) break
          newEndIndex++
        }
        i = newEndIndex
      }
    }
    // 页眉、内容区、页脚同时处理
    const data = [
      this.draw.getHeaderElementList(),
      this.draw.getOriginalMainElementList(),
      this.draw.getFooterElementList(),
    ]
    for (const elementList of data) {
      setValue(elementList)
    }
    // if (isExistSet) {
    //   this.draw.render({
    //     isSetCursor: false,
    //   })
    // }
  }

  public setExtensionByConceptId(payload: ISetControlExtensionOption) {
    const isReadonly = this.draw.isReadonly()
    if (isReadonly) return
    const { conceptId, extension } = payload
    const setExtension = (elementList: IElement[]) => {
      let i = 0
      while (i < elementList.length) {
        const element = elementList[i]
        i++
        // 表格下钻处理
        if (element.type === ElementType.TABLE) {
          const trList = element.trList!
          for (let r = 0; r < trList.length; r++) {
            const tr = trList[r]
            for (let d = 0; d < tr.tdList.length; d++) {
              const td = tr.tdList[d]
              setExtension(td.value)
            }
          }
        }
        if (element?.control?.conceptId !== conceptId) continue
        element.control.extension = extension
        // 修改后控件结束索引
        let newEndIndex = i
        while (newEndIndex < elementList.length) {
          const nextElement = elementList[newEndIndex]
          if (nextElement.controlId !== element.controlId) break
          newEndIndex++
        }
        i = newEndIndex
      }
    }
    const data = [
      this.draw.getHeaderElementList(),
      this.draw.getOriginalMainElementList(),
      this.draw.getFooterElementList(),
    ]
    for (const elementList of data) {
      setExtension(elementList)
    }
  }

  private _createHoverPopupDom() {
    const hoverPopupContainer = document.createElement('div')
    hoverPopupContainer.classList.add(`${EDITOR_PREFIX}-hover-popup`)
    const hoverTextDom = document.createElement('div')
    hoverPopupContainer.append(hoverTextDom)
    const container = this.draw.getContainer()
    container.append(hoverPopupContainer)
    return { hoverPopupContainer, hoverTextDom }
  }

  public drawHoverPopup(element: IElement, position: IElementPosition) {
    if (!element.control?.extension?.tip) {
      return
    }
    const tip = element.control?.extension?.tip
    const {
      coordinate: {
        leftTop: [left, top],
      },
      lineHeight,
    } = position
    const height = this.draw.getHeight()
    const pageGap = this.draw.getPageGap()
    const preY = this.draw.getPageNo() * (height + pageGap)
    // 位置
    this.hoverPopupContainer.style.display = 'block'
    this.hoverPopupContainer.style.left = `${left}px`
    this.hoverPopupContainer.style.top = `${top + preY + lineHeight}px`
    this.hoverTextDom.innerText = tip
  }
  public clearHoverPopup() {
    this.hoverPopupContainer.style.display = 'none'
  }

  public getFormControlItem(element: IElement): IGetControlList | undefined {
    const extension = element.control?.extension
    const values = element.control?.value ? element.control?.value : []
    let value: any = null
    if (element.control?.type === ControlType.TEXT || element.control?.type === ControlType.DATE) {
      if (values?.length === 1) {
        value = values[0].value
      }
    } else if (element.control?.type === ControlType.SELECT) {
      value = element.control?.code
    } else if (element.control?.type === ControlType.RADIO) {
      value = element.control?.code
    } else if (element.control?.type === ControlType.CHECKBOX) {
      const valueStr = element.control?.code
      if (valueStr) {
        value = valueStr.split(',').filter((p) => p)
      }
    } else {
      value = values.map((p) => p.value)
    }

    if (extension.field) {
      const item: IGetControlList = {
        name: extension.name,
        field: extension.field,
        option: extension,
        value: value,
        type: element.control?.type as ControlType,
        controlId: element.controlId as string,
      }
      return item
    }
    return undefined
  }

  // 获取表单控件列表
  public getFormControlList(): IGetControlList[] {
    const elementList = this.draw.getOriginalMainElementList()
    const mainElementList = zipElementList(elementList)
    const formItem: IGetControlList[] = []
    for (let i = 0; i < mainElementList.length; i++) {
      const element = mainElementList[i]
      if (element.type === ElementType.CONTROL) {
        const item = this.getFormControlItem(element)
        if (item) {
          formItem.push(item)
        }
      } else if (element.type === ElementType.TABLE) {
        // 表格
        if (element.trList) {
          for (let r = 0; r < element.trList.length; r++) {
            const tr = element.trList[r]
            for (let d = 0; d < tr.tdList.length; d++) {
              const td = tr.tdList[d]
              for (let v = 0; v < td.value.length; v++) {
                const tdItem = td.value[v]
                if (tdItem.type === ElementType.CONTROL) {
                  const item = this.getFormControlItem(tdItem)
                  if (item) {
                    formItem.push(item)
                  }
                }
              }
            }
          }
        }
      }
    }
    return formItem
  }

  private getVerifyErrorResult(item: IGetControlList, message: string): IVerifyControlErrorResult {
    return {
      field: item.field,
      name: item.name,
      controlId: item.controlId,
      message,
    }
  }

  // 验证表单控件的值
  public verifyControlValues() {
    return new Promise((resolve, reject) => {
      const controlList = this.getFormControlList()
      const errorItems: IVerifyControlErrorResult[] = []
      for (let i = 0; i < controlList.length; i++) {
        const item = controlList[i]
        const verifyRule = item.option.verifyRule
        if (verifyRule.require && !item.value) {
          //必填
          errorItems.push(
            this.getVerifyErrorResult(item, verifyRule.errorText ? verifyRule.errorText : `必填`),
          )
        }
        if (item.value && verifyRule.prohibitKeywords) {
          // 禁用关键词验证
          const prohibitKeywords = Array.from(verifyRule.prohibitKeywords)
          for (let i = 0; i < prohibitKeywords.length; i++) {
            const key = prohibitKeywords[i]
            if (item.value.indexOf(key) > -1) {
              errorItems.push(
                this.getVerifyErrorResult(item, `不可存在${verifyRule.prohibitKeywords}字符`),
              )
            }
          }
        }
        if (item.value && verifyRule.type && verifyRule.type !== 'null') {
          //格式验证
          if (
            verifyRule.type === 'text' &&
            verifyRule.textRule &&
            (verifyRule.textRule.minLength || verifyRule.textRule.maxLength)
          ) {
            // 文本格式验证
            const { minLength, maxLength } = verifyRule.textRule
            if (minLength && item.value.length < minLength) {
              errorItems.push(this.getVerifyErrorResult(item, `不能小于${minLength}个字符`))
            } else if (maxLength && item.value.length > maxLength) {
              errorItems.push(this.getVerifyErrorResult(item, `不能大于${maxLength}个字符`))
            }
          } else if (
            verifyRule.type === 'number' &&
            verifyRule.numberRule &&
            (verifyRule.numberRule.min ||
              verifyRule.numberRule.max ||
              verifyRule.numberRule.decimal)
          ) {
            // 数字格式验证
            const { min, max, decimal } = verifyRule.numberRule
            if (min && Number(item.value) < Number(min)) {
              errorItems.push(this.getVerifyErrorResult(item, `不能小于${min}`))
            } else if (max && Number(item.value) > Number(max)) {
              errorItems.push(this.getVerifyErrorResult(item, `不能大于${max}`))
            } else if (decimal) {
              const valueStr = item.value + ''
              if (valueStr.indexOf('.') > -1) {
                const valueArr = valueStr.split('.')
                const decimalValue = valueArr[1]
                if (decimalValue.length > decimal) {
                  errorItems.push(this.getVerifyErrorResult(item, `小数位不能大于${decimal}位`))
                }
              }
            }
          } else if (
            verifyRule.type === 'date' &&
            verifyRule.dateRule &&
            (verifyRule.dateRule.min || verifyRule.dateRule.max)
          ) {
            // 日期格式验证
            const { min, max } = verifyRule.dateRule
            const dateFormat = item.option.format ? item.option.format : 'YYYY-MM-DD'
            const dateValue = dayjs(item.value).format(dateFormat)
            if (dateValue !== item.value) {
              errorItems.push(this.getVerifyErrorResult(item, `请输入日期格式`))
            } else if (min && dayjs(min).isAfter(dayjs(item.value))) {
              errorItems.push(this.getVerifyErrorResult(item, `不能小于${min}`))
            } else if (max && dayjs(max).isBefore(dayjs(item.value))) {
              errorItems.push(this.getVerifyErrorResult(item, `不能大于${max}`))
            }
          } else if (verifyRule.type === 'reg' && verifyRule.regRule && verifyRule.regRule.regex) {
            const regexPattern = verifyRule.regRule.regex.replace(/^\/|\/$/g, '')
            const regex = new RegExp(regexPattern)
            if (!regex.test(item.value)) {
              const errorText = verifyRule.regRule.errorText
                ? verifyRule.regRule.errorText
                : '不符合验证规则'
              errorItems.push(this.getVerifyErrorResult(item, `${errorText}`))
            }
          }
        }
      }
      if (errorItems && errorItems.length) {
        reject(errorItems)
        return
      }

      resolve(controlList)
    })
  }

  // function evaluateCondition(condition) {
  //   try {
  //     return eval(condition);
  //   } catch (error) {
  //     console.error("条件表达式无效:", error);
  //     return false;
  //   }
  // }

  private getExpressionResult(formData: any, expression: string) {
    // 替换字符串变量
    const dataSource = this.draw.getDataSource()
    const regex = /\]\+\[|\]-\[|\]\*\[|\]\/\[/
    const isCalcExpression = regex.test(expression) // 是否计算表达式
    // 使用正则表达式替换字符串中的所有 [xxxx]
    const replacedStr = expression.replace(/\[(.*?)\]/g, (_match: string, p1: string) => {
      let value = isCalcExpression ? '0' : ''
      if (p1.indexOf('root.') > -1) {
        // 数据源
        value = dataSource.getValueByKey(p1)
      } else if (formData[p1]) {
        value = formData[p1]
      }
      if (isCalcExpression && typeof value === 'string' && !/^\d+$/.test(value)) {
        value = '0'
      }
      return value
    })
    try {
      return eval(replacedStr)
    } catch (error) {
      return false
    }
  }

  public computeControlExpressionResult(formData: any, controlList: IGetControlList[]) {
    const res: any = {}
    for (let i = 0; i < controlList.length; i++) {
      const item = controlList[i]
      const authData = item.option.authData
      if (authData && authData.visibleExpression) {
        const visible = this.getExpressionResult(formData, authData.visibleExpression)
        res[item.controlId] = {
          visible,
        }
      }
      if (authData && authData.printVisibleExpression) {
        const printVisible = this.getExpressionResult(formData, authData.printVisibleExpression)
        if (res[item.controlId]) {
          res[item.controlId].printVisible = printVisible
        } else {
          res[item.controlId] = {
            printVisible,
          }
        }
      }
    }
    this.visibleExpressionResultByControlId = res
    console.log('可见表达式', res)
    return res
  }

  public getVisibleExpressionResult() {
    return this.visibleExpressionResultByControlId
  }

  // 获取计算表达式的字段关联数据
  private getControlCalcExpressionRelated() {
    const controlList = this.getFormControlList()
    const formData: any = {}
    const relatedField: any = {} //根据字段名所关联的控件
    for (let i = 0; i < controlList.length; i++) {
      const element = controlList[i]
      formData[element.field] = element.value
      const authData = element.option.authData
      if (authData && authData.calcExpression) {
        authData.calcExpression.replace(/\[(.*?)\]/g, (match: string, p1: string) => {
          if (p1) {
            if (relatedField[p1]) {
              relatedField[p1].push(element)
            } else {
              relatedField[p1] = [element]
            }
          }
          return match
        })
      }
    }
    return {
      relatedField,
      formData,
      controlList,
    }
  }

  public handleControlExpression(field: string, relatedField?: any, formData?: any) {
    let controlList: IGetControlList[] = []
    if (!relatedField) {
      const calcExpressionRelated = this.getControlCalcExpressionRelated()
      relatedField = calcExpressionRelated.relatedField
      formData = calcExpressionRelated.formData
      controlList = calcExpressionRelated.controlList
    }
    if (!(relatedField && Object.keys(relatedField).length > 0)) {
      return { formData, controlList }
    }
    if (relatedField[field]) {
      for (let i = 0; i < relatedField[field].length; i++) {
        const item = relatedField[field][i]
        const controlId = item.controlId
        const calc = this.getExpressionResult(formData, item.option.authData.calcExpression)
        this.setValueByControlId({
          controlId,
          value: calc,
        })
        formData[item.field] = calc
        if (relatedField[item.field]) {
          this.handleControlExpression(item.field, relatedField, formData)
        }
      }
    }
    // 返回参数方便可见性表达式使用，避免多次遍历取值
    return { formData, controlList }
  }
}
