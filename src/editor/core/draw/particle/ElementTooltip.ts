import { EDITOR_PREFIX } from '../../../dataset/constant/Editor'
import { ElementType } from '../../../dataset/enum/Element'
import { IElement } from '../../../interface/Element'
import { ICurrentPosition } from '../../../interface/Position'
import { Draw } from '../Draw'

export class ElementTooltip {
  private draw: Draw
  private container: HTMLDivElement
  private pageContainer: HTMLDivElement
  private tipContainer: HTMLDivElement
  private tipContent: HTMLSpanElement
  private isDisableMouseMove: boolean
  private activeElementKey: string | null
  private pendingElementKey: string | null
  private showTimer: ReturnType<typeof setTimeout> | null
  private pendingTipLeft = 0
  private pendingTipTop = 0
  private pendingTipText = ''
  private readonly showDelay = 1000

  constructor(draw: Draw) {
    this.draw = draw
    this.container = draw.getContainer()
    this.pageContainer = draw.getPageContainer()
    this.isDisableMouseMove = true
    this.activeElementKey = null
    this.pendingElementKey = null
    this.showTimer = null

    const { tipContainer, tipContent } = this._createTipElement()
    this.tipContainer = tipContainer
    this.tipContent = tipContent
    this._bindEvent()
  }

  private _createTipElement() {
    const tipContainer = document.createElement('div')
    tipContainer.classList.add(`${EDITOR_PREFIX}-element-tooltip`)
    const tipContent = document.createElement('span')
    tipContainer.append(tipContent)
    this.container.append(tipContainer)
    return { tipContainer, tipContent }
  }

  private _bindEvent() {
    this.pageContainer.addEventListener(
      'mousemove',
      this._handleMouseMove.bind(this)
    )
    this.pageContainer.addEventListener('mouseenter', () => {
      this.isDisableMouseMove = false
    })
    this.pageContainer.addEventListener('mouseleave', () => {
      this.isDisableMouseMove = true
      this._hideTip()
    })
  }

  private _handleMouseMove(evt: MouseEvent) {
    if (
      this.isDisableMouseMove ||
      this.draw.isPrintMode() ||
      !(evt.target instanceof HTMLCanvasElement)
    ) {
      this._hideTip()
      return
    }

    const pageNo = Number(evt.target.getAttribute('data-index'))
    if (Number.isNaN(pageNo)) {
      this._hideTip()
      return
    }

    const positionResult = this.draw.getPosition().getPositionByXY({
      x: evt.offsetX,
      y: evt.offsetY,
      pageNo
    })

    if (!positionResult.isDirectHit) {
      this._hideTip()
      return
    }

    const element = this._getHitElement(positionResult)
    const tooltip = this._getTooltip(element)
    if (!tooltip || !this._isTooltipTarget(element)) {
      this._hideTip()
      return
    }

    const elementKey = this._getElementKey(element!, positionResult)
    if (
      this.activeElementKey === elementKey &&
      this.tipContainer.classList.contains('show')
    ) {
      return
    }

    this._scheduleShow(elementKey, evt.clientX, evt.clientY, tooltip)
  }

  private _clearShowTimer() {
    if (this.showTimer) {
      clearTimeout(this.showTimer)
      this.showTimer = null
    }
  }

  private _scheduleShow(
    elementKey: string,
    left: number,
    top: number,
    text: string
  ) {
    if (this.pendingElementKey === elementKey && this.showTimer) {
      this.pendingTipLeft = left
      this.pendingTipTop = top
      return
    }

    this._clearShowTimer()
    this.tipContainer.classList.remove('show')
    this.activeElementKey = null
    this.pendingElementKey = elementKey
    this.pendingTipLeft = left
    this.pendingTipTop = top
    this.pendingTipText = text

    this.showTimer = setTimeout(() => {
      this.showTimer = null
      if (this.pendingElementKey !== elementKey) return
      this.activeElementKey = elementKey
      this._showTip(this.pendingTipLeft, this.pendingTipTop, this.pendingTipText)
    }, this.showDelay)
  }

  private _getHitElement(positionResult: ICurrentPosition): IElement | null {
    const { index, isTable, trIndex, tdIndex, tdValueIndex } = positionResult
    if (!~index) return null

    const elementList = this.draw.getOriginalElementList()
    if (isTable) {
      const tableElement = elementList[index]
      const td = tableElement?.trList?.[trIndex!]?.tdList[tdIndex!]
      return td?.value[tdValueIndex!] ?? null
    }
    return elementList[index] ?? null
  }

  private _getElementKey(
    element: IElement,
    positionResult: ICurrentPosition
  ): string {
    if (element.controlId) {
      return `control:${element.controlId}`
    }
    if (element.id) {
      return `id:${element.id}`
    }
    return `index:${positionResult.index}`
  }

  private _getTooltip(element: IElement | null): string | undefined {
    if (!element) return
    const tooltip = element.tooltip || element.control?.tooltip
    const text = tooltip?.trim()
    return text || undefined
  }

  /** 仅图片与表单控件显示 tooltip */
  private _isTooltipTarget(element: IElement | null): boolean {
    if (!element) return false
    if (element.type === ElementType.IMAGE) return true
    return !!element.controlId
  }

  private _showTip(left: number, top: number, text: string) {
    this.tipContainer.classList.add('show')
    this.tipContainer.style.left = `${left}px`
    this.tipContainer.style.top = `${top}px`
    this.tipContent.innerText = text
  }

  private _hideTip() {
    this._clearShowTimer()
    this.activeElementKey = null
    this.pendingElementKey = null
    this.tipContainer.classList.remove('show')
  }

  public hide() {
    this._hideTip()
  }

  public destroy() {
    this._clearShowTimer()
    this.tipContainer.remove()
  }
}
