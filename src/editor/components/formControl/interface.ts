// import { PaperDirection } from '/@/components/CanvasEditor'
// import { ControlType } from '/@/components/CanvasEditor'
// import { IContextMenuContext } from '/@/components/CanvasEditor/interface/contextmenu/ContextMenu'
import { FormItemType } from '../../components/DataForm/interface'
import { ControlType } from '../../dataset/enum/Control'
import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'
import { CommandAdapt } from '../../core/command/CommandAdapt'
// ControlType
export interface FormControlModalProps {
  title?: string
  type: ControlType
  context?: IContextMenuContext
  onSubmit?: (values: FormControlSubmitValues) => void
  onCancel?: () => void
  command?:CommandAdapt
}

export interface FormControlSubmitValues {
  baseFormItems: FormItemType[]
  dataSource: FormControlDataSourceTableItem[]
  context?: IContextMenuContext
}

export interface FormControlDataSourceTableItem {
  label: string
  value: string
}

export interface FormControlHooksResult {
  baseFormItems: FormItemType[]
  context?: IContextMenuContext
  onSubmit: (values: any) => void
}

export interface EventItem {
  id: string
  event: 'change' | 'blur'
  expression: string
  field: string
  execute: 'visible' | 'setValue' | 'setOptions' | 'setAttr'
  value: string
  dataSourceValue: string
  dataSourceOptions: string
  staticOptionsTableData: any
}

// export interface PageSettingSubmitResult extends PageSettingData {
//   direction: PaperDirection
//   paperSize: string
// }

// export interface pageSettingMaring {
//   left: number
//   top: number
//   right: number
//   bottom: number
// }
