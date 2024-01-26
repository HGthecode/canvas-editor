import { IElement } from '..'
import { EditorZone } from '../dataset/enum/Editor'
import { IElementPosition } from './Element'
import { IRadioOptionItem } from './Radio'
import { IRow } from './Row'
import { ITd } from './table/Td'

export interface ICurrentPosition {
  index: number
  isCheckbox?: boolean
  isRadio?: boolean
  isControl?: boolean
  isImage?: boolean
  isTable?: boolean
  isDirectHit?: boolean
  trIndex?: number
  tdIndex?: number
  tdValueIndex?: number
  tdId?: string
  trId?: string
  tableId?: string
  zone?: EditorZone
  hitLineStartIndex?: number
  itemIndex?: number
  itemData?: IRadioOptionItem
  controlId?: string
}

export interface IGetPositionByXYPayload {
  x: number
  y: number
  pageNo?: number
  isTable?: boolean
  td?: ITd
  tablePosition?: IElementPosition
  elementList?: IElement[]
  positionList?: IElementPosition[]
}

export interface IPositionContext {
  isTable: boolean
  isCheckbox?: boolean
  isRadio?: boolean
  isControl?: boolean
  index?: number
  trIndex?: number
  tdIndex?: number
  tdId?: string
  trId?: string
  tableId?: string
}

export interface IComputeRowPositionPayload {
  row: IRow
  innerWidth: number
}

export interface IComputePageRowPositionPayload {
  positionList: IElementPosition[]
  rowList: IRow[]
  pageNo: number
  startRowIndex: number
  startIndex: number
  startX: number
  startY: number
  innerWidth: number
}

export interface IComputePageRowPositionResult {
  x: number
  y: number
  index: number
}
