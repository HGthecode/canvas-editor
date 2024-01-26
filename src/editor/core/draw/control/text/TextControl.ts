import { TEXTLIKE_ELEMENT_TYPE } from '../../../../dataset/constant/Element'
import { ControlComponent } from '../../../../dataset/enum/Control'
import { KeyMap } from '../../../../dataset/enum/KeyMap'
import {
  IControlContext,
  IControlInstance,
  IControlRuleOption,
} from '../../../../interface/Control'
import { IElement } from '../../../../interface/Element'
import { omitObject, pickObject } from '../../../../utils'
import { formatElementContext } from '../../../../utils/element'
import { Control } from '../Control'

export class TextControl implements IControlInstance {
  private element: IElement
  private control: Control

  constructor(element: IElement, control: Control) {
    this.element = element
    this.control = control
  }

  public getElement(): IElement {
    return this.element
  }

  public getValue(): IElement[] {
    const elementList = this.control.getElementList()
    const { startIndex } = this.control.getRange()
    const startElement = elementList[startIndex]
    const data: IElement[] = []
    // 向左查找
    let preIndex = startIndex
    while (preIndex > 0) {
      const preElement = elementList[preIndex]
      if (
        preElement.controlId !== startElement.controlId ||
        preElement.controlComponent === ControlComponent.PREFIX
      ) {
        break
      }
      if (preElement.controlComponent === ControlComponent.VALUE) {
        data.unshift(preElement)
      }
      preIndex--
    }
    // 向右查找
    let nextIndex = startIndex + 1
    while (nextIndex < elementList.length) {
      const nextElement = elementList[nextIndex]
      if (
        nextElement.controlId !== startElement.controlId ||
        nextElement.controlComponent === ControlComponent.POSTFIX
      ) {
        break
      }
      if (nextElement.controlComponent === ControlComponent.VALUE) {
        data.push(nextElement)
      }
      nextIndex++
    }
    return data
  }

  public setValue(
    data: IElement[],
    context: IControlContext = {},
    options: IControlRuleOption = {},
  ): number {
    // 校验是否可以设置
    if (!options.isIgnoreDisabledRule && this.control.isDisabledControl()) {
      return -1
    }
    const elementList = context.elementList || this.control.getElementList()
    const range = context.range || this.control.getRange()
    // 收缩边界到Value内
    this.control.shrinkBoundary()
    const { startIndex, endIndex } = range

    const draw = this.control.getDraw()
    // 移除选区元素
    if (startIndex !== endIndex) {
      draw.spliceElementList(elementList, startIndex + 1, endIndex - startIndex)
    } else {
      // 移除空白占位符
      this.control.removePlaceholder(startIndex, context)
    }
    // 非文本类元素或前缀过渡掉样式属性
    const startElement = elementList[startIndex]
    const anchorElement =
      (startElement.type && !TEXTLIKE_ELEMENT_TYPE.includes(startElement.type)) ||
      startElement.controlComponent === ControlComponent.PREFIX ||
      startElement.controlComponent === ControlComponent.LABEL ||
      startElement.controlComponent === ControlComponent.UNIT
        ? pickObject(startElement, ['control', 'controlId'])
        : omitObject(startElement, ['type'])
    const extension = anchorElement.control?.extension
    const color = extension && extension.textColor ? extension.textColor : undefined

    // 插入起始位置
    const start = range.startIndex + 1
    for (let i = 0; i < data.length; i++) {
      const newElement: IElement = {
        color,
        ...anchorElement,
        ...data[i],
        controlComponent: ControlComponent.VALUE,
        underline: startElement.underline ? true : false,
      }
      formatElementContext(elementList, [newElement], startIndex)
      draw.spliceElementList(elementList, start + i, 0, newElement)
    }
    this.formatValueByControlId()

    // 处理计算表达式联动的其它控件
    // const controlExpressionResult = this.control.computeControlExpressionResult()
    // console.log('text setValue', extension, controlExpressionResult)
    // if (
    //   controlExpressionResult.relatedControlField[extension.field] &&
    //   controlExpressionResult.relatedControlField[extension.field].length
    // ) {
    //   for (
    //     let i = 0;
    //     i < controlExpressionResult.relatedControlField[extension.field].length;
    //     i++
    //   ) {
    //     const controlId = controlExpressionResult.relatedControlField[extension.field][i]
    //     this.control.setValueByControlId({
    //       controlId: controlId,
    //       value: '666',
    //     })
    //   }
    // }

    // 格式化/加密处理
    // if (
    //   extension.authData &&
    //   extension.authData.encryption &&
    //   extension.authData.encryption !== 'none'
    // ) {
    // this.formatValueByControlId(
    //   anchorElement.controlId,
    //   elementList,
    //   extension.authData.encryption,
    // )
    // 加密处理
    // const controlValues: string[] = []
    // for (let i = 0; i < elementList.length; i++) {
    //   const element = elementList[i]
    //   if (element.controlId && element.controlId === anchorElement.controlId) {
    //     const nextI = i + 1
    //     if (element.controlComponent === ControlComponent.VALUE) {
    //       controlValues.push(element.value)
    //     }
    //     if (
    //       element.controlComponent === ControlComponent.VALUE &&
    //       extension.authData.encryption === 'showHT' &&
    //       controlValues.length > 1 &&
    //       elementList[nextI].controlComponent === ControlComponent.VALUE &&
    //       element.value != '*'
    //     ) {
    //       // 仅显示首尾字符
    //       element.realValue = element.value
    //       element.value = '*'
    //     } else if (
    //       element.controlComponent === ControlComponent.VALUE &&
    //       extension.authData.encryption === 'phone' &&
    //       controlValues.length > 3 &&
    //       controlValues.length < 8 &&
    //       elementList[nextI].controlComponent === ControlComponent.VALUE &&
    //       element.value != '*'
    //     ) {
    //       // 手机号脱敏
    //       element.realValue = element.value
    //       element.value = '*'
    //     }
    //   }
    // }
    // }

    return start + data.length - 1
  }

