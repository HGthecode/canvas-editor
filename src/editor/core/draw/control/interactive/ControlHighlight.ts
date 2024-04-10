import { DeepRequired } from '../../../../interface/Common'
import { IEditorOption } from '../../../../interface/Editor'
import {  IElementPosition } from '../../../../interface/Element'
import { ICurrentPosition } from '../../../../interface/Position'
import { Draw } from '../../Draw'
import { Control } from '../Control'


export class ControlHighlight {
  private draw: Draw
  private options: DeepRequired<IEditorOption>
  private highlightControlPosition: ICurrentPosition | null
  private highlightPositionList: IElementPosition[]

  constructor(control: Control) {
    this.draw = control.getDraw()
    this.options = this.draw.getOptions()

    this.highlightControlPosition = null
    this.highlightPositionList = []
  }


  public setHighlightControlPosition(controlPosition: ICurrentPosition) {
    this.highlightControlPosition = controlPosition
    this.computeHighlightPositionList()
  }

  public clearHighlightControlPosition(){
    this.highlightControlPosition = null
    this.highlightPositionList = []
  }

  public computeHighlightPositionList(){
    if (!this.highlightControlPosition) {
      this.highlightPositionList = []
      return
    }
    const highlightPositionList = []
    const positionList = this.draw.getPosition().getOriginalPositionList()
    const elementList = this.draw.getOriginalElementList()
    if (this.highlightControlPosition.isTable) {
      // 表格
      const { trIndex, tdIndex, index } = this.highlightControlPosition
      const td =
          elementList[index!]?.trList![trIndex!].tdList[tdIndex!]
      if (td.value.length) {
        for (let i = 0; i < td.value.length; i++) {
          const element = td.value[i]
          if (element.controlId === this.highlightControlPosition.controlId && td.positionList && td.positionList[i]) {
            highlightPositionList.push(td.positionList[i])
          }
        }
      }
         
    }else{
      const { hitControl }=this.highlightControlPosition
      for (let i = 0; i < elementList.length; i++) {
          const element = elementList[i]
          if (hitControl && hitControl.controlId && element.controlId === hitControl.controlId && positionList[i]) {
            highlightPositionList.push(positionList[i])
          }
      }
    }
    this.highlightPositionList=highlightPositionList
    
  }

  public renderHighlight(ctx: CanvasRenderingContext2D, pageIndex: number){
    if (!this.highlightPositionList.length) {
      return
    }
    const hoverHighlightColor =
      this.options.control && this.options.control.hoverHighlightColor
        ? this.options.control.hoverHighlightColor
        : undefined
      
    for (let i = 0; i < this.highlightPositionList.length; i++) {
      const position = this.highlightPositionList[i]
      if (!position) continue
      const {
        coordinate: { leftTop, leftBottom, rightTop },
        pageNo
      } = position
      if (pageNo !== pageIndex) continue
      ctx.fillStyle = hoverHighlightColor as string
      ctx.globalAlpha = 1
      const x = leftTop[0]
      const y = leftTop[1]
      const width = rightTop[0] - leftTop[0]
      const height = leftBottom[1] - leftTop[1]
      ctx.fillRect(x, y, width, height)
    }


  }
}
