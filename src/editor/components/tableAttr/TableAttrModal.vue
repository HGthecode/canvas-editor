<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="600"
      :maskClosable="false"
      title="表格属性"
      destroyOnClose
      @ok="onModalSubmit"
      @cancel="onModalCancel"
    >
    <!-- <a-divider orientation="left">属性</a-divider> -->
      <data-form
        ref="baseFormRef"
        :colspan="1"
        :items="state.formItems"
        :data="state.formData"
      >
       <template #switchGroup>        
         <a-checkbox-group class="switch-group" v-model:value="state.switchGroupValue" :options="switchOptions" @change="onSwitchGroupChange">
         </a-checkbox-group>
       </template>
      </data-form>
      <!--
      <a-divider orientation="left">数据源</a-divider>
      <div>
        <div class="form-item">
          <div class="form-item-label tr" style="width:100px">数据值路径</div>
          <div class="form-item-content">
            <a-input size="small" v-model:value="state.dataSourceValuePath" placeholder="如：root.a.b[0].c"/>
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label tr" style="width:100px">表格列配置</div>
          <div class="form-item-content">
            <EditTable
              v-bind="state.dataSourceTableOption"
              :data="state.dataSourceTableData"
              @addRow="onDataSourceTableAddRow"
              @deleteRow="onDataSourceTableDeleteRow"
            />
          </div>
        </div>
      </div>-->
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { reactive,onMounted, PropType,ref } from 'vue'
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'
  import DataForm from '../../components/DataForm'
  import { FormInputType, FormItemType } from '../../components/DataForm/interface'

  import {ConfigProvider,Modal,CheckboxGroup,Divider,Input} from 'ant-design-vue';
import { CheckboxValueType } from 'ant-design-vue/es/checkbox/interface'
import { CommandAdapt } from '../../core/command/CommandAdapt'
import { ITableAttrOption, ITableAttrUserActionAuth } from '../../interface/Element'
  // import {CheckboxValueType} from 'ant-design-vue';
  // import EditTable from '../../components/EditTable'
  // import { EditTableProps } from '../../components/EditTable/types'
// import { getUUID } from '../../utils'

  
  const AConfigProvider = ConfigProvider
  const AModal = Modal
  const ACheckboxGroup = CheckboxGroup
  const ADivider = Divider
  // const AInput = Input


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

  
  

  const switchOptions = [
    {label:"用户可调整行高",value:"adjustRowHeight"},
    {label:"用户可调整列宽",value:"adjustColWidth"},
    {label:"用户可新增行",value:"addRow"},
    {label:"用户可新增列",value:"addCol"},
    {label:"用户可删除行",value:"removeRow"},
    {label:"用户可删除列",value:"removeCol"},
    {label:"用户可删除表格",value:"removeTable"},
  ]
  
  onMounted(() => {
    state.visible = true
  })

  const state = reactive<{
    visible: boolean
    title: string
    formItems:FormItemType[]
    formData:any
    switchGroupValue:CheckboxValueType[]
    // dataSourceTableOption: EditTableProps
    // dataSourceTableData: any
    // dataSourceValuePath: string
  }>({
    visible: false,
    title: '',
    formItems:[
      {
        title: '编号',
        field: 'code',
        type: FormInputType.INPUT,
      },
      {
        title: '',
        field: 'switchGroup',
        titleWidth:0,
        colon:false,
        type: FormInputType.SLOT,
        slot:"switchGroup"
      },
      {
        title: '可见表达式',
        field: 'visibleExpression',
        type: FormInputType.INPUT,
      },
      {
        title: '打印可见表达式',
        field: 'printVisibleExpression',
        type: FormInputType.INPUT,
        titleWidth: 120,
      },
      // {
      //   title: '数据源',
      //   field: 'valuePath',
      //   type: FormInputType.INPUT,
      //   props: {
      //     placeholder: '如：root.a.b[0].c',
      //   },
      // },
    ],
    formData:{
    },
    switchGroupValue:[],
    // dataSourceValuePath:'',
    // dataSourceTableOption: {
    //   isAdd: true,
    //   notDataHiddenTable:true,
    //   columns: [
    //     {
    //       title: '列名',
    //       dataIndex: 'title',
    //       itemRender: {
    //         name: 'input',
    //       },
    //     },
    //     {
    //       title: '字段',
    //       dataIndex: 'field',
    //       itemRender: {
    //         name: 'input',
    //       },
    //     },
    //     {
    //       title: '宽度',
    //       dataIndex: 'width',
    //       itemRender: {
    //         name: 'number',
    //       },
    //     },
    //     {
    //       title: '操作',
    //       dataIndex: 'id',
    //       itemRender: {
    //         name: 'delete-button',
    //       },
    //     },
    //   ],
    //   data: [{ title: '', field: '', width: '' }],
    // },
    // dataSourceTableData: [],
  })

  const baseFormRef = ref()
console.log(props.context);

  if (props.context && props.context.isInTable && props.context.hoverElement && props.context.hoverElement.tableAttr) {
    initTableAttrData(props.context.hoverElement.tableAttr)
    
    
  }
  function initTableAttrData(tableAttr:ITableAttrOption){
    if (!tableAttr) {
      return
    }
    let switchGroupValue = []
    for (let i = 0; i < switchOptions.length; i++) {
      const item = switchOptions[i];
      if (tableAttr.useActionAuth[item.value as keyof ITableAttrUserActionAuth]) {
        switchGroupValue.push(item.value)
      }
    }
    state.switchGroupValue = switchGroupValue
    // state.dataSourceValuePath = tableAttr.dataSourceValuePath
    // state.dataSourceTableData = tableAttr.dataSourceTableColumns || []
    state.formData = tableAttr
  }
  async function onModalSubmit() {
    const baseFormData = await baseFormRef.value.onSubmit()
    let useActionAuth:ITableAttrUserActionAuth = {}
    for (let i = 0; i < switchOptions.length; i++) {
      const item = switchOptions[i];
      if (state.switchGroupValue.includes(item.value)) {
        useActionAuth[item.value as keyof ITableAttrUserActionAuth] = true
      }else{
        useActionAuth[item.value as keyof ITableAttrUserActionAuth] = false
      }
    }
    baseFormData.useActionAuth = useActionAuth
    // baseFormData.dataSourceTableColumns = state.dataSourceTableData
    // baseFormData.dataSourceValuePath = state.dataSourceValuePath

    props.command.setTableAttr(baseFormData)
    
    onModalCancel()
  }
  function onModalCancel() {
    state.visible = false
  }
  function onSwitchGroupChange(value:CheckboxValueType[]){
    console.log(value);
    // state.formData.switchGroup = value
    
  }
  // function onDataSourceTableAddRow() {
  //   state.dataSourceTableData.push({
  //     id: `-${getUUID()}`,
  //   })
  // }
  // function onDataSourceTableDeleteRow(row:any) {
  //   state.dataSourceTableData = state.dataSourceTableData.filter((p:any) => p.id != row.id)
  // }
  
</script>

<style lang="css" scoped>
  .switch-group{
    &:deep(.ant-checkbox-group-item){
      width: 140px;
    }
  }
</style>
