import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'
import { CommandAdapt } from '../../core/command/CommandAdapt'

export interface InsertLinkModalProps {
  context?: IContextMenuContext
  onCancel?: () => void
  command?:CommandAdapt
}
