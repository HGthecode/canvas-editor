import { INTERNAL_CONTEXT_MENU_KEY } from '../../../dataset/constant/ContextMenu'
import { ImageDisplay } from '../../../dataset/enum/Common'
import { ElementType } from '../../../dataset/enum/Element'
import { EditorMode } from '../../../dataset/enum/Editor'

import {
  IContextMenuContext,
  IRegisterContextMenu
} from '../../../interface/contextmenu/ContextMenu'
import { Command } from '../../command/Command'

const {
  CONTROL: { ATTR },
  IMAGE: {
    CHANGE,
    SAVE_AS,
    TEXT_WRAP,
    TEXT_WRAP_EMBED,
    TEXT_WRAP_UP_DOWN,
    TEXT_WRAP_FLOAT_TOP,
    TEXT_WRAP_FLOAT_BOTTOM
  }
} = INTERNAL_CONTEXT_MENU_KEY

export const imageMenus: IRegisterContextMenu[] = [
  {
    key: ATTR,
    i18nPath: 'contextmenu.control.attr',
    icon: 'attr',
    when: payload => {
      return (
        payload.mode === EditorMode.EDIT &&
        payload.hoverElement?.type === ElementType.IMAGE && 
        !payload.isReadonly &&
        payload.hoverElement?.extension &&
        payload.hoverElement?.extension.type
      )
    },
    callback: (command: Command,context: IContextMenuContext) => {
      if (!context.hoverElement) {
        return
      }
      const extensionType = context.hoverElement?.extension?.type
      // console.log(context.hoverIndex, context.hoverIndex)

      const position = command.getPosition()

      if (context.hoverEnv) {
        position.adjustPositionContext({
          x: context.hoverEnv.offsetX,
          y: context.hoverEnv.offsetY,
        })
      }
      command.executeSetRange(context.hoverIndex, context.hoverIndex)
      if (extensionType && extensionType === 'barcode') {
        command.insertBarcode({context})
      } else if (extensionType && extensionType === 'qrcode') {
        command.insertQrcode({context})
      } else if (extensionType && extensionType === 'medicalFormulas') {
        command.insertMedicalFormulas({context})
      }
    }
  },
  {
    key: CHANGE,
    i18nPath: 'contextmenu.image.change',
    icon: 'image-change',
    when: payload => {
      return (
        !payload.isReadonly &&
        !payload.editorHasSelection &&
        payload.startElement?.type === ElementType.IMAGE
      )
    },
    callback: (command: Command) => {
      // 创建代理元素
      const proxyInputFile = document.createElement('input')
      proxyInputFile.type = 'file'
      proxyInputFile.accept = '.png, .jpg, .jpeg'
      // 监听上传
      proxyInputFile.onchange = () => {
        const file = proxyInputFile.files![0]!
        const fileReader = new FileReader()
        fileReader.readAsDataURL(file)
        fileReader.onload = () => {
          const value = fileReader.result as string
          command.executeReplaceImageElement(value)
        }
      }
      proxyInputFile.click()
    }
  },
  {
    key: SAVE_AS,
    i18nPath: 'contextmenu.image.saveAs',
    icon: 'image',
    when: payload => {
      return (
        !payload.editorHasSelection &&
        payload.startElement?.type === ElementType.IMAGE
      )
    },
    callback: (command: Command) => {
      command.executeSaveAsImageElement()
    }
  },
  {
    key: TEXT_WRAP,
    i18nPath: 'contextmenu.image.textWrap',
    when: payload => {
      return (
        !payload.isReadonly &&
        !payload.editorHasSelection &&
        payload.startElement?.type === ElementType.IMAGE
      )
    },
    childMenus: [
      {
        key: TEXT_WRAP_EMBED,
        i18nPath: 'contextmenu.image.textWrapType.embed',
        when: () => true,
        callback: (command: Command, context: IContextMenuContext) => {
          command.executeChangeImageDisplay(
            context.startElement!,
            ImageDisplay.BLOCK
          )
        }
      },
      {
        key: TEXT_WRAP_UP_DOWN,
        i18nPath: 'contextmenu.image.textWrapType.upDown',
        when: () => true,
        callback: (command: Command, context: IContextMenuContext) => {
          command.executeChangeImageDisplay(
            context.startElement!,
            ImageDisplay.INLINE
          )
        }
      },
      {
        key: TEXT_WRAP_FLOAT_TOP,
        i18nPath: 'contextmenu.image.textWrapType.floatTop',
        when: () => true,
        callback: (command: Command, context: IContextMenuContext) => {
          command.executeChangeImageDisplay(
            context.startElement!,
            ImageDisplay.FLOAT_TOP
          )
        }
      },
      {
        key: TEXT_WRAP_FLOAT_BOTTOM,
        i18nPath: 'contextmenu.image.textWrapType.floatBottom',
        when: () => true,
        callback: (command: Command, context: IContextMenuContext) => {
          command.executeChangeImageDisplay(
            context.startElement!,
            ImageDisplay.FLOAT_BOTTOM
          )
        }
      }
    ]
  }
]
