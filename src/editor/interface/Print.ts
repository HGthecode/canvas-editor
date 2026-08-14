import type { IEditorData, IEditorOption } from './Editor'

export interface IPrintOption {
  offscreen?: boolean
  data?: IEditorData
  options?: IEditorOption
  /** 起始页码（从 1 开始），缺省为第 1 页 */
  startPageNo?: number
  /** 结束页码（从 1 开始），缺省为最后一页 */
  endPageNo?: number
}