  public formatValueByControlId() {
    const values = this.getValue()
    console.log(values)
    if (!values.length) {
      return
    }
    const control = values[0].control
    const extension = control?.extension
    if (!(extension.authData && extension.authData.encryption)) {
      return
    }
    for (let i = 0; i < values.length; i++) {
      const valueItem = values[i]
      if (extension.authData.encryption === 'showHT') {
        // 仅显示首尾字符
        if (i > 0 && i < values.length - 1 && valueItem.value != '*') {
          valueItem.realValue = valueItem.value
          valueItem.value = '*'
        } else if (
          valueItem.realValue &&
          valueItem.value == '*' &&
          (i === 0 || i === values.length - 1)
        ) {
          valueItem.value = valueItem.realValue
          valueItem.realValue = null
        }
      } else if (extension.authData.encryption === 'phoneEncrypt') {
        // 手机号脱敏
        if (i > 2 && i < 7 && valueItem.value != '*') {
          valueItem.realValue = valueItem.value
          valueItem.value = '*'
        } else if (valueItem.realValue && valueItem.value == '*' && (i < 3 || i > 6)) {
          valueItem.value = valueItem.realValue
          valueItem.realValue = null
        }
      }
    }

    // 加密处理
    // const controlValues: string[] = []
    // for (let i = 0; i < elementList.length; i++) {
    //   const element = elementList[i]
    //   if (element.controlId && element.controlId === controlId) {
    //     const nextI = i + 1
    //     if (element.controlComponent === ControlComponent.VALUE) {
    //       controlValues.push(element.value)
    //     }
    //     if (
    //       element.controlComponent === ControlComponent.VALUE &&
    //       format === 'showHT' &&
    //       controlValues.length > 1 &&
    //       elementList[nextI].controlComponent === ControlComponent.VALUE &&
    //       element.value != '*'
    //     ) {
    //       // 仅显示首尾字符
    //       element.realValue = element.value
    //       element.value = '*'
    //     } else if (
    //       element.controlComponent === ControlComponent.VALUE &&
    //       format === 'phoneEncrypt' &&
    //       controlValues.length > 3 &&
    //       controlValues.length < 8 &&
    //       elementList[nextI].controlComponent === ControlComponent.VALUE &&
    //       element.value != '*'
    //     ) {
    //       // 手机号脱敏
    //       element.realValue = element.value
    //       element.value = '*'
    //     }
    //   }
    // }
  }

