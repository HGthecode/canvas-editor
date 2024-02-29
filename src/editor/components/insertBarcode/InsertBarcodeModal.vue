<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="600"
      :maskClosable="false"
      title="插入条形码"
      destroyOnClose
      @ok="onModalSubmit"
      @cancel="onModalCancel"
    >
      <a-divider orientation="left">配置</a-divider>
      <data-form
        ref="baseFormRef"
        :colspan="2"
        :items="state.baseFormItems"
        :data="state.baseFormData"
        @change="onFormChange"
      />
      <a-divider orientation="left">预览</a-divider>
      <div class="barcode-warper">
        <div v-if="state.viewErrorText" class="error-text">{{ state.viewErrorText }}</div>
        <div v-show="!state.viewErrorText">
          <!-- eslint-disable-next-line vue/html-self-closing-->
          <svg id="barcode1d"></svg>
        </div>
      </div>
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { ref,reactive,onMounted,PropType } from 'vue'
  import DataForm from '../../components/DataForm'
  import { FormInputType, FormItemType } from '../../components/DataForm/interface'
  import { defaultAlignWay } from '../../dataset/constant/Editor'
  import JsBarcode from 'jsbarcode'
  import { convertSvgElementToBase64 } from '../../utils/helper'
  import { ElementType } from '../../index'
  import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'

  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import {ConfigProvider,Modal,Divider} from 'ant-design-vue';
  const AConfigProvider =ConfigProvider
  const AModal = Modal
  const ADivider = Divider


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
      type:Object,
      default:()=>{}
    }
  })

  const baseFormRef = ref()

  onMounted(() => {
    state.visible = true
  })

  const state = reactive<{
    visible: boolean
    baseFormData: any
    baseFormItems: FormItemType[]
    viewErrorText: string
  }>({
    visible: false,
    baseFormData: {
      format: 'CODE128',
      textAlign: 'center',
      textPosition: 'bottom',
      fontSize: 20,
      lineColor: '#000000',
      displayValue: true,
      height: 100,
    },
    baseFormItems: [
      {
        title: '条码类型',
        field: 'format',
        type: FormInputType.SELECT,
        props: {
          options: [
            { label: '自动', value: '' },
            { label: 'CODE128A', value: 'CODE128A' },
            { label: 'CODE128B', value: 'CODE128B' },
            { label: 'CODE128C', value: 'CODE128C' },

            { label: 'EAN2', value: 'EAN2' },
            { label: 'EAN5', value: 'EAN5' },
            { label: 'EAN8', value: 'EAN8' },
            { label: 'EAN13', value: 'EAN13' },
            { label: 'UPC', value: 'UPC' },

            { label: 'CODE39', value: 'CODE39' },
            { label: 'ITF-14', value: 'ITF-14' },
            { label: 'MSI', value: 'MSI' },
            { label: 'Pharmacode', value: 'Pharmacode' },
            { label: 'Codabar', value: 'Codabar' },
          ],
        },
      },
      {
        title: '条码内容',
        field: 'content',
        type: FormInputType.INPUT,
        props: {
          placeholder: '请输入内容',
        },
        rules: [{ required: true, message: '请输入内容', trigger: 'change' }],
      },
      {
        title: '文本对齐方式',
        field: 'textAlign',
        type: FormInputType.SELECT,
        props: {
          options: defaultAlignWay,
        },
      },
      {
        title: '文本位置',
        field: 'textPosition',
        type: FormInputType.SELECT,
        props: {
          options: [
            { label: '条码上方', value: 'top' },
            { label: '条码下方', value: 'bottom' },
          ],
        },
      },
      {
        title: '条码高度',
        field: 'height',
        type: FormInputType.NUMBER,
      },
      {
        title: '文本字体大小',
        field: 'fontSize',
        type: FormInputType.NUMBER,
      },
      {
        title: '条码颜色',
        field: 'lineColor',
        type: FormInputType.COLOR,
      },
      {
        title: '是否显示文字',
        field: 'displayValue',
        type: FormInputType.CHECKBOX,
      },
    ],
    viewErrorText: '',
  })

  if (props.context && props.context.startElement) {
    // 编辑属性时，赋值表单
    const extension = props.context.startElement?.extension
    console.log('startElement',props.context.startElement);
    
    if (extension) {
      state.baseFormData = extension.options
      if (state.baseFormData.content) {
        setTimeout(() => {
          onFormChange()
        }, 500)
      }
    }
  }
  function onFormChange() {
    const formData = baseFormRef.value.getData()
    const content = formData.content
    try {
      JsBarcode('#barcode1d', content, formData)
      state.viewErrorText = ''
    } catch (error) {
      state.viewErrorText = '错误的数据格式'
    }
  }

  async function onModalSubmit() {
    const formData = await baseFormRef.value.onSubmit()
    
    const command = props.command
    const barcodeElement = document.querySelector<HTMLElement>('#barcode1d')!
    let width = 150
    let height = formData.height
    const widthStr = barcodeElement.getAttribute('width')
    const heightStr = barcodeElement.getAttribute('height')
    if (widthStr) {
      width = parseInt(widthStr)
    }
    if (heightStr) {
      height = parseInt(heightStr)
    }
    const svgElement = convertSvgElementToBase64(barcodeElement)
    
    if (props.context && props.context.startElement) {
      //编辑时
      command.replaceImageElement(svgElement, {
        value: '',
        width,
        height,
        extension: { type: 'barcode', options: formData },
      })
    } else {
      // 插件安装模式的调用方法参考
      // const command = <CommandWithBarcode>editorStore.editor?.command
      // command.executeInsertBarcode1D(formData.content, width, height,formData)
      command.insertElementList([
        {
          type: ElementType.IMAGE,
          value: svgElement,
          width,
          height,
          extension: { type: 'barcode', options: formData },
        },
      ])
    }
    onModalCancel()
  }

  function onModalCancel() {
    state.visible = false
  }
</script>

<style lang="css" scoped>
  .barcode-warper {
    text-align: center;
    height: 150px;
  }
</style>
