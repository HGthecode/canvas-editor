<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="600"
      :maskClosable="false"
      title="表格单元格属性"
      destroyOnClose
      @ok="onModalSubmit"
      @cancel="onModalCancel"
    >
      <data-form
        ref="baseFormRef"
        :colspan="1"
        :items="state.formItems"
        :data="state.formData"
      >
       <template #paddingSlot>
          <PaddingInput v-model:value="cellPadding"/>

       </template>
      </data-form>
      
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { reactive,onMounted, PropType,ref } from 'vue'
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'
  import DataForm from '../../components/DataForm'
  import { FormInputType, FormItemType } from '../../components/DataForm/interface'

  import {ConfigProvider,Modal} from 'ant-design-vue';
  import { CommandAdapt } from '../../core/command/CommandAdapt'
  import PaddingInput from './PaddingInput.vue';

  
  const AConfigProvider = ConfigProvider
  const AModal = Modal

  const props = defineProps({
    context: {
      type: Object as PropType<IContextMenuContext>,
      default: () => {
        return {}
      },
    },
    onSubmit: {
      type: Function,
      default: () => {
        return {}
      },
    },
    onCancel: {
      type: Function,
      default: () => {
        return
      },
    },
    command:{
      type:Object as PropType<CommandAdapt>,
      default:()=>{}
    }
  })


  
  onMounted(() => {
    state.visible = true
  })

  const state = reactive<{
    visible: boolean
    title: string
    formItems:FormItemType[]
    formData:any
  }>({
    visible: false,
    title: '',
    formItems:[
      {
        title: '水平对齐',
        field: 'horizontalAlign',
        type: FormInputType.BUTTONRADIOGROUP,
        props:{
          options:[
            {
              value:'left',
              label:'左对齐'
            },
            {
              value:'center',
              label:'居中对齐'
            },
            {
              value:'right',
              label:'右对齐'
            }
          ]
        }
      },
      {
        title: '垂直对齐',
        field: 'verticalAlign',
        type: FormInputType.BUTTONRADIOGROUP,
        props:{
          options:[
            {
              value:'top',
              label:'顶端对齐'
            },
            {
              value:'center',
              label:'居中对齐'
            },
            {
              value:'bottom',
              label:'底端对齐'
            }
          ]
        }
      },
      {
        title: '内边距',
        field: 'padding',
        type: FormInputType.SLOT,
        slot:"paddingSlot"
      },
    ],
    formData:{}
  })

  const baseFormRef = ref()
  const cellPadding = ref<number[]>([0,0,0,0])
  console.log(props.context);
  
  if (props.context && props.context.isInTable && props.context.hoverElement && props.context.hoverElement.tdAttr) {
    initTableColAttrData(props.context.hoverElement.tdAttr)
  }
  function initTableColAttrData(tdAttr:any){
    
    if (!tdAttr) {
      return
    }
    cellPadding.value = tdAttr.padding
    state.formData = tdAttr
  }

  async function onModalSubmit() {
    const baseFormData = await baseFormRef.value.onSubmit()
    baseFormData.padding = cellPadding.value
    console.log(baseFormData);
    
    props.command.setTableColAttr(baseFormData)
    onModalCancel()
  }
  function onModalCancel() {
    state.visible = false
  }
  
</script>

<style lang="css" scoped>
  .switch-group{
    &:deep(.ant-checkbox-group-item){
      width: 140px;
    }
  }
</style>
