
import { Raw } from 'vue'
import {IRangeStyle} from '../index'
import { ObjectType } from './Common'
import { Command } from '../core/command/Command'
import { ToolbarCode } from '../dataset/enum/Toolbar'

// export type ToolCode = 

export interface IToolbarOption {
  show?:boolean
  tools?:ToolbarCode[][]
  formControlCodes?:ToolbarCode[]
}

export interface ToolbarItemEvents {
  click?: (event: any, item: ToolbarItemOption) => void
}

export interface ToolbarComponentClickParams {
  item: ToolbarItemOption
  command: Command
}

export interface ToolbarComponentChangeParams {
  item: ToolbarItemOption
  command: Command
  value: any
}

export interface ToolbarItemOption {
  name: string
  code: string
  icon?: string
  hotKey?: string
  on?: ToolbarItemEvents
  children?: ToolbarItemOption[]
  component?: Raw<any>
  onClick?: (opt: ToolbarComponentClickParams) => void
  onChange?: (opt: ToolbarComponentChangeParams) => void
  onActive?: (rangeStyle: IRangeStyle | undefined) => boolean
  onDisabled?: (rangeStyle: IRangeStyle | undefined) => boolean
  props?: ObjectType<any>
}

export interface ToolbarComponentProps {
  item: ToolbarItemOption
}

export interface ToolbarComponentEmit {
  (event: 'itemClick', item: ToolbarItemOption): void
  (event: 'itemChange', value: any, item: ToolbarItemOption): void
}