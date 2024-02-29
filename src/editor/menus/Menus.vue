<template>
  <div class="editor-menu-main">
    <a-space>
      <a-dropdown v-for="(group,gindex) in menuData" :key="gindex" :arrow="{ pointAtCenter: true }">
        <div class="editor-item-button"> {{group.name}} </div>
        <template #overlay>
          <a-menu class="editor-menu" :selected-keys="[]">
            <template v-for="(item,index) in group.children" :key="index">
              <template v-if="item.children && item.children?.length">
                <a-sub-menu  :key="index" :title="item.name">
                  <template #icon>
                    <i :class="['iconfont',item.icon]"></i>
                  </template>
                  <a-menu-item
                    v-for="(citem,cindex) in item.children"
                    :key="cindex"
                    @click="
                      () => {
                        onClick(item,citem)
                      }
                    "
                  >
                    <span v-if="citem.style" :style="citem.style">{{ citem.name }}</span>
                    <span v-if="citem.class" :class="citem.class"></span>
                    <span v-else>{{ citem.name }}</span>
  
                  </a-menu-item>
                </a-sub-menu>
              </template>
              <template  v-else>
                <a-menu-item
                :key="index"
                @click="
                  () => {
                    onClick(item)
                  }
                "
              >
                <template #icon>
                  <!-- <i :class="['menu-icon',item.icon]"></i> -->
                  <i :class="['iconfont',item.icon]"></i>
                </template>
                <span>{{item.name}}</span>
              </a-menu-item>
              </template>
            </template>
            
          </a-menu>
        </template>
      </a-dropdown>
    </a-space>
  </div>

</template>

<script setup lang='ts'>
import {PropType} from 'vue';
import { Command } from '../core/command/Command'
import {IEditorOption} from '../interface/Editor';
import { defaultListStyleOptions,defaultSeparatorOptions } from '../dataset/constant/Editor';
import { RowFlex } from '../dataset/enum/Row';
import {  ListType } from '../dataset/enum/List';
import { ControlType } from '../dataset/enum/Control';

import {
  Dropdown,
  Menu,
  MenuItem,
  SubMenu,
  Space 
} from 'ant-design-vue';
const ADropdown = Dropdown;
const AMenu = Menu;
const AMenuItem = MenuItem;
const ASubMenu = SubMenu;
const ASpace = Space;



const props = defineProps({
    command: {
      type: Command as PropType<Command>,
      default: ()=>{},
    },
    editorOption: {
      type: Object as PropType<IEditorOption>,
      default: ()=>{},
    },
})

interface MenuItem {
  name?:string
  key:string | number | undefined
  icon?:string
  children?:MenuItem[]
  style?:any
  class?:any
  onClick?:()=>void
}

