<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="400"
      :maskClosable="false"
      title="表格行属性"
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

  import {ConfigProvider,Modal,CheckboxGroup,Checkbox,Button,Input,Divider,Popover} from 'ant-design-vue';
import { CommandAdapt } from '../../core/command/CommandAdapt'
  
  const AConfigProvider = ConfigProvider
  const AModal = Modal
  const ACheckboxGroup = CheckboxGroup
  const ACheckbox = Checkbox
  const ADivider = Divider
  const APopover = Popover
  const AButton = Button;
  const AInput = Input;

  // 表格属性
  // 编号
  // 用户可调整行高、可调整列宽、可新增行、可删除行、可删除表格
  // 可见表达式
  // 自定义属性
  // 数据源渲染

  // 行属性
  // 行背景色
  // 可见表达式
  
  // 单元格属性
  // 赋值表达式
  // 水平对齐方式：居左、居中、居右
  // 垂直对齐方式：靠上、居中、靠下
  // 边距：上下左右
  // 斜线分割

  // const props = withDefaults(defineProps<FormControlModalProps>(), {})

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
        title: '背景色',
        field: 'background',
        type: FormInputType.COLOR,
      },
      // {
      //   title: '可见表达式',
      //   field: 'visibleExpression',
      //   type: FormInputType.INPUT,
      // },
      // {
      //   title: '打印可见表达式',
      //   field: 'printVisibleExpression',
      //   type: FormInputType.INPUT,
      //   titleWidth: 120,
      // },
      // {
      //   title: '数据源',
      //   field: 'valuePath',
      //   type: FormInputType.INPUT,
      //   props: {
      //     placeholder: '如：root.a.b[0].c',
      //   },
      // },
    ],
    formData:{}
  })

  const baseFormRef = ref()

  
  if (props.context && props.context.isInTable && props.context.hoverElement && props.context.hoverElement.trAttr) {
    initTableRowAttrData(props.context.hoverElement.trAttr)
  }
  function initTableRowAttrData(trAttr:any){
    
    if (!trAttr) {
      return
    }
    // let switchGroupValue = []
    // for (let i = 0; i < switchOptions.length; i++) {
    //   const item = switchOptions[i];
    //   if (tableAttr.useActionAuth[item.value as keyof ITableAttrUserActionAuth]) {
    //     switchGroupValue.push(item.value)
    //   }
    // }
    // state.switchGroupValue = switchGroupValue
    state.formData = trAttr
  }

  async function onModalSubmit() {
    const baseFormData = await baseFormRef.value.onSubmit()
    props.command.setTableRowAttr(baseFormData)
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
