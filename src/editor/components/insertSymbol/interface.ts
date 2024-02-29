import { FormItemType } from '../../components/DataForm/interface'
import { CommandAdapt } from '../../core/command/CommandAdapt'
import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'


// ControlType
export interface FormControlModalProps {
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

