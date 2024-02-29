// import { PaperDirection } from '/@/components/CanvasEditor'
import { FormItemType } from '../../components/DataForm/interface'
import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'
import { CommandAdapt } from '../../core/command/CommandAdapt'

import { Svg } from '@svgdotjs/svg.js'

export interface InsertMedicalFormulasModalProps {
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

export interface FormulasComponentProps {
  canvas: Svg | undefined
}
