import { FormItemType } from '../../components/DataForm/interface'
import { CommandAdapt } from '../../core/command/CommandAdapt'
import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'


export interface InsertBarcodeModalProps {
  context?: IContextMenuContext
  command?:CommandAdapt
  onSubmit?: (values: FormControlSubmitValues) => void
  onCancel?: () => void
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
