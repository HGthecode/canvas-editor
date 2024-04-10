import { ControlType, ControlIndentation } from '../dataset/enum/Control'
import { EditorZone } from '../dataset/enum/Editor'
import { ICheckbox } from './Checkbox'
import { IRadio } from './Radio'

import { IElement } from './Element'
import { IRange } from './Range'
import { ObjectType } from './Common'

export interface IValueSet {
  value: string
  code: string
}

export interface IControlSelect {
  code: string | null
  valueSets: IValueSet[]
}

export interface IControlCheckbox {
  code: string | null
  min?: number
  max?: number
  valueSets: IValueSet[]
  checkbox?: ICheckbox
  radio?: IRadio
}

export interface IControlRadio {
  code: string | null
  min?: number
  max?: number
  valueSets: IValueSet[]
  radio?: IRadio
}

export interface IControlDate {
  dateFormat?: string
  min?: number
  max?: number
}

export interface IControlHighlightRule {
  keyword: string
  alpha?: number
  backgroundColor?: string
}

export interface IControlHighlight {
  ruleList: IControlHighlightRule[]
  conceptId: string
}

export interface IControlRule {
  deletable?: boolean
  disabled?: boolean
}

export interface IControlBasic {
  type: ControlType
  value: IElement[] | null
  placeholder?: string
  conceptId?: string
  prefix?: string
  postfix?: string
  minWidth?: number
  underline?: boolean
  extension?: any
  indentation?: ControlIndentation
}

export type IControl = IControlBasic &
  IControlRule &
  Partial<IControlSelect> &
  Partial<IControlCheckbox> &
  Partial<IControlRadio> &
  Partial<IControlDate>

export interface IControlOption {
  placeholderColor?: string
  bracketColor?: string
  prefix?: string
  postfix?: string
  backgroundColor?: string
  hoverHighlightColor?: string
  requireBracketColor?: string //必填项前后缀颜色
  requireBackgroundColor?: string //必填项背景颜色
}

export interface IControlInitOption {
  index: number
  isTable?: boolean
  trIndex?: number
  tdIndex?: number
  tdValueIndex?: number
}

export interface IControlInitResult {
  newIndex: number
}

export interface IControlInstance {
  getElement(): IElement

  getValue(): IElement[]

  setValue(data: IElement[], context?: IControlContext, options?: IControlRuleOption): number

  keydown(evt: KeyboardEvent): number | null

  cut(): number
}

export interface IControlContext {
  range?: IRange
  elementList?: IElement[]
}

export interface IControlRuleOption {
  isIgnoreDisabledRule?: boolean // 忽略禁用校验规则
}

export interface IGetControlValueOption {
  conceptId: string
}

export type IGetControlValueResult = (Omit<IControl, 'value'> & {
  value: string | null
  innerText: string | null
  zone: EditorZone
})[]

export interface ISetControlValueOption {
  conceptId: string
  value: string
}

export interface ISetControlValueByControlIdOption {
  value: string
  controlId: string
}

export interface ISetControlExtensionOption {
  conceptId: string
  extension: unknown
}

export type ISetControlHighlightOption = IControlHighlight[]

export interface IGetControlList {
  name: string
  field: string
  option: any
  value: any
  type: ControlType
  controlId: string
  index:number
  trIndex?:number
  tdIndex?:number
  valueIndex?:number
}

export interface IGetControlListResult {
  formItemByField:ObjectType<IGetControlList>
  visibleRelatedFields:string[]
}

export interface IVerifyControlErrorResult {
  field: string
  name: string
  message: string
  controlId: string
}

export interface VisibleExpressionResult {
  visible: boolean
  printVisible: boolean
}

export interface VisibleExpressionResultByControlId {
  [key: string]: VisibleExpressionResult
}
export type ISetControlProperties = {
  conceptId: string
  properties: Partial<Omit<IControl, 'value'>>
}
