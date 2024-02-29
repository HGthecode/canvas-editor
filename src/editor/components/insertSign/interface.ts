import { FormItemType } from '../../components/DataForm/interface'
import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'
import { CommandAdapt } from '../../core/command/CommandAdapt'

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
