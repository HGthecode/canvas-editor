<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="600"
      :maskClosable="false"
      :title="state.title"
      destroyOnClose
      @ok="onModalSubmit"
      @cancel="onModalCancel"
    >
      <a-tabs @change="onTabsChange">
        <a-tab-pane key="base" tab="常规">
          <a-divider orientation="left">属性</a-divider>
          <data-form
            ref="baseFormRef"
            :colspan="2"
            :items="state.baseFormItems"
            :data="state.baseFormData"
          />
          <div class="form-item">
            <div class="form-item-label tr" style="width: 100px">自定义属性</div>
            <div class="form-item-content">
              <EditTable
                v-bind="state.customAttrTableOption"
                :data="state.customAttrTableData"
                @add-row="onCustomAttrTableAddRow"
                @delete-row="onCustomAttrTableDeleteRow"
                :not-data-hidden-table="true"
              />
            </div>
          </div>
          <a-divider orientation="left">数据源</a-divider>
          <data-form
            ref="dataSourceFormRef"
            :colspan="state.dataSourceFormItems.length === 1 ? 1 : 2"
            :items="state.dataSourceFormItems"
            :data="state.dataSourceFormData"
          />
          <div
            v-if="
              props.type === ControlType.CHECKBOX ||
              props.type === ControlType.RADIO ||
              props.type === ControlType.SELECT
            "
            class="form-item"
          >
            <div class="form-item-label tr" style="width: 100px">静态选项配置</div>
            <div class="form-item-content">
              <EditTable
                v-bind="state.staticOptionsTableOption"
                :data="state.staticOptionsTableData"
                @add-row="onStaticOptionsTableAddRow"
                @delete-row="onStaticOptionsTableDeleteRow"
                :not-data-hidden-table="true"
              />
            </div>
          </div>
          <!-- <a-divider orientation="left">自定义属性</a-divider>
          <EditTable
            v-bind="state.customAttrTableOption"
            :data="state.customAttrTableData"
            @add-row="onCustomAttrTableAddRow"
            @delete-row="onCustomAttrTableDeleteRow"
            :not-data-hidden-table="true"
          /> -->
        </a-tab-pane>
        <a-tab-pane key="verify" tab="校验">
          <data-form
            ref="verifyFormRef"
            :colspan="2"
            :items="state.verifyFormItems"
            :data="state.verifyFormData"
          />
          <VerifyRule ref="verifyRuleRef" />
        </a-tab-pane>
        <a-tab-pane key="event" tab="事件">
          <EventEditor ref="eventEditorRef" />
        </a-tab-pane>
        <a-tab-pane key="auth" tab="其它">
          <data-form ref="authFormRef" :items="state.authFormItems" :data="state.authFormData">
            <template #expressionSlot="item">
              <a-input v-model:value="state.authFormData[item.field]">
                <template #suffix>
                  <a-popover title="表达式示例">
                    <template #content>
                      <p>表单字段条件：[field_xx]==1</p>
                      <p>数据源值条件：[root.a.c]===1</p>
                      <p>多参数条件：[field_01]==1 && [field_02]==1</p>
                    </template>
                    <info-circle-outlined style="color: rgba(0, 0, 0, 0.45)" />
                  </a-popover>
                </template>
              </a-input>
            </template>
          </data-form>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { reactive,ref,onMounted, PropType } from 'vue'
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import { InfoCircleOutlined } from '@ant-design/icons-vue'

  import DataForm from '../../components/DataForm'
  import EditTable from '../../components/EditTable'
  import { EditTableProps } from '../../components/EditTable/types'
  import { FormInputType, FormItemType } from '../../components/DataForm/interface'
  import { FormControlModalProps, FormControlHooksResult } from './interface'
  import { ControlType } from '../../dataset/enum/Control'
  import { getNewFieldName, createRandKey } from '../../utils/helper'
  import useTextControl from './TextControl'
  import useRadioControl from './RadioControl'
  import useDateControl from './DateControl'
  import useCheckboxControl from './CheckboxControl'
  import useSelectControl from './SelectControl'
  import VerifyRule from './VerifyRule.vue'
  import EventEditor from './EventEditor.vue'
  import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'

  import {ConfigProvider,Modal,Tabs,TabPane,Button,Input,Divider,Popover} from 'ant-design-vue';
  
  const AConfigProvider = ConfigProvider
  const AModal = Modal
  const ATabs = Tabs
  const ATabPane = TabPane
  const ADivider = Divider
  const APopover = Popover
  const AButton = Button;
  const AInput = Input;

  // const props = withDefaults(defineProps<FormControlModalProps>(), {})

  const props = defineProps({
    title: {
      type: String,
      default: "",
    },
    type: {
      type: String as PropType<ControlType>,
      default: ControlType.TEXT,
    },
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
      type:Object,
      default:()=>{}
    }
  })

  console.log(props.context);
  

  // 支持编辑数据源的控件
  // const dataSourceControlTypes = [ControlType.RADIO, ControlType.SELECT, ControlType.CHECKBOX]

  const baseFormRef = ref()
  const dataSourceFormRef = ref()
  const authFormRef = ref()
  const verifyFormRef = ref()
  const verifyRuleRef = ref()
  const eventEditorRef = ref()
  onMounted(() => {
    state.visible = true
  })

  const state = reactive<{
    visible: boolean
    title: string
    baseFormData: any
    baseFormItems: FormItemType[]
    dataSourceTableOption: EditTableProps
    // dataSourceTableData: any
    dataSourceFormItems: FormItemType[]
    dataSourceFormData: any
    authFormItems: FormItemType[]
    authFormData: any
    verifyFormItems: FormItemType[]
    verifyFormData: any
    verifyRuleData: any
    customAttrTableOption: EditTableProps
    customAttrTableData: any
    staticOptionsTableOption: EditTableProps
    staticOptionsTableData: any
  }>({
    visible: false,
    title: '',
    baseFormData: {},
    baseFormItems: [],
    dataSourceTableOption: {
      isAdd: true,
      columns: [
        {
          title: '名称',
          dataIndex: 'label',
          itemRender: {
            name: 'input',
          },
        },
        {
          title: '值',
          dataIndex: 'value',
          itemRender: {
            name: 'input',
          },
        },
        {
          title: '操作',
          dataIndex: 'id',
          itemRender: {
            name: 'delete-button',
          },
        },
      ],
      data: [{ label: '', value: '' }],
    },
    // dataSourceTableData: [],
    dataSourceFormItems: [
      {
        title: '数据值路径',
        field: 'valuePath',
        type: FormInputType.INPUT,
        props: {
          placeholder: '如：root.a.b[0].c',
        },
      },
      {
        title: '选项路径',
        field: 'optionsPath',
        type: FormInputType.INPUT,
        props: {
          placeholder: '如：root.a.b[0].c',
        },
      },
      {
        title: 'Value字段',
        field: 'valueField',
        type: FormInputType.INPUT,
      },
      {
        title: 'Text字段',
        field: 'textField',
        type: FormInputType.INPUT,
      },
    ],
    dataSourceFormData: {},
    authFormItems: [
      {
        title: '允许被删除',
        field: 'isDelete',
        type: FormInputType.CHECKBOX,
      },
      {
        title: '只读',
        field: 'readonly',
        type: FormInputType.SELECT,
        props: {
          options: [
            {
              value: 'inherit',
              label: '继承父级',
            },
            {
              value: 'true',
              label: '是',
            },
            {
              value: 'false',
              label: '否',
            },
          ],
        },
      },
      {
        title: '加密显示',
        field: 'encryption',
        type: FormInputType.SELECT,
        props: {
          options: [
            {
              value: 'none',
              label: '不加密',
            },
            {
              value: 'showHT',
              label: '部分加密，仅显示首尾字符',
            },
            {
              value: 'phoneEncrypt',
              label: '手机号加密，隐藏中间4位',
            },
            {
              value: 'all',
              label: '全部加密',
            },
          ],
        },
      },

      // {
      //   title: '允许键盘输入',
      //   field: 'isKeyboard',
      //   type: FormInputType.CHECKBOX,
      // },
      {
        title: '计算表达式',
        field: 'calcExpression',
        type: FormInputType.INPUT,
      },
      {
        title: '可见表达式',
        field: 'visibleExpression',
        type: FormInputType.SLOT,
        slot: 'expressionSlot',
      },
      {
        title: '打印可见表达式',
        field: 'printVisibleExpression',
        type: FormInputType.INPUT,
        titleWidth: 120,
      },
    ],
    authFormData: {
      readonly: 'inherit',
      encryption: 'none',
      isDelete: true,
    },
    verifyFormItems: [
      {
        title: '必填',
        field: 'require',
        type: FormInputType.CHECKBOX,
      },
      {
        title: '',
        field: 'cell',
        colon: false,
        type: FormInputType.TEXT,
      },
      {
        title: '错误提示',
        field: 'errorText',
        type: FormInputType.INPUT,
      },
      {
        title: '禁止录入字符',
        field: 'prohibitKeywords',
        type: FormInputType.INPUT,
      },
    ],
    verifyFormData: {},
    verifyRuleData: {},
    customAttrTableOption: {
      isAdd: true,
      notDataHiddenTable: true,
      columns: [
        {
          title: '名称',
          dataIndex: 'label',
          itemRender: {
            name: 'input',
          },
        },
        {
          title: '值',
          dataIndex: 'value',
          itemRender: {
            name: 'input',
          },
        },
        {
          title: '操作',
          dataIndex: 'id',
          itemRender: {
            name: 'delete-button',
          },
        },
      ],
    },
    customAttrTableData: [],
    staticOptionsTableOption: {
      isAdd: true,
      notDataHiddenTable: true,
      columns: [
        {
          title: '名称',
          dataIndex: 'label',
          itemRender: {
            name: 'input',
          },
        },
        {
          title: '值',
          dataIndex: 'value',
          itemRender: {
            name: 'input',
          },
        },
        {
          title: '操作',
          dataIndex: 'id',
          itemRender: {
            name: 'delete-button',
          },
        },
      ],
    },
    staticOptionsTableData: [],
  })

  let currentFormControl: FormControlHooksResult = {
    baseFormItems: [],
    onSubmit: () => {},
  }

  const defaultBaseFormItems = [
    {
      title: '名称',
      field: 'name',
      type: FormInputType.INPUT,
      rules: [{ required: true, message: '请输入名称', trigger: 'change' }],
    },
    {
      title: '字段',
      field: 'field',
      type: FormInputType.INPUT,
      rules: [{ required: true, message: '请输入字段名', trigger: 'change' }],
    },
    {
      title: '默认值',
      field: 'default',
      type: FormInputType.INPUT,
    },
    // {
    //   title: '是否必填',
    //   field: 'require',
    //   type: FormInputType.CHECKBOX,
    // },
    {
      title: '背景文本',
      field: 'placeholder',
      type: FormInputType.INPUT,
    },
    {
      title: '提示文本',
      field: 'tip',
      type: FormInputType.INPUT,
    },
    {
      title: '标签文本',
      field: 'labelText',
      type: FormInputType.INPUT,
    },
    {
      title: '单位文本',
      field: 'unitText',
      type: FormInputType.INPUT,
    },
    // {
    //   title: '最小宽度',
    //   field: 'minWidth',
    //   type: FormInputType.NUMBER,
    // },
    // {
    //   title: '对齐方式',
    //   field: 'align',
    //   type: FormInputType.SELECT,
    //   props: {
    //     options: [
    //       { value: 'left', label: '左对齐' },
    //       { value: 'center', label: '居中对齐' },
    //       { value: 'right', label: '右对齐' },
    //     ],
    //   },
    // },
    // {
    //   title: '文字颜色',
    //   field: 'textColor',
    //   type: FormInputType.COLOR,
    // },
    // {
    //   title: '打印显示',
    //   field: 'printView',
    //   type: FormInputType.SELECT,
    //   props: {
    //     options: [
    //       { value: 1, label: '显示' },
    //       { value: 2, label: '不显示' },
    //     ],
    //   },
    // },
  ]

  const modalTitle = {
    [ControlType.TEXT]: '文本域',
    [ControlType.RADIO]: '单选框',
    [ControlType.DATE]: '日期',
    [ControlType.CHECKBOX]: '复选框',
    [ControlType.SELECT]: '下拉框',
  }
  if (props.title) {
    state.title = props.title
  } else {
    state.title = modalTitle[props.type]
  }

  if (props.type == ControlType.TEXT) {
    currentFormControl = useTextControl()
    state.dataSourceFormItems = state.dataSourceFormItems.filter((p) =>
      ['valuePath'].includes(p.field),
    )
  }  else if (props.type == ControlType.RADIO) {
    currentFormControl = useRadioControl()
  } else if (props.type == ControlType.DATE) {
    currentFormControl = useDateControl()
    state.dataSourceFormItems = state.dataSourceFormItems.filter((p) =>
      ['valuePath'].includes(p.field),
    )
  } else if (props.type == ControlType.CHECKBOX) {
    currentFormControl = useCheckboxControl()
  } else if (props.type == ControlType.SELECT) {
    currentFormControl = useSelectControl()
  }

  state.baseFormItems = [...defaultBaseFormItems, ...currentFormControl.baseFormItems]

  if (props.context && props.context.hoverElement) {
    // 编辑属性时，赋值表单
    const extension: any = props.context.hoverElement?.control?.extension
    if (extension) {
      state.baseFormData = extension
      state.dataSourceFormData = extension.dataSource
      if (extension.dataSource && extension.dataSource.staticOptions) {
        state.staticOptionsTableData = extension.dataSource.staticOptions
      }
      if (extension.customAttr && extension.customAttr.length) {
        state.customAttrTableData = extension.customAttr
      }
      if (extension.verifyRule) {
        state.verifyFormData = extension.verifyRule
        state.verifyRuleData = extension.verifyRule
      }
      if (extension.authData) {
        state.authFormData = extension.authData
      }
      // if (extension.eventData) {

      // }

      // state.dataSourceTableData = extension.options || []
    }
  } else {
    const field = getNewFieldName()
    state.baseFormData = {
      field,
    }
    // if (dataSourceControlTypes.includes(props.type)) {
    // state.dataSourceTableData = [{ label: '', value: '' }]
    // }
  }

  async function onModalSubmit() {
    const baseFormData = await baseFormRef.value.onSubmit()
    const dataSourceFormData = await dataSourceFormRef.value.onSubmit()
    const customAttr = state.customAttrTableData
    let verifyFormData = {}
    if (verifyFormRef.value && verifyFormRef.value.onSubmit) {
      verifyFormData = await verifyFormRef.value.onSubmit()
    }
    let verifyRuleData = state.verifyRuleData
    if (verifyRuleRef.value && verifyRuleRef.value.getData) {
      verifyRuleData = verifyRuleRef.value.getData()
    }
    let authData = state.authFormData
    if (authFormRef.value && authFormRef.value.onSubmit) {
      authData = await authFormRef.value.onSubmit()
    }
    const staticOptions = state.staticOptionsTableData
    let eventData = []
    if (eventEditorRef.value && eventEditorRef.value.getData) {
      eventData = eventEditorRef.value.getData()
    }

    const values = {
      ...baseFormData,
      dataSource: {
        ...dataSourceFormData,
      },
      customAttr: [...customAttr],
      verifyRule: { ...verifyFormData, ...verifyRuleData },
      authData,
      eventData,
    }
    if (staticOptions && staticOptions.length) {
      values.dataSource.staticOptions = staticOptions
    }

    // const dataSource = state.dataSourceTableData.filter((p) => p.value)
   
    await currentFormControl.onSubmit({ values, context: props.context,command:props.command })
    onModalCancel()
  }
  function onModalCancel() {
    state.visible = false
  }
  // function onDataSourceTableAddRow() {
  //   state.dataSourceTableData.push({
  //     id: `-${createRandKey()}`,
  //   })
  // }
  // function onDataSourceTableDeleteRow(row) {
  //   state.dataSourceTableData = state.dataSourceTableData.filter((p) => p.id != row.id)
  // }
  function onCustomAttrTableAddRow() {
    state.customAttrTableData.push({
      id: `-${createRandKey()}`,
    })
  }
  function onCustomAttrTableDeleteRow(row:any) {
    state.customAttrTableData = state.customAttrTableData.filter((p:any) => p.id != row.id)
  }
  function onStaticOptionsTableAddRow() {
    state.staticOptionsTableData.push({
      id: `-${createRandKey()}`,
    })
  }
  function onStaticOptionsTableDeleteRow(row:any) {
    state.staticOptionsTableData = state.staticOptionsTableData.filter((p:any) => p.id != row.id)
  }

  function onTabsChange(key:string) {
    console.log(key)
    if (props.context &&  props.context.hoverElement) {
      if (key == 'verify') {
        // 编辑属性时，赋值表单
        const extension: any = props.context.hoverElement?.control?.extension
        if (extension) {
          if (extension.verifyRule) {
            setTimeout(() => {
              verifyRuleRef.value.setData(extension.verifyRule)
            }, 200)
          }
        }
      } else if (key == 'event') {
        const extension: any = props.context.hoverElement?.control?.extension
        if (extension) {
          if (extension.eventData) {
            setTimeout(() => {
              eventEditorRef.value.setData(extension.eventData)
            }, 200)
          }
        }
      }
    }
  }
</script>

<style lang="css" scoped>
  :deep(.ant-divider-horizontal.ant-divider-with-text) {
    margin: 5px 0;
  }
</style>
