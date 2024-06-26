import { ControlComponent } from '../../../../dataset/enum/Control'
import { KeyMap } from '../../../../dataset/enum/KeyMap'
import { IControlContext, IControlInstance } from '../../../../interface/Control'
import { IElement } from '../../../../interface/Element'
import { Control } from '../Control'

export class DateControl implements IControlInstance {
  private element: IElement
  private control: Control

  constructor(element: IElement, control: Control) {
    this.element = element
    this.control = control
  }

  public getElement(): IElement {
    return this.element
  }

  public getCode(): string | null {
    return this.element.control?.code || null
  }

  public getValue(): IElement[] {
    const elementList = this.control.getElementList()
    const { startIndex } = this.control.getRange()
    const startElement = elementList[startIndex]
    const data: IElement[] = []
    console.log('date', startIndex)

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

  public setValue(): number {
    console.log('setSSSS2')
    return -1
  }

  public setSelect(context: IControlContext = {}) {
    const { control } = this.element
    const elementList = context.elementList || this.control.getElementList()
    const { startIndex } = context.range || this.control.getRange()
    const startElement = elementList[startIndex]
    const data: string[] = []
    console.log('setSSSS', startIndex)

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
      if (preElement.controlComponent === ControlComponent.RADIO) {
        const radio = preElement.radio
        if (radio && radio.value && radio.code) {
          data.unshift(radio.code)
        }
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
      if (nextElement.controlComponent === ControlComponent.RADIO) {
        const radio = nextElement.radio
        if (radio && radio.value && radio.code) {
          data.push(radio.code)
        }
      }
      nextIndex++
    }
    control!.code = data.join(',')
  }

  public keydown(evt: KeyboardEvent): number {
    const range = this.control.getRange()
    // 收缩边界到Value内
    this.control.shrinkBoundary()
    const { startIndex, endIndex } = range
    // 删除
    if (evt.key === KeyMap.Backspace || evt.key === KeyMap.Delete) {
      return this.control.removeControl(startIndex) as number
    }
    return endIndex
  }

  public cut(): number {
    return -1
  }
}
