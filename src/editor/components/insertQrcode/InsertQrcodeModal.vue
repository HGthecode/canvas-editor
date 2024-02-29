<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="600"
      :maskClosable="false"
      title="插入二维码"
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
          <img v-if="state.viewRrcode" :src="state.viewRrcode" />
        </div>
      </div>
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { reactive,ref,onMounted,PropType } from 'vue'
  import DataForm from '../../components/DataForm'
  import { FormInputType, FormItemType } from '../../components/DataForm/interface'
  import { ElementType } from '../../index'
  import QRCode from 'qrcode'
  import { message } from 'ant-design-vue'
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import { IContextMenuContext } from '../../interface/contextmenu/ContextMenu'
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
    viewRrcode: string
  }>({
    visible: false,
    baseFormData: {
      height: 100,
      width: 100,
      correctLevel: 'L',
      colorDark: '#000000',
      colorLight: '#ffffff',
    },
    baseFormItems: [
      {
        title: '条码内容',
        field: 'content',
        type: FormInputType.INPUT,
        colspan: 2,
        props: {
          placeholder: '请输入内容',
        },
        rules: [{ required: true, message: '请输入内容', trigger: 'change' }],
      },
      {
        title: '容错等级',
        field: 'correctLevel',
        type: FormInputType.SELECT,
        props: {
          options: [
            {
              label: '容错率~7%',
              value: 'L',
            },
            {
              label: '容错率~15%',
              value: 'M',
            },
            {
              label: '容错率~25%',
              value: 'Q',
            },
            {
              label: '容错率~30%',
              value: 'H',
            },
          ],
        },
      },
      {
        title: '二维码尺寸',
        field: 'width',
        type: FormInputType.NUMBER,
        props: {
          formatter: (value:number) => `${value}px`,
          parser: (value:string) => value.replace('px', ''),
        },
      },
      {
        title: '前景色',
        field: 'colorDark',
        type: FormInputType.COLOR,
      },
      {
        title: '背景色',
        field: 'colorLight',
        type: FormInputType.COLOR,
      },
    ],
    viewErrorText: '',
    viewRrcode: '',
  })

  if (props.context && props.context.startElement) {
    // 编辑属性时，赋值表单
    const extension = props.context.startElement?.extension
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
      var opts = {
        errorCorrectionLevel: formData.correctLevel,
        type: 'image/jpeg',
        quality: 0.3,
        margin: 1,
        width: formData.width,
        color: {
          dark: formData.colorDark,
          light: formData.colorLight,
        },
      }
      QRCode.toDataURL(content, opts, function (err:any, url:string) {
        if (err) throw err
        state.viewRrcode = url
      })

      state.viewErrorText = ''
    } catch (error) {
      state.viewErrorText = '错误的数据格式'
      console.log(error)
    }
  }

  async function onModalSubmit() {
    const formData = await baseFormRef.value.onSubmit()
   
    if (!state.viewRrcode) {
      message.error('请输入二维码内容')
      return
    }
    if (props.context && props.context.startElement) {
      //编辑时
      props.command.replaceImageElement(state.viewRrcode, {
        value: '',
        width: formData.width,
        height: formData.height,
        extension: { type: 'qrcode', options: formData },
      })
    } else {
      // 插件安装模式的调用方法参考
      // const command = <CommandWithBarcode>editorStore.editor?.command
      // command.executeInsertBarcode1D(formData.content, width, height,formData)
      props.command.insertElementList([
        {
          type: ElementType.IMAGE,
          value: state.viewRrcode,
          width: formData.width,
          height: formData.height,
          extension: { type: 'qrcode', options: formData },
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
    padding: 10px;
    min-height: 120px;
  }
</style>
