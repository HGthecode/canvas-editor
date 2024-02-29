
<template>
   <div class="editor-toolbar-main">
     <div class="editor-toolbar-wraper">
        <div v-for="(tools,index) in toolbarData" :key="index" class="editor-toolbar-group">
            <template v-for="(item,itemIndex) in tools"  >
                <component
                    v-if="item.component"
                    :key="itemIndex"
                    class="editor-toolbar-item"
                    :title="item.name"
                    :is="item.component"
                    :item="item"
                    @item-click="onItemClick"
                    @item-change="onItemChange"
                />
            </template>
        </div>
     </div>
   </div>
</template>

<script setup lang='ts'>
import {PropType,ref} from 'vue';
import { Command } from '../core/command/Command'
import { ToolbarCode } from '../dataset/enum/Toolbar';
// import { ObjectType } from '../interface/Common';
import {IEditorOption} from '../interface/Editor';
// import { IRangeStyle } from '../interface/Listener';
import { ToolbarItemOption } from '../interface/Toolbar';
import toolbarOptions from './toolbarOption';

// import {useEditorStore} from '../store';

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
const toolbarData = ref<ToolbarItemOption[][]>([])

function getToolbarData(){
    const toolbarConfig = props.editorOption.toolbar
    let data = []
    if (toolbarConfig) {
        let toolCodes:string[] = []
        let formControlsIndexs:number[] = []
        const tools = toolbarConfig.tools?toolbarConfig.tools:[]
        const toolbarOptionByCode:any = {}
        let formControlList = []
        for (let i = 0; i < toolbarOptions.length; i++) {
          const item = toolbarOptions[i];
          toolbarOptionByCode[item.code]=item
          if (toolbarConfig.formControlCodes && toolbarConfig.formControlCodes.length && toolbarConfig.formControlCodes.includes(item.code)) {
            formControlList.push(item)
          }
        }
        for (let i = 0; i < tools.length; i++) {
          const codes = tools[i];
          let items = []
          if (codes && codes.length) {
              for (let j = 0; j < codes.length; j++) {
                  const code = codes[j];
                  if (toolbarOptionByCode[code]) {
                      const item = toolbarOptionByCode[code]
                      items.push(item)
                      toolCodes.push(code)
                      if (code===ToolbarCode.FORMCONTROLS) {
                        formControlsIndexs=[i,j]
                      }
                  }
              }
          }
          data.push(items)
        }
        // 处理表单项
        if (toolCodes.includes(ToolbarCode.FORMCONTROLS) && formControlList.length) {
          if (formControlsIndexs.length===2) {
            data[formControlsIndexs[0]][formControlsIndexs[1]].props= {
              options: formControlList,
            }
          }
        }
    }
    return data
}

toolbarData.value = getToolbarData()

// const emit = defineEmits<{
//     (event: 'itemClick', item: ToolbarItemOption): void
//     (event: 'itemChange', value: any, item: ToolbarItemOption): void
//   }>()
  const onItemClick = (item: ToolbarItemOption) => {
    if (item.onClick) {
      item.onClick({item,command:props.command})
    }
    // emit('itemClick', item)
  }
  const onItemChange = (value: any, item: ToolbarItemOption) => {
    if (item.onChange) {
      item.onChange({value,item,command:props.command})
    }
    
    // emit('itemChange', value, item)
  }


</script>
