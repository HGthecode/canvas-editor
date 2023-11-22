import { DeepRequired } from '../../../interface/Common'
import { IEditorOption } from '../../../interface/Editor'
import { IRowElement } from '../../../interface/Row'
import { Draw } from '../Draw'

export class RadioParticle {
  private options: DeepRequired<IEditorOption>

  constructor(draw: Draw) {
    this.options = draw.getOptions()
  }

  public render(ctx: CanvasRenderingContext2D, element: IRowElement, x: number, y: number) {
    const {
      radio: { gap, lineWidth, fillStyle, radius, lineStyle },
    } = this.options
    const { metrics, radio } = element
    // left top 四舍五入避免1像素问题
    const left = Math.round(x + gap) + 6
    const top = Math.round(y - metrics.height + lineWidth) + 6
    ctx.save()
    ctx.beginPath()
    ctx.translate(0.5, 0.5)
    // 绘制勾选状态
    if (radio?.value) {
      // 边框
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = fillStyle
      ctx.arc(left, top, radius, 0, 2 * Math.PI)
      ctx.stroke()
      // 背景色
      ctx.fillStyle = fillStyle
      ctx.fill()

      // 勾选圆点
      ctx.beginPath()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = lineWidth * 2
      ctx.arc(left, top, radius - 2, 0, 2 * Math.PI)
      ctx.fillStyle = fillStyle
      ctx.fill()
      ctx.stroke()
    } else {
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = lineStyle
      ctx.arc(left, top, radius, 0, 2 * Math.PI)
      ctx.stroke()
    }
    ctx.closePath()
    ctx.restore()
  }
}
