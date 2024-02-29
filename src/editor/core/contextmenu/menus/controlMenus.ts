import { INTERNAL_CONTEXT_MENU_KEY } from '../../../dataset/constant/ContextMenu'
import { ControlType } from '../../../dataset/enum/Control'
import { EditorMode } from '../../../dataset/enum/Editor'
import { ElementType } from '../../../dataset/enum/Element'
import { IContextMenuContext, IRegisterContextMenu } from '../../../interface/contextmenu/ContextMenu'
import { Command } from '../../command/Command'
const {
  CONTROL: { DELETE,ATTR }
} = INTERNAL_CONTEXT_MENU_KEY

export const controlMenus: IRegisterContextMenu[] = [
  {
    key: ATTR,
    i18nPath: 'contextmenu.control.attr',
    icon: 'attr',
    when: payload => {
      return (
        payload.mode === EditorMode.EDIT &&
        payload.hoverElement?.type === ElementType.CONTROL && 
        !payload.isReadonly 
      )
    },
    callback: (command: Command,context: IContextMenuContext) => {
      if (!context.hoverElement) {
        return
      }
      const type: ControlType = context.hoverElement?.control?.type as ControlType
      command.insertFormControl({ type, context })
    }
  },
  {
    key: DELETE,
    i18nPath: 'contextmenu.control.delete',
    icon: 'delete',
    when: payload => {
      return (
        !payload.isReadonly &&
        !payload.editorHasSelection &&
        !!payload.startElement?.controlId
      )
    },
    callback: (command: Command) => {
      command.executeRemoveControl()
    }
  }
]
