import { IPadding } from '../Common'

export interface ITableOption {
  tdPadding?: IPadding
  defaultTrMinHeight?: number
  defaultColMinWidth?: number
  defaultBorderColor?: string
  overflow?: boolean
  showCellNumber?: boolean
  cellNumberColor?: string
  cellNumberFontSize?: number
}
