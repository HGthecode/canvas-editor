export interface IAreaOption {
  /** 是否显示光标所在区域的激活边框 */
  showActiveBorder?: boolean
  /** 激活边框颜色 */
  activeBorderColor?: string
  /** 程序化高亮边框颜色 */
  highlightBorderColor?: string
  /** 边框宽度 */
  borderWidth?: number
}

export interface IHighlightAreaOption {
  /** 区域 ID，不传则清除高亮 */
  id?: string | null
}