const menuData:MenuItem[] = [
  {
    name:"文件",
    key:"file",
    children:[
      {
        name:"打开",
        icon:"icon-doc-vertical",
        key:"open"
      },
      {
        name:"保存",
        icon:"icon-save",
        key:"save"
      },
      {
        name:"导出",
        icon:"icon-export",
        key:"export"
      },
      {
        name:"打印",
        icon:"icon-print",
        key:"executePrint"
      },
      // {
      //   name:"取消打印预览",
      //   icon:"icon-preview",
      //   key:"preview"
      // },
      {
        name:"页面设置",
        icon:"icon-doc-setting",
        key:"settingPage"
      },
    ]
  },
  {
    name:"格式",
    key:"format",
    children:[
      {
        name:"格式刷",
        icon:"icon-painter",
        key:"painter"
      },
      {
        name:"粗体",
        icon:"icon-blob",
        key:"executeBold"
      },
      {
        name:"斜体",
        icon:"icon-italic",
        key:"executeItalic"
      },
      {
        name:"下划线",
        icon:"icon-underline",
        key:"executeUnderline"
      },
      {
        name:"删除线",
        icon:"icon-strikeout",
        key:"executeStrikeout"
      },
      {
        name:"字号",
        icon:"icon-font-size",
        key:"executeSize",
        children:props.editorOption.fontSizeOptions?.map(p=>{
          return {
            name:p.name,
            key:p.value,
          }
        })
      },
      {
        name:"字体",
        icon:"icon-font",
        key:"executeFont",
        children:props.editorOption.fontOptions?.map(p=>{
          return {
            name:p.name,
            key:p.value,
            style:{'font-family':p.value}
          }
        })
      },
    ]
  },
  {
    name:"段落",
    key:"paragraph",
    children:[
      {
        name:"居左",
        icon:"icon-align-left",
        key:"executeRowFlex",
        onClick:()=>{
          props.command.executeRowFlex(RowFlex.LEFT)
        }
      },
      {
        name:"居中",
        icon:"icon-align-center",
        key:"executeRowFlex",
        onClick:()=>{
          props.command.executeRowFlex(RowFlex.CENTER)
        }
      },
      {
        name:"居右",
        icon:"icon-align-right",
        key:"executeRowFlex",
        onClick:()=>{
          props.command.executeRowFlex(RowFlex.RIGHT)
        }
      },
      {
        name:"分散对齐",
        icon:"icon-align-justify",
        key:"executeRowFlex",
        onClick:()=>{
          props.command.executeRowFlex(RowFlex.ALIGNMENT)
        }
      },
      {
        name:"首行缩进",
        icon:"icon-indent",
        key:"indent"
      },
      {
        name:"行间距",
        icon:"icon-row-margin",
        key:"executeRowMargin",
        children:props.editorOption.rowMarginOptions?.map(p=>{
          return {
            name:p.name,
            key:p.value,
          }
        })
      },
      {
        name:"列表样式",
        icon:"icon-row-margin",
        key:"setListStyle",
        children:defaultListStyleOptions.map(p=>{
          return {
            name:p.name,
            key:p.value,
            onClick:()=>{
              const style:any = p.value
              let listType: ListType | null = null
              if (style) {
                listType = style == 'decimal' ? ListType.OL : ListType.UL
              }
              props.command.executeList(listType, style)
            }
          }
        })
      },
    ]
  },
  {
    name:"常规",
    key:"common",
    children:[
      {
        name:"剪切",
        icon:"icon-shear",
        key:"executeCut"
      },
      {
        name:"复制",
        icon:"icon-copy",
        key:"executeCopy"
      },
      {
        name:"粘贴",
        icon:"icon-paste",
        key:"executePaste"
      },
      {
        name:"撤销",
        icon:"icon-undo",
        key:"executeUndo"
      },
      {
        name:"重做",
        icon:"icon-redo",
        key:"executeRedo"
      },
      {
        name:"清除格式",
        icon:"icon-format",
        key:"executeFormat"
      },
      {
        name:"查找&替换",
        icon:"icon-search-1",
        key:"searchReplace",
      },
      
    ]
  },
  {
    name:"插入",
    key:"insert",
    children:[
      {
        name:"插入表格",
        icon:"icon-table",
        key:"insertTable"
      },
      {
        name:"插入图片",
        icon:"icon-image",
        key:"insertImage",
      },
      {
        name:"插入文本域",
        icon:"icon-text-s",
        key:"insertTextControl",
        onClick:()=>{
          props.command.insertFormControl({
            type: ControlType.TEXT,
          })
        }
      },
      {
        name:"插入单选框",
        icon:"icon-radio",
        key:"insertRadioControl",
        onClick:()=>{
          props.command.insertFormControl({
            type: ControlType.RADIO,
          })
        }
      },
      {
        name:"插入复选框",
        icon:"icon-checkbox",
        key:"insertCheckboxControl",
        onClick:()=>{
          props.command.insertFormControl({
            type: ControlType.CHECKBOX,
          })
        }
      },
      {
        name:"插入下拉框",
        icon:"icon-select",
        key:"insertSelectControl",
        onClick:()=>{
          props.command.insertFormControl({
            type: ControlType.SELECT,
          })
        }
      },
      {
        name:"插入日期",
        icon:"icon-date",
        key:"insertDateControl",
        onClick:()=>{
          props.command.insertFormControl({
            type: ControlType.DATE,
          })
        }
      },
      {
        name:"插入条形码",
        icon:"icon-brcode",
        key:"insertBarcode",
        // onClick:()=>{
        //   props.command.insertFormControl({
        //     type: ControlType.DATE,
        //   })
        // }
      },
      {
        name:"插入二维码",
        icon:"icon-qrcode",
        key:"insertQrcode",
      },
      {
        name:"插入超链接",
        icon:"icon-link",
        key:"insertLink",
      }, {
        name:"插入特殊符号",
        icon:"icon-omega",
        key:"insertSymbol",
      }, {
        name:"插入医学表达式",
        icon:"icon-doctor",
        key:"insertMedicalFormulas",
      },
      {
        name:"插入LaTeX公式",
        icon:"icon-latex",
        key:"insertLatex",
      },
      {
        name:"插入签名",
        icon:"icon-edit",
        key:"insertSign",
      },
    ]
  },
  {
    name:"其它",
    key:"other",
    children:[
      {
        name:"分割线",
        icon:"icon-separator",
        key:"separator",
        children:defaultSeparatorOptions.map(p=>{
          return {
            key:p.value,
            class:p.name,
            onClick:()=>{
              const value = p.value as string
              let payload: number[] = []
              const separatorDash = value.split(',').map(Number)
              if (separatorDash) {
                const isSingleLine = separatorDash.every((d) => d === 0)
                if (!isSingleLine) {
                  payload = separatorDash
                }
              }
              props.command.executeSeparator(payload)
            }
          }
        })
      },
      {
        name:"水印",
        icon:"icon-watermark",
        key:"settingWatermark"
      },
    ]
  },
]



// const emit = defineEmits<{
//     (event: 'menuClick', key: string): void
//   }>()

function onClick(item:any,citem:any=""){
    console.log(item,citem);
    const command:any = props.command
    const funName:string = item.key
    if (item.onClick) {
      item.onClick(item)
      return
    }
    if (citem.onClick) {
      citem.onClick(citem)
      return
    }
    if (command[funName]) {
      let value = null
      if (citem && citem.key) {
        value = citem.key
      }
      command[funName](value)
    }
    // props.command.executeBold()
    
    // emit("menuClick",'test')
}
</script>
