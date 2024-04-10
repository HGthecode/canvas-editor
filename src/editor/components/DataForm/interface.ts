import { ObjectType } from '../../interface/Common'
import { Rule } from 'ant-design-vue/lib/form/interface'

export interface FormProps {
  layout?: string
  items: FormItemType[]
  colspan?: number
  data?: ObjectType<any>
  rules?: ObjectType<Rule[]>
}

export interface FormItemType {
  title: string
  field: string
  type: FormItemTypes
  style?: string
  class?: string
  colspan?: number
  rowspan?: number
  align?: string
  titleWidth?: number
  colon?: boolean
  onChange?: (appKey: string | boolean) => void
  props?: ObjectType<any>
  rules?: any
  default?: any
  slot?: string
}

export enum FormInputType {
  INPUT = 'input',
  SELECT = 'select',
  NUMBER = 'number',
  CHECKBOX = 'checkbox',
  RADIOGROUP = 'radioGroup',
  BUTTONRADIOGROUP = 'buttonRadioGroup',
  SWITCH = 'switch',
  DATE = 'date',
  AUTOCOMPLETE = 'autoComplete',
  COLOR = 'color',
  TEXTAREA = 'textarea',
  TEXT = 'text',
  SLOT = 'slot',
}

export type FormItemTypes =
  | FormInputType.INPUT
  | FormInputType.SELECT
  | FormInputType.NUMBER
  | FormInputType.CHECKBOX
  | FormInputType.RADIOGROUP
  | FormInputType.SWITCH
  | FormInputType.DATE
  | FormInputType.AUTOCOMPLETE
  | FormInputType.COLOR
  | FormInputType.TEXTAREA
  | FormInputType.TEXT
  | FormInputType.SLOT
  | FormInputType.BUTTONRADIOGROUP

