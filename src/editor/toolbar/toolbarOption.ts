import {markRaw} from 'vue'
import BaseComponent from './BaseComponent.vue'
import FontComponent from './FontComponent.vue'
import FontSizeComponent from './FontSizeComponent.vue'
import ColorComponent from './ColorComponent.vue'
import TitleComponent from './TitleComponent.vue'
import DropdownComponent from './DropdownComponent.vue'
import {defaultRowMarginOptions,defaultListStyleOptions,defaultSeparatorOptions} from '../dataset/constant/Editor'
import FormControls from './FormControls.vue'
import TableComponent from './TableComponent.vue'
import { ToolbarComponentChangeParams, ToolbarComponentClickParams } from '../interface/Toolbar'
import { IRangeStyle } from '../interface/Listener'
import {ControlType, ElementType, ListType, RowFlex} from '../'






export default [
        {
          name: '保存',
          code: 'save',
          icon: 'icon-save',
          hotKey: 'Ctrl+S',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            console.log('保存')
            const json = command.getValue()
            console.log(json)
            

          },
        },
        {
          name: '撤销',
          code: 'undo',
          icon: 'icon-undo',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeUndo()
          },
          onDisabled: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle && rangeStyle.undo ? false : true
          },
        },
        {
          name: '重做',
          code: 'redo',
          icon: 'icon-redo',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeRedo()
          },
          onDisabled: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle && rangeStyle.redo ? false : true
          },
        },
        {
          name: '格式刷',
          code: 'painter',
          icon: 'icon-painter',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick:  ({command}:ToolbarComponentClickParams) => {
            command.executePainter({isDblclick: false,})
          },
          onActive: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle ? rangeStyle.painter : false
          },
        },
        {
          name: '清除格式',
          code: 'format',
          icon: 'icon-format',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeFormat()
          },
        },
        {
          name: '字体',
          code: 'font',
          component: markRaw(FontComponent),
          onChange: ({command,value}:ToolbarComponentChangeParams) => {
            command.executeFont(value)
          },
        },
        {
          name: '字号',
          code: 'fontSize',
          component: markRaw(FontSizeComponent),
          onChange: ({command,value}:ToolbarComponentChangeParams) => {
            command.executeSize(Number(value))
          },
        },
        {
          name: '增大字号',
          code: 'sizeAdd',
          icon: 'icon-font-add',
          component: markRaw(BaseComponent),
          onClick:  ({command}:ToolbarComponentClickParams) => {
            command.executeSizeAdd()
          },
        },
        {
          name: '减小字号',
          code: 'sizeMinus',
          icon: 'icon-font-minus',
          component: markRaw(BaseComponent),
          onClick:  ({command}:ToolbarComponentClickParams) => {
            command.executeSizeMinus()
          },
        },
        {
          name: '加粗',
          code: 'blob',
          icon: 'icon-blob',
          hotKey: 'Ctrl+B',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeBold()
          },
          onActive: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle ? rangeStyle.bold : false
          },
        },
        {
          name: '倾斜',
          code: 'italic',
          icon: 'icon-italic',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeItalic()
          },
          onActive: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle ? rangeStyle.italic : false
          },
        },
        {
          name: '下划线',
          code: 'underline',
          icon: 'icon-underline',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeUnderline()
          },
          onActive: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle ? rangeStyle.underline : false
          },
        },
        {
          name: '删除线',
          code: 'strikeout',
          icon: 'icon-strikeout',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeStrikeout()
          },
          onActive: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle ? rangeStyle.strikeout : false
          },
        },
        {
          name: '上标',
          code: 'superscript',
          icon: 'icon-superscript',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeSuperscript()
          },
          onActive: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle?.type === ElementType.SUPERSCRIPT
          },
        },
        {
          name: '下标',
          code: 'subscript',
          icon: 'icon-subscript',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeSubscript()
          },
          onActive: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle?.type === ElementType.SUBSCRIPT
          },
        },
        {
          name: '字体颜色',
          code: 'color',
          icon: 'icon-font',
          hotKey: 'Ctrl+I',
          component: markRaw(ColorComponent),
          onChange: ({command,value}:ToolbarComponentChangeParams) => {
            command.executeColor(value)
          },
          props: {
            valueField: 'color',
            defaultValue: '#000000',
          },
        },
        {
          name: '背景颜色',
          code: 'background',
          icon: 'icon-background',
          hotKey: 'Ctrl+I',
          component: markRaw(ColorComponent),
          onChange: ({command,value}:ToolbarComponentChangeParams) => {
            command.executeHighlight(value)
          },
          props: {
            valueField: 'highlight',
            defaultValue: '#ffffff',
          },
        },
        {
          name: '标题',
          code: 'title',
          component: markRaw(TitleComponent),
          onChange: ({command,value}:ToolbarComponentChangeParams) => {
            command.executeTitle(value || null)
          },
        },
        {
          name: '左对齐',
          code: 'left',
          icon: 'icon-align-left',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeRowFlex(RowFlex.LEFT)
          },
          onActive: (rangeStyle:IRangeStyle|null) => {
            return !rangeStyle?.rowFlex || rangeStyle?.rowFlex === RowFlex.LEFT
          },
        },
        {
          name: '居中对齐',
          code: 'center',
          icon: 'icon-align-center',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeRowFlex(RowFlex.CENTER)
          },
          onActive: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle?.rowFlex === RowFlex.CENTER
          },
        },
        {
          name: '右对齐',
          code: 'right',
          icon: 'icon-align-right',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeRowFlex(RowFlex.RIGHT)
          },
          onActive: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle?.rowFlex === RowFlex.RIGHT
          },
        },
        {
          name: '分散对齐',
          code: 'justify',
          icon: 'icon-align-justify',
          hotKey: 'Ctrl+I',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executeRowFlex(RowFlex.ALIGNMENT)
          },
          onActive: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle?.rowFlex === RowFlex.ALIGNMENT
          },
        },
        {
          name: '行间距',
          code: 'rowMargin',
          icon: 'icon-row-margin',
          hotKey: 'Ctrl+I',
          component: markRaw(DropdownComponent),
          onChange: ({command,value}:ToolbarComponentChangeParams) => {
            command.executeRowMargin(value)
          },
          props: {
            valueField: 'rowMargin',
            options: defaultRowMarginOptions,
          },
        },
        {
          name: '列表',
          code: 'list',
          icon: 'icon-list',
          hotKey: 'Ctrl+I',
          component: markRaw(DropdownComponent),
          onChange: ({command,value}:ToolbarComponentChangeParams) => {
            let listType: ListType | null = null
            if (value) {
              listType = value == 'decimal' ? ListType.OL : ListType.UL
            }
            command.executeList(listType, value)
          },
          props: {
            valueField: 'listStyle',
            options: defaultListStyleOptions,
          },
        },
        {
          name: '表单控件',
          code: 'formControls',
          icon: 'icon-add',
          component: markRaw(FormControls),
        },
        {
          name: '插入文本域',
          code: 'textControl',
          icon: 'icon-text-s',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.insertFormControl({type:ControlType.TEXT})
          },
        },
        {
          name: '插入单选框',
          code: 'radioControl',
          icon: 'icon-radio',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.insertFormControl({type:ControlType.RADIO})
          },
        },
        {
          name: '插入复选框',
          code: 'checkboxControl',
          icon: 'icon-checkbox',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.insertFormControl({type:ControlType.CHECKBOX})
          },
        },
        {
          name: '插入下拉框',
          code: 'selectControl',
          icon: 'icon-select',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.insertFormControl({type:ControlType.SELECT})
          },
        },
        {
          name: '插入日期',
          code: 'dateControl',
          icon: 'icon-date',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.insertFormControl({type:ControlType.DATE})
          },
        },
        {
          name: '插入表格',
          code: 'table',
          icon: 'icon-table',
          component: markRaw(TableComponent),
          onChange:  ({command,value}:ToolbarComponentChangeParams) => {
            command.executeInsertTable(value.rowIndex, value.colIndex)
          },
          onDisabled: (rangeStyle:IRangeStyle|null) => {
            return rangeStyle ? false : true
          },
        },
        {
          name: '插入图片',
          code: 'image',
          icon: 'icon-image',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.insertImage()
          },
        },
        {
          name: '插入超链接',
          code: 'link',
          icon: 'icon-link',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.insertLink({})
          },
        },
        {
          name: '分割线',
          code: 'separator',
          icon: 'icon-separator',
          component: markRaw(DropdownComponent),
          onChange:  ({command,value}:ToolbarComponentChangeParams) => {
            let payload: number[] = []
            const separatorDash = value.split(',').map(Number)
            if (separatorDash) {
              const isSingleLine = separatorDash.every((d:number) => d === 0)
              if (!isSingleLine) {
                payload = separatorDash
              }
            }
            command.executeSeparator(payload)
          },
          props: {
            valueField: 'listStyle',
            options: defaultSeparatorOptions.map((p:any)=>{
              p.class=p.name
              return p
            }),
          },
        },
        {
          name: '分页符',
          code: 'pageBreak',
          icon: 'icon-page-break',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executePageBreak()
          },
        },
        {
          name: '搜索与替换',
          code: 'search',
          icon: 'icon-search',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.searchReplace()
          },
        },
        {
          name: '打印',
          code: 'print',
          icon: 'icon-print',
          component: markRaw(BaseComponent),
          onClick: ({command}:ToolbarComponentClickParams) => {
            command.executePrint()
          },
        },
      ]