  public clearValue(context: IControlContext = {}, options: IControlRuleOption = {}): number {
    // 校验是否可以设置
    if (!options.isIgnoreDisabledRule && this.control.isDisabledControl()) {
      return -1
    }
    const elementList = context.elementList || this.control.getElementList()
    const range = context.range || this.control.getRange()
    const { startIndex, endIndex } = range
    this.control.getDraw().spliceElementList(elementList, startIndex + 1, endIndex - startIndex)
    const value = this.getValue()
    if (!value.length) {
      this.control.addPlaceholder(startIndex)
    }
    return startIndex
  }

  public keydown(evt: KeyboardEvent): number | null {
    if (this.control.isDisabledControl()) {
      return null
    }
    console.log('keyw')

    const elementList = this.control.getElementList()
    const range = this.control.getRange()
    // 收缩边界到Value内
    this.control.shrinkBoundary()
    const { startIndex, endIndex } = range
    const startElement = elementList[startIndex]
    const endElement = elementList[endIndex]
    const draw = this.control.getDraw()
    // backspace
    if (evt.key === KeyMap.Backspace) {
      console.log('back', startIndex, endIndex)

      // 移除选区元素
      if (startIndex !== endIndex) {
        draw.spliceElementList(elementList, startIndex + 1, endIndex - startIndex)
        const value = this.getValue()
        if (!value.length) {
          this.control.addPlaceholder(startIndex)
        } else {
          this.formatValueByControlId()
        }
        return startIndex
      } else {
        if (
          startElement.controlComponent === ControlComponent.PREFIX ||
          endElement.controlComponent === ControlComponent.POSTFIX ||
          startElement.controlComponent === ControlComponent.PLACEHOLDER ||
          startElement.controlComponent === ControlComponent.LABEL ||
          startElement.controlComponent === ControlComponent.UNIT
        ) {
          // 前缀、后缀、占位符
          return this.control.removeControl(startIndex)
        } else {
          // 文本
          draw.spliceElementList(elementList, startIndex, 1)
          const value = this.getValue()
          if (!value.length) {
            this.control.addPlaceholder(startIndex - 1)
          } else {
            this.formatValueByControlId()
          }
          return startIndex - 1
        }
      }
    } else if (evt.key === KeyMap.Delete) {
      // 移除选区元素
      console.log('c', startIndex, endIndex)

      if (startIndex !== endIndex) {
        draw.spliceElementList(elementList, startIndex + 1, endIndex - startIndex)
        const value = this.getValue()
        if (!value.length) {
          this.control.addPlaceholder(startIndex)
        } else {
          this.formatValueByControlId()
        }

        return startIndex
      } else {
        const endNextElement = elementList[endIndex + 1]
        if (
          (startElement.controlComponent === ControlComponent.PREFIX &&
            endNextElement.controlComponent === ControlComponent.PLACEHOLDER) ||
          endNextElement.controlComponent === ControlComponent.POSTFIX ||
          startElement.controlComponent === ControlComponent.PLACEHOLDER
        ) {
          // 前缀、后缀、占位符
          return this.control.removeControl(startIndex)
        } else {
          // 文本
          draw.spliceElementList(elementList, startIndex + 1, 1)
          const value = this.getValue()
          if (!value.length) {
            this.control.addPlaceholder(startIndex)
          } else {
            this.formatValueByControlId()
          }
          return startIndex
        }
      }
    }
    return endIndex
  }

  public cut(): number {
    if (this.control.isDisabledControl()) {
      return -1
    }
    this.control.shrinkBoundary()
    const { startIndex, endIndex } = this.control.getRange()
    if (startIndex === endIndex) {
      return startIndex
    }
    const draw = this.control.getDraw()
    const elementList = this.control.getElementList()
    draw.spliceElementList(elementList, startIndex + 1, endIndex - startIndex)
    const value = this.getValue()
    if (!value.length) {
      this.control.addPlaceholder(startIndex)
    }
    return startIndex
  }
}
