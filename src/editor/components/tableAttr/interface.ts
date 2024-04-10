import { FormItemType } from '../../components/DataForm/interface'
import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'
import { CommandAdapt } from '../../core/command/CommandAdapt'
export interface TableAttrModalProps {
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


