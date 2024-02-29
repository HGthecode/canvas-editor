import {IToolbarOption} from '../../interface/Toolbar'
import { ToolbarCode } from '../enum/Toolbar'

export const defaultToolbarOption: Readonly<Required<IToolbarOption>> = {
    show:true,
    tools:[
      [
        ToolbarCode.SAVE,
        ToolbarCode.UNDO,
        ToolbarCode.REDO,
        ToolbarCode.PAINTER,
        ToolbarCode.FORMAT
      ],
      [
        ToolbarCode.FONT,
        ToolbarCode.FONTSIZE,
        ToolbarCode.SIZEADD,
        ToolbarCode.SIZEMINUS,
        ToolbarCode.BLOB,
        ToolbarCode.ITALIC,
        ToolbarCode.UNDERLINE,
        ToolbarCode.STRIKEOUT,
        ToolbarCode.SUPERSCRIPT,
        ToolbarCode.SUBSCRIPT,
        ToolbarCode.COLOR,
        ToolbarCode.BACKGROUND
      ],
      [
        ToolbarCode.TITLE,
        ToolbarCode.LEFT,
        ToolbarCode.CENTER,
        ToolbarCode.RIGHT,
        ToolbarCode.JUSTIFY,
        ToolbarCode.ROWMARGIN,
        ToolbarCode.LIST
      ],
      [
        ToolbarCode.FORMCONTROLS,
        ToolbarCode.TABLE,
        ToolbarCode.IMAGE,
        ToolbarCode.LINK,
        ToolbarCode.SEPARATOR,
        ToolbarCode.PAGEBREAK
      ],
      [
        ToolbarCode.SEARCH,
        ToolbarCode.PRINT
      ]
  ],
    // 表单项的codes
    formControlCodes:[
      ToolbarCode.TEXTCONTROL,
      ToolbarCode.RADIOCONTROL,
      ToolbarCode.CHECKBOXCONTROL,
      ToolbarCode.SELECTCONTROL,
      ToolbarCode.DATECONTROL
    ]
}